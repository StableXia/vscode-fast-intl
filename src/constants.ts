import * as vscode from 'vscode';

export const DEFAULT_LANG = 'zh-hans';
export const DEFAULT_LANG_DIR = '.fastIntl';
export const DEFAULT_IGNORE_FILE = /\.(json|md|png|jpg|jpeg|svg)$/;
export const DEFAULT_IGNORE_DIR = /\.(node_modules|__tests__)$/;

export const I18N_GLOB = `**/*.ts`;
export const ROOT_DIR = vscode.workspace.workspaceFolders?.[0].uri.path || '';
