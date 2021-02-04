import * as vscode from "vscode";
import { findChineseText } from "./findChineseText";

/**
 * 中文提示样式标记
 */
function getChineseCharDecoration() {
  return vscode.window.createTextEditorDecorationType({
    borderWidth: "1px",
    borderStyle: "dotted",
    overviewRulerColor: "red",
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    light: {
      borderColor: "red",
    },
    dark: {
      borderColor: "red",
    },
  });
}

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
      activeEditor?.setDecorations(prevChineseCharDecoration, []);
    }

    const { targetStrs, chineseCharDecoration } = updateDecorations() || {};
    prevChineseCharDecoration = chineseCharDecoration as vscode.TextEditorDecorationType;
    callback(targetStrs);
  }, 500);
}

/**
 * 更新国际化相关标识
 */
export function updateDecorations() {
  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) {
    return;
  }

  const currentFilename = activeEditor.document.fileName;
  const chineseCharDecoration = getChineseCharDecoration();

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

  /** 设置 I18N 的提示 */
  //  setLineDecorations(activeEditor);
  /** 设置中文的提示 */
  activeEditor.setDecorations(chineseCharDecoration, chineseChars);

  return { targetStrs, chineseCharDecoration };
}
