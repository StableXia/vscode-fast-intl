import * as vscode from 'vscode';

export const I18N_GLOB = `**/*.[jt]s`;
export const ROOT_DIR = vscode.workspace.workspaceFolders?.[0].uri.path || '';
