import * as fs from "fs";
import { getTargetLangPath } from "../configs";

export function getLangData(filePath: string) {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
    return eval("(" + fileContent + ")");
  } else {
    return {};
  }
}

export function getI18N() {
  const filePath = getTargetLangPath();
  const langData = getLangData(filePath);
  return langData;
}

export function getSuggestLangObj() {
  const langObj = getI18N();
  return langObj;
}
