import * as vscode from 'vscode';
import { ITargetStr } from './types';
import { triggerUpdateDecorations } from './chineseCharDecorations';
import { replaceAndUpdate } from './replaceAndUpdate';
import { getSuggestLangObj } from './lang';
import { getI18nPathVerifyRegexp } from './regexp';
import { getValFromConfiguration, getFastIntlConfigFile } from './config';
import { findMatchKey } from './utils';
import babelRegister from './babelRegister';

export function activate(context: vscode.ExtensionContext) {
  const configPath = getFastIntlConfigFile();

  /** 存在配置文件则开启 */
  if (!configPath) {
    return;
  }

  babelRegister.setOnlyMap({
    key: 'config',
    value: configPath ? [configPath] : [],
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-fast-intl.openFastIntl', () => {
      vscode.window
        .showInformationMessage(
          `是否开启 Fast Intl ？`,
          { modal: true },
          'Open',
          'Close',
        )
        .then((action) => {
          if (action === 'Open') {
            vscode.workspace
              .getConfiguration()
              .update('vscode-fast-intl.openFastIntl', true);
          } else if (action === 'Close') {
            vscode.workspace
              .getConfiguration()
              .update('vscode-fast-intl.openFastIntl', false);
          }
        });
    }),
  );

  if (!getValFromConfiguration('openFastIntl')) {
    return;
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-fast-intl.helloFastIntl', () => {
      vscode.window.showInformationMessage('欢迎使用 vscode-fast-intl');
    }),
  );

  let finalLangObj: { [key: string]: string } = {};
  let targetStrs: ITargetStr[] = [];
  let activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    triggerUpdateDecorations((newTargetStrs) => {
      targetStrs = newTargetStrs;
    });
  }

  const hasLightBulb = getValFromConfiguration('enableReplaceSuggestion');
  if (hasLightBulb) {
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        [
          { scheme: 'file', language: 'typescriptreact' },
          { scheme: 'file', language: 'typescript' },
          { scheme: 'file', language: 'javascriptreact' },
          { scheme: 'file', language: 'javascript' },
        ],
        {
          provideCodeActions: function (document, range, context, token) {
            const targetStr = targetStrs.find(
              (t) => range.intersection(t.range) !== undefined,
            );

            finalLangObj = getSuggestLangObj();

            if (targetStr) {
              const sameTextStrs = targetStrs.filter(
                (t) => t.text === targetStr.text,
              );
              const text = targetStr.text;
              const actions = [];

              for (const key in finalLangObj) {
                if (finalLangObj[key] === text) {
                  actions.push({
                    title: `替换为 \`I18N.get('${key}')\``,
                    command: 'vscode-fast-intl.extractI18N',
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
                  command: 'vscode-fast-intl.extractI18N',
                  arguments: [
                    {
                      targets: sameTextStrs,
                    },
                  ],
                },
              ];
            }
          },
        },
      ),
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-fast-intl.extractI18N', (args) => {
      return new Promise<string>((resolve) => {
        if (args.varName) {
          return resolve(args.varName);
        }

        const mode = getValFromConfiguration('mode');
        return resolve(
          vscode.window.showInputBox({
            prompt:
              mode === 'single'
                ? "请输入变量名，格式 `I18N.get('key)`，按 <回车> 启动替换"
                : "请输入变量名，格式 `I18N.get('page.key)`，按 <回车> 启动替换",
            ignoreFocusOut: false,
            value: `I18N.get('')`,
            validateInput(input) {
              if (!input.match(getI18nPathVerifyRegexp())) {
                return mode === 'single'
                  ? "变量名格式 `I18N.get('key')`，如 `I18N.get('app_title')`"
                  : "变量名格式 `I18N.get('page.key')`，如 `I18N.get('common.app_title')`";
              }
            },
          }),
        );
      }).then((val) => {
        // 没有输入变量名
        if (!val) {
          return;
        }

        const finalArgs = Array.isArray(args.targets)
          ? args.targets
          : [args.targets];

        return finalArgs
          .reverse()
          .reduce((prev: Promise<any>, curr: ITargetStr, index: number) => {
            return prev.then(() => {
              return replaceAndUpdate(
                curr,
                val,
                index === 0 ? !args.varName : false,
              );
            });
          }, Promise.resolve())
          .then(
            () => {
              vscode.window.showInformationMessage(
                `成功替换 ${finalArgs.length} 处文案`,
              );
            },
            (err: any) => {
              console.log(err, 'err');
            },
          );
      });
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations((newTargetStrs) => {
          targetStrs = newTargetStrs;
        });
      }
    }, null),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations((newTargetStrs) => {
          targetStrs = newTargetStrs;
        });
      }
    }, null),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-fast-intl.autoExtract', () => {
      if (targetStrs.length === 0) {
        vscode.window.showInformationMessage('没有找到可替换的文案');
        return;
      }

      const replaceableStrs = targetStrs.reduce(
        (prev: Array<{ target: ITargetStr; key: string }>, curr) => {
          const key = findMatchKey(finalLangObj, curr.text);
          if (key) {
            return prev.concat({
              target: curr,
              key,
            });
          }

          return prev;
        },
        [],
      );

      if (replaceableStrs.length === 0) {
        vscode.window.showInformationMessage('没有找到可替换的文案');
        return;
      }

      vscode.window
        .showInformationMessage(
          `共找到 ${replaceableStrs.length} 处可自动替换的文案，是否替换？`,
          { modal: true },
          'Yes',
        )
        .then((action) => {
          if (action === 'Yes') {
            replaceableStrs
              .reverse()
              .reduce((prev: Promise<any>, obj) => {
                return prev.then(() => {
                  return replaceAndUpdate(
                    obj.target,
                    `I18N.get('${obj.key}')`,
                    false,
                  );
                });
              }, Promise.resolve())
              .then(() => {
                vscode.window.showInformationMessage('替换完成');
              })
              .catch((err: any) => {
                vscode.window.showErrorMessage(err.message);
              });
          }
        });
    }),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
