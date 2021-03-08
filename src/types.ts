import * as vscode from "vscode";

export interface ITargetStr {
  text: string;
  range: vscode.Range;
  isString: boolean;
}
