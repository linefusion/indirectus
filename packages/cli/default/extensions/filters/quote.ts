export function quote(v: any) {
  v = `${v}`;
  if (typeof v == "string") {
    return JSON.stringify(v);
  } else if (Array.isArray(v)) {
    return v.map((e) => {
      if (typeof e == "string") {
        return JSON.stringify(e);
      } else {
        return e;
      }
    });
  }
  return v;
}

export const quoted = quote;
