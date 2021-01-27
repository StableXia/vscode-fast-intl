import * as vscode from "vscode";
import { findChineseText } from "./findChineseText";

let timeout: NodeJS.Timeout;
let prevChineseCharDecoration: vscode.TextEditorDecorationType;

export function triggerUpdateDecorations(callback: () => void) {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    const activeEditor = vscode.window.activeTextEditor;
    if (prevChineseCharDecoration) {
      /** 清除原有的提示 */
      activeEditor &&
        activeEditor.setDecorations(prevChineseCharDecoration, []);
    }

    updateDecorations();
    callback();
  }, 500);
}

export function updateDecorations() {
  const activeEditor = vscode.window.activeTextEditor;
  const currentFilename = activeEditor?.document.fileName;

  if (!activeEditor) {
    return;
  }

  const text = activeEditor.document.getText();
  let targetStrs = [];
  let chineseChars: vscode.DecorationOptions[] = [];

  findChineseText(text, currentFilename as string);
}
