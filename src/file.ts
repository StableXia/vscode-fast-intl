import * as vscode from 'vscode';
import * as prettier from 'prettier';
import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import { getLangData } from './lang';
import { getValFromConfiguration, getCurrentProjectLangPath } from './config';
import { readFile } from './utils';

function isDuplicateKey(obj: any, path: string) {
  let fullKey = path;
  let idx = fullKey.lastIndexOf('.');

  if (idx === -1) {
    return _.get(obj, fullKey) !== undefined;
  }

  if (_.get(obj, fullKey) !== undefined) {
    return true;
  }

  while (idx !== -1) {
    fullKey = fullKey.slice(0, idx);

    if (_.get(obj, fullKey) !== undefined) {
      return typeof _.get(obj, fullKey) === 'string';
    }

    idx = fullKey.lastIndexOf('.');
  }
}

/**
 * 使用 Prettier 格式化文件
 * @param fileContent
 */
function prettierFile(fileContent: string) {
  try {
    return prettier.format(fileContent, {
      parser: 'typescript',
      trailingComma: 'all',
      singleQuote: true,
    });
  } catch (e: any) {
    console.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`);
    return fileContent;
  }
}

export function generateNewLangFile(key: string, value: string) {
  const obj = _.set({}, key, value);

  return prettierFile(`export default ${JSON.stringify(obj, null, 2)}`);
}

export function updateLangFiles(
  keyValue: string,
  text: string,
  validateDuplicate: boolean,
) {
  if (!keyValue.startsWith('I18N.')) {
    return;
  }

  const mode = getValFromConfiguration('mode');
  const langPath = getCurrentProjectLangPath();

  let filename: string = '';
  let targetFilename: string;
  let fullKey: string;

  if (mode === 'single') {
    fullKey = keyValue.match(/\(["']([\S]+)['"]\s*,?/)?.[1] || '';
    targetFilename = `${langPath}.ts`;
  } else {
    const keyArr = (keyValue.match(/\(["']([\S]+)['"]\s*,?/)?.[1] || '').split(
      '.',
    );
    filename = keyArr.shift() as string;
    fullKey = keyArr.join('.');
    targetFilename = `${langPath}/${filename}.ts`;
  }

  if (!fs.existsSync(targetFilename)) {
    fs.outputFileSync(targetFilename, generateNewLangFile(fullKey, text));
    if (mode !== 'single') {
      addImportToMainLangFile(filename);
    }
    vscode.window.showInformationMessage(`成功新建语言文件 ${targetFilename}`);
  } else {
    const obj = getLangData(targetFilename);

    if (validateDuplicate && isDuplicateKey(obj, fullKey)) {
      vscode.window.showErrorMessage(
        `${targetFilename} 中已存在 key 为 \`${fullKey}\` 的翻译，请重新命名变量`,
      );
      throw new Error('duplicate');
    }

    // \n 会被自动转义成 \\n，这里转回来
    text = text.replace(/\\n/gm, '\n');
    _.set(obj, fullKey, text);

    fs.writeFileSync(
      targetFilename,
      prettierFile(`export default ${JSON.stringify(obj, null, 2)}`),
    );
  }
}

export function insertStr(soure: string, start: number, newStr: string) {
  return soure.slice(0, start) + newStr + soure.slice(start);
}

export function addImportToMainLangFile(newFilename: string) {
  const langPrefix = getCurrentProjectLangPath();
  const filePath = `${langPrefix}/index.ts`;
  let mainContent = '';

  if (fs.existsSync(filePath)) {
    mainContent = readFile(filePath) || '';
    mainContent = mainContent.replace(
      /^(\s*import.*?;)$/m,
      `$1\nimport ${newFilename} from './${newFilename}';`,
    );

    const ast = ts.createSourceFile(
      '',
      mainContent,
      ts.ScriptTarget.ES2015,
      true,
      ts.ScriptKind.TSX,
    );

    function visit(node: ts.Node) {
      switch (node.kind) {
        case ts.SyntaxKind.ObjectLiteralExpression: {
          const text = node.getText().replace(/[{}\s]/g, '');
          if (/,$/.test(text)) {
            mainContent = insertStr(mainContent, node.end - 1, newFilename);
          } else {
            mainContent = insertStr(
              mainContent,
              node.end - 1,
              `,${newFilename}`,
            );
          }
          break;
        }
      }

      ts.forEachChild(node, visit);
    }
    ts.forEachChild(ast, visit);
  } else {
    mainContent = `import ${newFilename} from './${newFilename}';\n\nexport default {\n  ${newFilename}\n};`;
  }

  fs.outputFileSync(filePath, prettierFile(mainContent));
}
