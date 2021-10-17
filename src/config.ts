import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { compatESModuleRequire } from './utils';
import { ROOT_DIR, I18N_GLOB } from './constants';

/**
 * 获取 ftintl 配置文件 (cli 共用)
 */
export const getFastIntlConfigFile = () => {
  let configPath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/.ftintlrc.js`;

  if (!fs.existsSync(configPath)) {
    configPath = `${vscode.workspace.workspaceFolders?.[0].uri.path}/.ftintlrc.ts`;

    if (!fs.existsSync(configPath)) {
      return null;
    }
  }

  return configPath;
};

/**
 * 获取配置，支持从vscode和配置文件(优先)中取到配置项
 */
export function getValFromConfiguration(key: string) {
  let value = vscode.workspace
    .getConfiguration('vscode-fast-intl')
    .get(key) as string;

  let configPath = getFastIntlConfigFile();
  if (!configPath) {
    return value;
  }

  const config = compatESModuleRequire(require(configPath));

  if (key in config) {
    value = config[key];
  }

  return value;
}

export function getTargetLangPath(currentFilePath: string) {
  let targetLangPath = path.resolve(
    ROOT_DIR,
    getValFromConfiguration('langDir'),
    getValFromConfiguration('defaultLang'),
  );

  const projects: any = getValFromConfiguration('projects') || [];

  for (const config of projects) {
    if (currentFilePath.indexOf(`/${config.target}/`) > -1) {
      targetLangPath = path.resolve(
        ROOT_DIR,
        config.langDir,
        config.defaultLang,
      );
      return targetLangPath;
    }
  }

  return targetLangPath;
}

export function getCurrentProjectLangPath() {
  const targetLangPath = getTargetLangPath(
    vscode.window.activeTextEditor?.document.uri.path as string,
  );

  return `${targetLangPath}/${I18N_GLOB}`;
}

/**
 * 获取当前文件对应的语言路径
 */
export function getLangPrefix() {
  const langPrefix = getTargetLangPath(
    vscode.window.activeTextEditor?.document.uri.path as string,
  );
  return langPrefix;
}
