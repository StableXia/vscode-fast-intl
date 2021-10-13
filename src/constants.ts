import * as vscode from 'vscode';

export const I18N_GLOB = `**/*.ts`;
export const ROOT_DIR = vscode.workspace.workspaceFolders?.[0].uri.path || '';
