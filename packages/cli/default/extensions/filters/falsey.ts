export function falsey(condition: boolean, falsey: any, truthy: any) {
  if (!condition) {
    return falsey;
  } else {
    if (typeof truthy != "undefined") {
      return truthy;
    }
  }
  return condition;
}
