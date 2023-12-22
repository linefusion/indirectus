import * as njk from "nunjucks";
import { TemplateFile, TemplateLoader } from "./template-loader";
import type { Registry } from "./registry";
import type { Schema } from "./schema";

export interface TemplateRenderer {
  (file: string, context: any): Promise<string>;
  files: TemplateFile[];
}

export interface TemplateContext {
  registry: Registry;
  schema: Schema;
  [key: string]: any;
}

export async function createRenderer(
  template: string,
  dirs: string[],
): Promise<TemplateRenderer> {
  const loader = new TemplateLoader(template, dirs);
  if (!loader.getTemplateDirs().length) {
    throw new Error(`Could not find template "${template}"`);
  }

  const files = await loader.getFiles();
  async function render(file: string, context: any) {
    const filters = await loader.getFilters();

    const renderer = new njk.Environment(loader, {
      autoescape: false,
    });

    Object.entries(filters).forEach(([name, filter]) => {
      renderer.addFilter(name, (...args: any[]) => {
        return filter(context, ...args);
      });
    });

    return new Promise<string>((resolve, reject) => {
      renderer.render(file, context, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result ?? "");
      });
    });
  }

  return Object.assign(render, {
    files,
  });

  /*
  const renderer = new Liquid({
    root: templates,
    partials: partials,
    dynamicPartials: true,
    strictFilters: true,
    extname: ".liquid",
    ownPropertyOnly: false,
  });

  // String cases

  // TODO: move watcher + prettier here
  // TODO: turn to events

  return {
    renderer,
    directories: templates,
    files: await fetchTemplates(templates),
  };
  */
}
