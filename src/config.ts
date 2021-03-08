import * as vscode from "vscode";
import * as fs from "fs";
import { getFileToJson } from "./utils";

/**
 * 获取 ftintl 配置文件 (cli)
 */
export const getFtintlConfigFile = () => {
  let ftintlConfigJson = `${vscode.workspace.workspaceFolders?.[0].uri.path}/.ftintlrc.js`;

  // 先找js
  if (!fs.existsSync(ftintlConfigJson)) {
    ftintlConfigJson = `${vscode.workspace.workspaceFolders?.[0].uri.path}/.ftintlrc.ts`;
    //再找ts
    if (!fs.existsSync(ftintlConfigJson)) {
      return null;
    }
  }

  return ftintlConfigJson;
};

/**
 * 获取 fast-intl 配置文件 (lang)
 */
export const getFastIntlConfigFile = () => {
  let fastIntlConfigJson = `${vscode.workspace.workspaceFolders?.[0].uri.path}/.fastIntl`;
  // 先找js
  if (!fs.existsSync(fastIntlConfigJson)) {
    return null;
  }
  return fastIntlConfigJson;
};

/**
 * 获取配置，支持从vscode和配置文件(优先)中取到配置项
 */
export function getValFromConfiguration(key: string) {
  let value = vscode.workspace.getConfiguration("vscode-fast-intl").get(key) as string;

  let ftintlConfigJson = getFtintlConfigFile();
  if (!ftintlConfigJson) {
    return value;
  }

  const config = getFileToJson(ftintlConfigJson);
  if (key in config) {
    value = config[key];
  }

  return value;
}

/**
 * 获取中文语言文件路径
 */
export function getZhHansLangPath() {
  let langPath = getValFromConfiguration("ZHHans");

  return langPath;
}
