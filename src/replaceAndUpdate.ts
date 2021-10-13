import * as vscode from 'vscode';
import { updateLangFiles } from './file';
import { ITargetStr } from './types';
import { pickPathFromI18NGet } from './regexp';

export function replaceAndUpdate(
  arg: ITargetStr,
  val: string,
  validateDuplicate: boolean,
) {
  const edit = new vscode.WorkspaceEdit();
  const { document } = vscode.window.activeTextEditor as vscode.TextEditor;

  let finalReplaceText = arg.text;
  // 若是字符串，删掉两侧的引号
  if (arg.isString) {
    // 如果引号左侧是 等号，则可能是 jsx 的 props，此时要替换成 {
    let startColPostion;
    try {
      startColPostion = arg.range.start.translate(0, -2);
    } catch (e) {
      startColPostion = arg.range.start.translate(0, 0);
    }
    const prevTextRange = new vscode.Range(startColPostion, arg.range.start);
    const [last2Char, last1Char] = document.getText(prevTextRange).split('');
    let finalReplaceVal = val;
    if (last2Char === '=') {
      finalReplaceVal = '{' + val + '}';
    }
    // 若是模板字符串，看看其中是否包含变量
    if (last1Char === '`') {
      const varInStr = arg.text.match(/(\$\{[^\}]+?\})/g);

      if (varInStr) {
        const kvPair = varInStr.map((str, index) => {
          return `val${index + 1}: ${str.replace(/^\${([^\}]+)\}$/, '$1')}`;
        });
        finalReplaceVal = `I18N.get('${pickPathFromI18NGet(
          val,
        )}', { ${kvPair.join(',\n')} })`;

        varInStr.forEach((str, index) => {
          finalReplaceText = finalReplaceText.replace(str, `{val${index + 1}}`);
        });
      }
    }

    edit.replace(
      document.uri,
      arg.range.with({
        start: arg.range.start.translate(0, -1),
        end: arg.range.end.translate(0, 1),
      }),
      finalReplaceVal,
    );
  } else {
    edit.replace(document.uri, arg.range, '{' + val + '}');
  }

  try {
    // 更新语言文件
    updateLangFiles(val, finalReplaceText, validateDuplicate);
    // 若更新成功再替换代码
    return vscode.workspace.applyEdit(edit);
  } catch (e: any) {
    return Promise.reject(e.message);
  }
}
