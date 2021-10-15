import * as vscode from 'vscode';
import * as prettier from 'prettier';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import { getLangData } from './lang';
import { getLangPrefix } from './config';

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

  const [filename, ...rest] = (
    keyValue.match(/\(["']([\S]+)['"]\s*,?/)?.[1] || ''
  ).split('.');
  const fullKey = rest.join('.');
  const targetFilename = `${getLangPrefix()}/${filename}.ts`;

  if (!fs.existsSync(targetFilename)) {
    fs.outputFileSync(targetFilename, generateNewLangFile(fullKey, text));
    addImportToMainLangFile(filename);
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

export function addImportToMainLangFile(newFilename: string) {
  let mainContent = '';
  const langPrefix = getLangPrefix();
  if (fs.existsSync(`${langPrefix}/index.ts`)) {
    mainContent = fs.readFileSync(`${langPrefix}/index.ts`, 'utf8');
    mainContent = mainContent.replace(
      /^(\s*import.*?;)$/m,
      `$1\nimport ${newFilename} from './${newFilename}';`,
    );

    if (/\n(}\);)/.test(mainContent)) {
      if (/\,\n(}\);)/.test(mainContent)) {
        /** 最后一行包含,号 */
        mainContent = mainContent.replace(/(}\);)/, `  ${newFilename},\n$1`);
      } else {
        /** 最后一行不包含,号 */
        mainContent = mainContent.replace(
          /\n(}\);)/,
          `,\n  ${newFilename},\n$1`,
        );
      }
    }

    if (/\n(};)/.test(mainContent)) {
      if (/\,\n(};)/.test(mainContent)) {
        /** 最后一行包含,号 */
        mainContent = mainContent.replace(/(};)/, `  ${newFilename},\n$1`);
      } else {
        /** 最后一行不包含,号 */
        mainContent = mainContent.replace(/\n(};)/, `,\n  ${newFilename},\n$1`);
      }
    }
  } else {
    mainContent = `import ${newFilename} from './${newFilename}';\n\nexport default Object.assign({}, {\n  ${newFilename},\n});`;
  }

  fs.outputFileSync(`${langPrefix}/index.ts`, mainContent);
}
