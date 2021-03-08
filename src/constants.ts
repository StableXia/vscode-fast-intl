// 语言文件的默认目录：项目根目录
export const DEFAULT_LANG_DIR = ".fastIntl";
// 默认中文语言文件名
export const DEFAULT_TARGET_LANG = "zh-cn";
export const DEFAULT_FAST_INTL_CONFIG = {
  fastIntlDir: DEFAULT_LANG_DIR,
  targetLang: DEFAULT_TARGET_LANG,
};

// export function getDefaultDir() {
//   const dir = dirAdaptor();
//   if (!dir) {
//     const preFix = getConfiguration("langPrefix");
//     if (preFix) {
//       return `${vscode.workspace.workspaceFolders[0].uri.path}/${preFix}`;
//     }
//   }
//   return dir;
// }

export const LANG_PREFIX = "zh-hans";
