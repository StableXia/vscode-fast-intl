import * as fs from "fs-extra";
import * as ts from "typescript";
import * as vscode from "vscode";
import * as _ from "lodash";

export function flattenObj(obj: { [key: string]: any }, prefix?: string) {
  const propName = prefix ? prefix + "." : "";
  const ret: { [key: string]: string } = {};

  for (let attr in obj) {
    if (_.isArray(obj[attr])) {
      ret[attr] = obj[attr].join(",");
    } else if (typeof obj[attr] === "object") {
      _.extend(ret, flattenObj(obj[attr], propName + attr));
    } else {
      ret[propName + attr] = obj[attr];
    }
  }
  return ret;
}

/**
 * 获取文件内容并转成json
 */
export function getFileToJson(filePath: string) {
  let temp: { [key: string]: any } = {};

  try {
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });

    let obj = fileContent.match(/export\s*default\s*({[\s\S]+);?$/)?.[1] as string;
    obj = obj.replace(/\s*;\s*$/, "");

    temp = eval("(" + obj + ")");
  } catch (err) {
    console.error(err);
  }

  return temp;
}

/**
 * 移除注释
 */
export function removeFileComment(code: string, fileName: string) {
  const printer: ts.Printer = ts.createPrinter({ removeComments: true });
  const sourceFile: ts.SourceFile = ts.createSourceFile("", code, ts.ScriptTarget.ES2015, true, fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  return printer.printFile(sourceFile);
}

export function trimWhiteSpace(code: string, startPos: vscode.Position, endPos: vscode.Position) {
  const lines = code.split("\n");
  const hasContentLines = [];
  const columnOfLine: { [key: string]: [number, number] } = {};
  for (let i = startPos.line; i <= endPos.line; i++) {
    const line = lines[i];
    let colStart = 0;
    let colEnd = line.length;
    if (i === startPos.line) {
      colStart = startPos.character;
    }
    if (i === endPos.line) {
      colEnd = endPos.character;
    }
    const text = line.slice(colStart, colEnd).trim();
    if (text.length) {
      hasContentLines.push(i);
      /** 如果文字前面，全是空格 */
      if (!colStart) {
        colStart = line.length - (line as any).trimLeft().length;
      }
    }
    columnOfLine[i] = [colStart, colEnd];
  }
  const startLine = Math.min(...hasContentLines);
  const startCol = Math.min(...columnOfLine[startLine]);
  const endLine = Math.max(...hasContentLines);
  const endCol = Math.max(...columnOfLine[endLine]);

  return {
    trimStart: new vscode.Position(startLine, startCol),
    trimEnd: new vscode.Position(endLine, endCol),
  };
}

export function findMatchKey(langObj: { [key: string]: string }, val: string) {
  for (const key in langObj) {
    if (langObj[key] === val) {
      return key;
    }
  }

  return null;
}
