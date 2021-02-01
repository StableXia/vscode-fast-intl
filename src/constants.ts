import * as vscode from "vscode";
import * as path from "path";

// 中文字符匹配
export const CHINESE_CHAR_REGEXP = /[^\x00-\xff]/g;

// 语言文件的默认目录：项目根目录
export const DEFAULT_LANG_DIR = ".fastIntl";

export const DEFAULT_LANG = "";
