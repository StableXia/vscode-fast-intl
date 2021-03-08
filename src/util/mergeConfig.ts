import { IFastIntlConfig } from "../types";

export function mergeFastIntlConfig(...args: Array<Partial<IFastIntlConfig>>): IFastIntlConfig {
  return Object.assign({}, ...args);
}
