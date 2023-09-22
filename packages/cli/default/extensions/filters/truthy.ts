export function truthy(condition: boolean, truthy: any, falsey: any) {
  if (condition) {
    return truthy;
  } else {
    if (typeof falsey != "undefined") {
      return falsey;
    }
  }
  return condition;
}
