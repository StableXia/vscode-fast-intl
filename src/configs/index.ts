import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

/**
 * 获取 fast-intl 配置文件
 */
export function getFastIntlConfigFile() {
  const fastIntlConfigJson = `${vscode.workspace.workspaceFolders?.[0].uri.path}/fast-intl.config.ts`;

  if (!fs.existsSync(fastIntlConfigJson)) {
    return null;
  }

  return fastIntlConfigJson;
}

export function getTargetLangPath() {
  const configFilePath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/fast-intl.config.ts`;
  let targetLangPath = "";

  try {
    if (fs.existsSync(configFilePath)) {
      const configFile = require(configFilePath);
      targetLangPath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/${configFile.fastIntlDir}/zh-cn.json`;
    }
  } catch (err) {
    console.log(err);
  }

  return path.resolve(targetLangPath);
}
