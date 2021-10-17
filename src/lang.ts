import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as globby from 'globby';
import { flattenObj, compatESModuleRequire } from './utils';
import { getCurrentProjectLangPath } from './config';
import babelRegister from './babelRegister';

export function getLangData(filePath: string) {
  if (fs.existsSync(filePath)) {
    return compatESModuleRequire(require(filePath));
  } else {
    return {};
  }
}

export function getI18N() {
  const paths: string[] = globby.sync(getCurrentProjectLangPath());

  babelRegister.setOnlyMap({
    key: 'langPaths',
    value: paths,
  });

  const langObj = paths.reduce((prev, curr) => {
    const filename = path.parse(curr).name;

    if (filename === 'index') {
      return {
        ...prev,
        ...getLangData(curr),
      };
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
