import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_FAST_INTL_CONFIG } from "../constants";

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

export function getTargetLangPath(currentFilePath: string) {
  const configFile = `${vscode.workspace.workspaceFolders?.[0].uri.path}/.fastIntl`;
  let targetLangPath = "";

  try {
    if (fs.existsSync(configFile)) {
      const { projects = [] } = JSON.parse(fs.readFileSync(configFile, "utf8"));

      for (const config of projects) {
        if (currentFilePath.indexOf(`/${config.target}/`) > -1) {
          targetLangPath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/${config.fastIntlDir}/zh_CN/`;
          return targetLangPath;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  return targetLangPath;
}

/**
 * 获取当前文件对应的项目路径
 */
export function getCurrentProjectLangPath() {
  let currentProjectLangPath = "";
  const targetLangPath = getTargetLangPath(vscode.window.activeTextEditor?.document.uri.path as string);
  if (targetLangPath) {
    currentProjectLangPath = `${targetLangPath}**/*.ts`;
  }
  return currentProjectLangPath;
}

/**
 * 获取当前文件对应的语言路径
 */
export function getLangPrefix() {
  const langPrefix = getTargetLangPath(vscode.window.activeTextEditor?.document.uri.path as string);
  return langPrefix;
}
