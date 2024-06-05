import * as fs from "fs";
import * as path from "path";
import jiti from "jiti";

const load = jiti(__filename, {
  //debug: true,
});

import {
  Callback,
  FileSystemLoader,
  FileSystemLoaderOptions,
  ILoader,
  ILoaderAsync,
  Loader,
  LoaderSource,
} from "nunjucks";
import { grob } from "@wolfpkgs/core/grob";

export type TemplateFile = {
  input: string;
  output: string;
};

export class TemplateLoader extends Loader implements ILoaderAsync {
  public "async": true = true;
  public static "async"?: true | undefined = true;

  private templateName: string;

  private localDirs: string[];
  private projectDirs: string[];
  private macroDirs: string[];
  private templatesDirs: string[];

  constructor(templateName: string, projectDirs: string[]) {
    super();

    this.templateName = templateName;

    this.projectDirs = projectDirs ?? [];

    this.macroDirs = this.projectDirs
      .map((dir) => path.join(dir, "macros"))
      .filter((dir) => fs.existsSync(dir));

    this.templatesDirs = this.projectDirs
      .map((dir) => path.join(dir, "templates"))
      .filter((dir) => fs.existsSync(dir));

    this.localDirs = this.projectDirs
      .map((dir) => path.join(dir, "templates", templateName))
      .filter((dir) => fs.existsSync(dir));
  }

  public getTemplateDirs() {
    return this.projectDirs
      .map((dir) => path.join(dir, "templates", this.templateName))
      .filter((dir) => fs.existsSync(dir))
      .map((dir) => path.resolve(dir));
  }

  public getTemplatesDirs() {
    return this.projectDirs
      .map((dir) => path.join(dir, "templates"))
      .filter((dir) => fs.existsSync(dir))
      .map((dir) => path.resolve(dir));
  }

  public getMacroDirs() {
    return this.projectDirs
      .flatMap((dir) => [path.join(dir, "macros")])
      .filter((dir) => fs.existsSync(dir));
  }

  public getFilterDirs() {
    return this.projectDirs
      .flatMap((dir) => [path.join(dir, "extensions/filters")])
      .filter((dir) => fs.existsSync(dir));
  }

  public getTagsDirs() {
    return this.projectDirs
      .flatMap((dir) => [path.join(dir, "extensions/tags")])
      .filter((dir) => fs.existsSync(dir));
  }

  async getFiles(): Promise<TemplateFile[]> {
    const files: TemplateFile[] = [];

    for (const root of this.getTemplateDirs()) {
      const discovered = await grob.glob("**/*.njk", {
        cwd: root,
        absolute: true,
      });

      files.push(
        ...discovered
          .map((file) => path.relative(root, file))
          .map((file) => ({
            input: file,
            output: file.replace(/.njk$/i, ""),
          }))
          .filter((file) => {
            return file.input != file.output;
          })
          .map((file) => ({
            input: path.join(root, file.input),
            output: file.output,
          })),
      );
    }

    return files.map(({ input, output }) => ({
      input: path.resolve(input),
      output,
    }));
  }

  async getFilterFiles(): Promise<string[]> {
    const files: string[] = [];

    for (const dir of this.getFilterDirs()) {
      files.push(
        ...(
          await grob.glob("**/*.{ts,mts,cts,js,mjs,cjs}", {
            cwd: dir,
            ignore: ["**/*.d.ts"],
          })
        )
          .filter((name, _, files) => {
            if (name.endsWith("js")) {
              return files.indexOf(name.replace(/js$/i, "ts")) < 0;
            }
            return true;
          })
          .map((name) => path.join(dir, name)),
      );
    }

    return files;
  }

  async getFilters(): Promise<Record<string, (...args: any[]) => any>> {
    const files: string[] = await this.getFilterFiles();
    const filters: Record<string, (...args: any[]) => any> = {};

    for (const file of files) {
      let filter: any = load(file);
      if (typeof filter === "object") {
        Object.assign(filters, filter);
      }
    }

    return filters;
  }

  public async getSource(
    name: string,
    callback: Callback<Error, LoaderSource>,
  ): Promise<void> {
    let type: string = "default";
    let request: string = name;

    if (name.indexOf(":") > 0) {
      if (!fs.existsSync(name)) {
        const parts = name.split(":", 2);
        type = parts[0]!;
        request = parts.slice(1)[0]!;
      }
    }

    let searchPaths: string[] = [];
    let fullpath: string | null = null;

    if (type == "default") {
      searchPaths = this.getTemplateDirs();
    } else if (type == "template") {
      searchPaths = this.getTemplatesDirs();
    } else if (type == "macro") {
      searchPaths = this.macroDirs;
    } else if (type == "module") {
      try {
        fullpath = require.resolve(request);
      } catch (err) {
        try {
          fullpath = await import(request);
        } catch (err) {
          fullpath = null;
        }
      }
    }

    if (!fullpath && searchPaths.length) {
      for (const searchDir of searchPaths) {
        const basePath = path.resolve(searchDir);
        const candidates = [
          path.resolve(searchDir, request),
          path.resolve(searchDir, `${request}.njk`),
        ];
        for (const candidate of candidates) {
          if (candidate.indexOf(basePath) === 0 && fs.existsSync(candidate)) {
            fullpath = candidate;
            break;
          }
        }
        if (fullpath) {
          break;
        }
      }
    }

    if (!fullpath) {
      try {
      } catch (err) {}
    }

    if (!fullpath) {
      callback(new Error("Template not found"), null);
      return;
    }

    const source = {
      src: fs.readFileSync(fullpath, "utf-8"),
      path: fullpath,
      noCache: true,
    };

    this.emit("load", name, source);

    callback(null, source);
  }
}
