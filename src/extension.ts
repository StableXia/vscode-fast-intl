import * as vscode from "vscode";
import { ITargetStr } from "./types";
import { triggerUpdateDecorations } from "./chineseCharDecorations";
import { replaceAndUpdate } from "./replaceAndUpdate";
import { getSuggestLangObj } from "./lang";
import { I18N_PATH_VERIFY_REGEXP } from "./regexp";
import { getValFromConfiguration, getFtintlConfigFile } from "./config";

export function activate(context: vscode.ExtensionContext) {
  if (!getFtintlConfigFile()) {
    /** 存在配置文件则开启 */
    return;
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("vscode-fast-intl.helloFastIntl", () => {
    vscode.window.showInformationMessage("欢迎使用 vscode-fast-intl");
  });
  context.subscriptions.push(disposable);

  let finalLangObj: { [key: string]: string } = {};
  let targetStrs: ITargetStr[] = [];
  let activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    triggerUpdateDecorations((newTargetStrs) => {
      targetStrs = newTargetStrs;
    });
  }

  const hasLightBulb = getValFromConfiguration("enableReplaceSuggestion");
  if (hasLightBulb) {
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
            const targetStr = targetStrs.find((t) => range.intersection(t.range) !== undefined);

            if (targetStr) {
              const sameTextStrs = targetStrs.filter((t) => t.text === targetStr.text);
              const text = targetStr.text;
              const actions = [];

              finalLangObj = getSuggestLangObj();

              // TODO: 只对比一级 key 值
              for (const key in finalLangObj) {
                if (finalLangObj[key] === text) {
                  actions.push({
                    title: `替换为 \`I18N.get('${key}')\``,
                    command: "vscode-fast-intl.extractI18N",
                    arguments: [
                      {
                        targets: sameTextStrs,
                        varName: `I18N.get('${key}')`,
                      },
                    ],
                  });
                }
              }

              return [
                ...actions,
                {
                  title: `替换为自定义 I18N 变量（共${sameTextStrs.length}处）`,
                  command: "vscode-fast-intl.extractI18N",
                  arguments: [
                    {
                      targets: sameTextStrs,
                    },
                  ],
                },
              ];
            }
          },
        }
      )
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-fast-intl.extractI18N", (args) => {
      return new Promise<string>((resolve) => {
        if (args.varName) {
          return resolve(args.varName);
        }

        return resolve(
          vscode.window.showInputBox({
            prompt: "请输入变量名，格式 `I18N.get('path)`，按 <回车> 启动替换",
            value: `I18N.get()`,
            validateInput(input) {
              if (!input.match(I18N_PATH_VERIFY_REGEXP)) {
                return "变量名格式 `I18N.get('path')`，如 `I18N.get('name')`";
              }
            },
          })
        );
      }).then((val) => {
        // 没有输入变量名
        if (!val) {
          return;
        }

        const finalArgs = Array.isArray(args.targets) ? args.targets : [args.targets];

        return finalArgs
          .reverse()
          .reduce((prev: Promise<any>, curr: ITargetStr, index: number) => {
            return prev.then(() => {
              return replaceAndUpdate(curr, val, index === 0 ? !args.varName : false);
            });
          }, Promise.resolve())
          .then(
            () => {
              vscode.window.showInformationMessage(`成功替换 ${finalArgs.length} 处文案`);
            },
            (err: any) => {
              console.log(err, "err");
            }
          );
      });
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations((newTargetStrs) => {
          targetStrs = newTargetStrs;
        });
      }
    }, null)
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations((newTargetStrs) => {
          targetStrs = newTargetStrs;
        });
      }
    }, null)
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
