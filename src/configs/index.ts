import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

/**
 * 获取 fast-intl 配置文件
 */
export function getFastIntlConfigFile() {
  let fastIntlConfigJson = null;
  const fastIntlConfigFilePath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/fast-intl.config.ts`;

  try {
    fastIntlConfigJson = fs.existsSync(fastIntlConfigFilePath) ? require(fastIntlConfigFilePath) : null;
  } catch (err) {
    console.error(`Error in [getFastIntlConfigFile]: \n`, err);
  }

  return fastIntlConfigJson;
}

export function getZHCNLangPath() {
  let targetLangPath = "";

  const configFile = getFastIntlConfigFile();

  if (configFile) {
    targetLangPath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/${configFile.fastIntlDir}/zh-cn.json`;
  }

  return path.resolve(targetLangPath);
}
