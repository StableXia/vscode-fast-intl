import * as vscode from "vscode";
import { ITargetStr } from "./types";
import { triggerUpdateDecorations } from "./chineseCharDecorations";

export function activate(context: vscode.ExtensionContext) {
  console.log(vscode?.workspace?.workspaceFolders?.[0].uri.path);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "vscode-fast-intl.helloFastIntl",
    () => {
      vscode.window.showInformationMessage("欢迎使用 vscode-fast-intl");
    }
  );
  context.subscriptions.push(disposable);

  let targetStrs: ITargetStr[] = [];
  let activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    triggerUpdateDecorations((newTargetStrs) => {
      targetStrs = newTargetStrs;
    });
  }

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [
        { scheme: "file", language: "typescriptreact" },
        { scheme: "file", language: "typescript" },
        { scheme: "file", language: "javascriptreact" },
        { scheme: "file", language: "javascript" },
      ],
      {
        provideCodeActions: function (document, range, context, token) {
          const targetStr = targetStrs.find(
            (t) => range.intersection(t.range) !== undefined
          );

          if (targetStr) {
            const sameTextStrs = targetStrs.filter(
              (t) => t.text === targetStr.text
            );

            console.log(sameTextStrs);
            return [
              {
                title: "111",
                command: "vscode-fast-intl.extractI18N",
                arguments: [
                  {
                    targets: "21",
                  },
                ],
              },
            ];
          }
        },
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-fast-intl.extractI18N", (args) => {
      vscode.window.showInformationMessage(`成功替换  处文案`);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
