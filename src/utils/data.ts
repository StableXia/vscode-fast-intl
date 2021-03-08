import * as _ from "lodash";

export function flattenObj(obj: { [key: string]: any }, prefix?: string) {
  const propName = prefix ? prefix + "." : "";
  const ret: { [key: string]: string } = {};

  for (let attr in obj) {
    if (_.isArray(obj[attr])) {
      ret[attr] = obj[attr].join(",");
    } else if (typeof obj[attr] === "object") {
      _.extend(ret, flattenObj(obj[attr], propName + attr));
    } else {
      ret[propName + attr] = obj[attr];
    }
  }
  return ret;
}
