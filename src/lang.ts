import * as fs from "fs";
import { getZhHansLangPath } from "./config";
import { flattenObj } from "./utils";

export function getLangData(filePath: string) {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
    return eval("(" + fileContent + ")");
  } else {
    return {};
  }
}

export function getI18N() {
  const filePath = getZhHansLangPath();
  console.log(2222, filePath);
  const langData = getLangData(filePath);
  return langData;
}

export function getSuggestLangObj() {
  const langObj = getI18N();
  console.log(3333, flattenObj(langObj));
  return flattenObj(langObj);
}
