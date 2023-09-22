export function regex_replace(
  value: string,
  regex: string,
  replacement: string,
) {
  return value.replace(new RegExp(regex, "g"), replacement);
}
