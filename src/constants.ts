import * as vscode from 'vscode';

export const ROOT_DIR = vscode.workspace.workspaceFolders?.[0].uri.path || '';
