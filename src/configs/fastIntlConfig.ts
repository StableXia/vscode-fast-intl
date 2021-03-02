import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { mergeFastIntlConfig } from "../utils";
import { DEFAULT_FAST_INTL_CONFIG } from "../constants";

/**
 * 获取 fast-intl 配置文件
 */
export function getFastIntlConfigFile() {
  let fastIntlConfigJson = null;
  const fastIntlConfigFilePath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/fast-intl.config.js`;

  fastIntlConfigJson = fs.existsSync(fastIntlConfigFilePath) ? require(fastIntlConfigFilePath) : null;

  return mergeFastIntlConfig(DEFAULT_FAST_INTL_CONFIG, fastIntlConfigJson);
}

export function getTargetLangPath() {
  let targetLangPath = "";

  const configFile = getFastIntlConfigFile();

  if (configFile) {
    targetLangPath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/${configFile.fastIntlDir}/${configFile.targetLang}.json`;
  }

  return path.resolve(targetLangPath);
}
