import * as vscode from 'vscode';
import * as fs from 'fs';
import * as globby from 'globby';
import { flattenObj, getLangJson } from './utils';
import { getCurrentProjectLangPath } from './config';

export function getLangData(filePath: string) {
  if (fs.existsSync(filePath)) {
    return getLangJson(filePath);
  } else {
    return {};
  }
}

export function getI18N() {
  const paths: string[] = globby.sync(getCurrentProjectLangPath());

  const langObj = paths.reduce((prev, curr) => {
    const filename = (curr.split('/').pop() as string).replace(/\.tsx?$/, '');

    if (filename.replace(/\.tsx?/, '') === 'index') {
      return prev;
    }

    const fileContent = getLangData(curr);
    let jsObj = fileContent;

    if (Object.keys(jsObj).length === 0) {
      vscode.window.showWarningMessage(
        `\`${curr}\` 解析失败，该文件包含的文案无法自动补全`,
      );
    }

    return {
      ...prev,
      [filename]: jsObj,
    };
  }, {});

  return langObj;
}

export function getSuggestLangObj() {
  const langObj = getI18N();

  return flattenObj(langObj);
}
