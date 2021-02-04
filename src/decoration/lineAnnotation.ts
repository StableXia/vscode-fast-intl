import * as vscode from "vscode";

/**
 * I18N 中文显示位置
 */
const annotationDecoration: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
  after: {
    margin: "0 0 0 3em",
    textDecoration: "none",
  },
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
} as vscode.DecorationRenderOptions);

export function setLineDecorations(activeEditor: vscode.TextEditor) {
  activeEditor.setDecorations(annotationDecoration, []);
}
