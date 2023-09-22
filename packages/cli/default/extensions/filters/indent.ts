export function indent(value: string, size: number) {
  const indent = new Array(size + 1).join(" ");
  return `${indent}${value.split("\n").join(`\n${indent}`)}`;
}
