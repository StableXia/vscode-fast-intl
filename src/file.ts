import * as vscode from "vscode";
import * as prettier from "prettier";
import * as fs from "fs-extra";
import * as _ from "lodash";
import { getZhHansLangPath } from "./config";
import { getLangData } from "./lang";

function isDuplicateKey(obj: any, path: string) {
  let fullKey = path;
  let idx = fullKey.lastIndexOf(".");

  if (idx === -1) {
    return _.get(obj, fullKey) !== undefined;
  }

  if (_.get(obj, fullKey) !== undefined) {
    return true;
  }

  while (idx !== -1) {
    fullKey = fullKey.slice(0, idx);

    if (_.get(obj, fullKey) !== undefined) {
      return typeof _.get(obj, fullKey) === "string";
    }

    idx = fullKey.lastIndexOf(".");
  }
}

/**
 * 使用 Prettier 格式化文件
 * @param fileContent
 */
function prettierFile(fileContent: string) {
  try {
    return prettier.format(fileContent, {
      parser: "typescript",
      trailingComma: "all",
      singleQuote: true,
    });
  } catch (e) {
    console.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`);
    return fileContent;
  }
}

export function generateNewLangFile(key: string, value: string) {
  const obj = _.set({}, key, value);

  return JSON.stringify(obj, null, 2);
}

export function updateLangFiles(keyValue: string, text: string, validateDuplicate: boolean) {
  if (!keyValue.startsWith("I18N.")) {
    return;
  }

  const fullKey = keyValue.match(/\(["']([\S]+)['"]\s*,?/)?.[1] || "";
  const targetFilename = getZhHansLangPath();

  if (!fs.existsSync(targetFilename)) {
    fs.outputFileSync(targetFilename, generateNewLangFile(fullKey, text));
    vscode.window.showInformationMessage(`成功新建语言文件 ${targetFilename}`);
  } else {
    const obj = getLangData(targetFilename);

    // _.get(obj, fullKey.split(".")[0]) !== undefined
    // _.get(obj, fullKey) !== undefined
    if (validateDuplicate && isDuplicateKey(obj, fullKey)) {
      vscode.window.showErrorMessage(`${targetFilename} 中已存在 key 为 \`${fullKey}\` 的翻译，请重新命名变量`);
      throw new Error("duplicate");
    }
    // \n 会被自动转义成 \\n，这里转回来
    text = text.replace(/\\n/gm, "\n");
    _.set(obj, fullKey, text);

    fs.writeFileSync(targetFilename, JSON.stringify(obj, null, 2));
  }
}
