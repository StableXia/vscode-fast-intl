import * as ts from 'typescript';
import * as _ from 'lodash';
import { readFile } from './utils';
import { getValFromConfiguration } from './config';

/**
 * 检查是否添加 import I18N 命令
 * @param filePath 文件路径
 */
export function hasImportI18N(filePath: string) {
  const code = readFile(filePath) || '';
  const ast = ts.createSourceFile(
    '',
    code,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX,
  );
  let hasImportI18N = false;

  function visit(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ImportDeclaration) {
      const { importClause } = node as any;

      // import I18N from 'src/utils/I18N';
      if (_.get(importClause, 'kind') === ts.SyntaxKind.ImportClause) {
        if (importClause.name) {
          if (importClause.name.escapedText === 'I18N') {
            hasImportI18N = true;
          }
        } else {
          const namedBindings = importClause.namedBindings;
          // import { I18N } from 'src/utils/I18N';
          if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
            namedBindings.elements.forEach((element: ts.Node) => {
              if (
                element.kind === ts.SyntaxKind.ImportSpecifier &&
                _.get(element, 'name.escapedText') === 'I18N'
              ) {
                hasImportI18N = true;
              }
            });
          }

          // import I18N from 'src/utils/I18N';
          if (namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
            if (_.get(namedBindings, 'name.escapedText') === 'I18N') {
              hasImportI18N = true;
            }
          }
        }
      }
    }
  }

  ts.forEachChild(ast, visit);

  return hasImportI18N;
}

/**
 * 在合适的位置添加 import I18N 语句
 * @param filePath 文件路径
 */
export function createImportI18N(filePath: string) {
  const code = readFile(filePath) || '';
  const ast = ts.createSourceFile(
    '',
    code,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX,
  );
  const isTsFile = _.endsWith(filePath, '.ts');
  const isTsxFile = _.endsWith(filePath, '.tsx');
  const isVueFile = _.endsWith(filePath, '.vue');
  const importI18N = getValFromConfiguration('importI18N');
  if (isTsFile || isTsxFile) {
    const importStatement = `${importI18N}\n`;
    const pos = ast.getStart(ast, false);
    const updateCode = code.slice(0, pos) + importStatement + code.slice(pos);

    return updateCode;
  } else if (isVueFile) {
    const importStatement = `${importI18N}\n`;
    const updateCode = code.replace(
      /<script>/g,
      `<script>\n${importStatement}`,
    );
    return updateCode;
  }
}
