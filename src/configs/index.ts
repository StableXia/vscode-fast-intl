import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

/**
 * 获取 fast-intl 配置文件
 */
export function getFastIntlConfigFile() {
  const fastIntlConfigFilePath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/fast-intl.config.ts`;

  if (!fs.existsSync(fastIntlConfigFilePath)) {
    return null;
  }

  let fastIntlConfigJson = null;

  try {
    fastIntlConfigJson = require(fastIntlConfigFilePath);
  } catch (err) {
    console.log(err);
  }

  return fastIntlConfigJson;
}

export function getTargetLangPath() {
  let targetLangPath = "";

  const configFile = getFastIntlConfigFile();

  if (configFile) {
    targetLangPath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/${configFile.fastIntlDir}/zh-cn.json`;
  }

  return path.resolve(targetLangPath);
}
