import * as ts from "typescript";
import * as vscode from "vscode";
import { CHINESE_CHAR_REGEXP } from "./constants";
import { removeFileComment } from "./utils";

export function findTextInTs(code: string, fileName: string) {
  const activeEditor = vscode.window.activeTextEditor as vscode.TextEditor;

  if (!activeEditor) {
    return;
  }

  const matches: any[] = [];
  const ast = ts.createSourceFile(
    "",
    code,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX
  );

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.StringLiteral: {
        const { text } = node as ts.StringLiteral;

        if (text.match(CHINESE_CHAR_REGEXP)) {
          const start = node.getStart();
          const end = node.getEnd();
          const startPos = activeEditor.document.positionAt(start + 1);
          const endPos = activeEditor.document.positionAt(end - 1);
          const range = new vscode.Range(startPos, endPos);
          matches.push({
            range,
            text,
            isString: true,
          });
        }

        break;
      }

      case ts.SyntaxKind.JsxElement: {
        const { children } = node as ts.JsxElement;

        children.forEach((child) => {
          if (child.kind === ts.SyntaxKind.JsxText) {
            const text = child.getText();
            /** 修复注释含有中文的情况，Angular 文件错误的 Ast 情况 */
            const noCommentText = removeFileComment(text, fileName);

            if (noCommentText.match(CHINESE_CHAR_REGEXP)) {
              const start = child.getStart();
              const end = child.getEnd();
              const startPos = activeEditor.document.positionAt(start);
              const endPos = activeEditor.document.positionAt(end);
              const { trimStart, trimEnd } = trimWhiteSpace(
                code,
                startPos,
                endPos
              );
              const range = new vscode.Range(trimStart, trimEnd);

              matches.push({
                range,
                text: text.trim(),
                isString: false,
              });
            }
          }
        });

        break;
      }
    }

    ts.forEachChild(node, visit);
  }

  ts.forEachChild(ast, visit);

  console.log("matches", matches);

  return matches;
}

export function findChineseText(code: string, fileName: string) {
  return findTextInTs(code, fileName);
}
