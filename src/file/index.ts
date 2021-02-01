import * as vscode from "vscode";
import * as prettier from "prettier";
import * as fs from "fs-extra";
import * as _ from "lodash";
import { getTargetLangPath } from "../configs";
import { getLangData } from "../utils";

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
  const targetFilename = getTargetLangPath();

  if (!fs.existsSync(targetFilename)) {
    fs.outputFileSync(targetFilename, generateNewLangFile(fullKey, text));
    vscode.window.showInformationMessage(`成功新建语言文件 ${targetFilename}`);
  } else {
    // 清除 require 缓存，解决手动更新语言文件后再自动抽取，导致之前更新失效的问题
    const mainContent = getLangData(targetFilename);
    const obj = mainContent;

    if (Object.keys(obj).length === 0) {
      vscode.window.showWarningMessage(`zh-cn解析失败，该文件包含的文案无法自动补全`);
    }

    if (validateDuplicate && _.get(obj, fullKey) !== undefined) {
      vscode.window.showErrorMessage(`${targetFilename} 中已存在 key 为 \`${fullKey}\` 的翻译，请重新命名变量`);
      throw new Error("duplicate");
    }
    // \n 会被自动转义成 \\n，这里转回来
    text = text.replace(/\\n/gm, "\n");
    _.set(obj, fullKey, text);
    fs.writeFileSync(targetFilename, JSON.stringify(obj, null, 2));
  }
}
