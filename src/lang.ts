import * as fs from 'fs';
import * as path from 'path';
import { flattenObj, compatESModuleRequire } from './utils';
import { getCurrentProjectLangPath, getValFromConfiguration } from './config';
import babelRegister from './babelRegister';
import { readFileSync } from './readDir';

export function getLangData(filePath: string) {
  if (fs.existsSync(filePath)) {
    return compatESModuleRequire(require(filePath));
  } else {
    return {};
  }
  return {};
}

export function getI18N() {
  const langExt = getValFromConfiguration('langExt');
  const mode = getValFromConfiguration('mode');
  const langPath = getCurrentProjectLangPath();

  const paths: string[] =
    mode === 'single' ? [`${langPath}.${langExt}`] : readFileSync(langPath);

  babelRegister.setOnlyMap({
    key: 'langPaths',
    value: paths,
  });

  const langObj = paths.reduce((prev, curr) => {
    const filename = path.parse(curr).name;

    if (filename === 'index') {
      return prev;
    }

    if (mode === 'single') {
      return {
        ...prev,
        ...getLangData(curr),
      };
    }

    return {
      ...prev,
      [filename]: getLangData(curr),
    };
  }, {});

  return langObj;
}

export function getSuggestLangObj() {
  const langObj = getI18N();

  return flattenObj(langObj);
}
