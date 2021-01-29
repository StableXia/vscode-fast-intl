import * as vscode from "vscode";
import { findChineseText } from "./findChineseText";

let timeout: NodeJS.Timeout;
let prevChineseCharDecoration: vscode.TextEditorDecorationType;

export function triggerUpdateDecorations(callback: (payload: any) => void) {
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

    const { targetStrs, chineseCharDecoration } = updateDecorations() || {};
    // prevChineseCharDecoration = chineseCharDecoration;
    callback(targetStrs);
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

  targetStrs = findChineseText(text, currentFilename as string);
  targetStrs.map((match) => {
    const decoration = {
      range: match.range,
      hoverMessage: `检测到中文文案： ${match.text}`,
    };
    chineseChars.push(decoration);
  });

  return { targetStrs, chineseCharDecoration: {} };
}
