// 中文字符匹配
export const CHINESE_CHAR_REGEXP = /[^\x00-\xff]/g;

// 匹配 I18N.get 中的第一个参数
export const I18N_PATH_REGEXP = /^I18N\.get\(["'](\w+(\.\w+)*)['"]\s*[,)]/;

/**
 * 检出 I18N.get 中的第一个参数
 */
export function pickPathFromI18NGet(str: string) {
  return str.match(I18N_PATH_REGEXP)?.[1];
}

// export const I18N_PATH_REGEXP = /^I18N\.get\(["']\w+(\.\w+)*["'](,\s*{.*}){0,1}\)$/;
