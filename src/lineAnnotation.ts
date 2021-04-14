import * as vscode from "vscode";
import * as _ from "lodash";
import { findI18NPositions, Position } from "./findI18NPositions";

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

/**
 * 转换位置
 * @param pos
 * @param editorText
 * @param toLastCol 是否是行尾
 */
export function transformPosition(pos: Position, editorText: string, toLastCol?: boolean) {
  const { start, code } = pos;
  const width = code.length;
  let lines, line, ch;

  if (start !== undefined) {
    lines = editorText.slice(0, start + 1).split("\n");
    /** 当前所在行 */
    line = (pos as any).line || lines.length - 1;
    /** I18N 开始的 col */
    ch = lines[line].length;
  } else {
    lines = editorText.split("\n");
    line = (pos as any).line;
    ch = lines[line].length;
  }

  let first, last;
  if (toLastCol) {
    const lineLastCol = _.get(editorText.split("\n"), [line, "length"]);
    first = new vscode.Position(line, lineLastCol);
    last = new vscode.Position(line, width + lineLastCol);
  } else {
    first = new vscode.Position(line, ch);
    last = new vscode.Position(line, ch + width);
  }
  return new vscode.Range(first, last);
}

export function setLineDecorations(activeEditor: vscode.TextEditor) {
  const code = activeEditor.document.getText();
  const positions = findI18NPositions(code);
  let decorations = [];
  decorations = positions?.map((pos) => {
    const toLastCol = true;
    const range = transformPosition(pos, code, toLastCol);
    return {
      range,
      renderOptions: {
        after: {
          color: "#999999",
          contentText: `文案: ${pos.cn.replace("\n", " \\n")}`,
          fontWeight: "normal",
          fontStyle: "normal",
          textDecoration: "none;",
        },
      },
    };
  });

  activeEditor.setDecorations(annotationDecoration, decorations as vscode.Range[] | vscode.DecorationOptions[]);
}
