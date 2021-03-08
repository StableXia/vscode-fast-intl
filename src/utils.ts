import * as fs from "fs-extra";
import * as ts from "typescript";

/**
 * 获取文件内容并转成json
 */
export function getFileToJson(filePath: string) {
  const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });

  let obj = fileContent.match(/export\s*default\s*({[\s\S]+);?$/)?.[1] as string;
  obj = obj.replace(/\s*;\s*$/, "");

  let jsObj: { [key: string]: any } = {};
  try {
    jsObj = eval("(" + obj + ")");
  } catch (err) {
    console.log(obj);
    console.error(err);
  }

  return jsObj;
}

/**
 * 移除注释
 */
export function removeFileComment(code: string, fileName: string) {
  const printer: ts.Printer = ts.createPrinter({ removeComments: true });
  const sourceFile: ts.SourceFile = ts.createSourceFile("", code, ts.ScriptTarget.ES2015, true, fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  return printer.printFile(sourceFile);
}
