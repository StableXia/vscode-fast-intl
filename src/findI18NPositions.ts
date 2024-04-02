import * as _ from 'lodash';
import { getI18N } from './lang';

export class Position {
  start: any;
  cn: any;
  code: any;
}

class Cache {
  memories: { code: string; positions: Position[] }[];

  constructor() {
    this.memories = [];
  }

  addCache(code: string, positions: Position[]) {
    this.memories.push({
      code,
      positions,
    });

    if (this.memories.length > 8) {
      this.memories.shift();
    }
  }

  getPositionsByCode(code: string) {
    const mem = this.memories.find((mem) => mem.code === code);
    if (mem && mem.positions) {
      return mem.positions;
    }

    return false;
  }
}

const cache = new Cache();

// eslint-disable-next-line @typescript-eslint/naming-convention
function getRegexMatches(I18N: any, code: string) {
  const lines = code.split('\n');
  const positions: Position[] = [];
  const reg = /I18N\.get\(["'](\w+(\.\w+)*)['"]\s*[,)]/;
  const normalReg = /I18N\.get\(["'](\w+(\.\w+)*)['"]\s*[,)]/;

  lines?.map((line, index) => {
    const match = reg.exec(line);
    let exps = _.get(match, [1]);

    if (!exps) {
      exps = _.get(normalReg.exec(line), [1]);
    }

    if (exps) {
      exps = exps.trim();
      exps = exps.split('}')[0];
      exps = exps.split(')')[0];
      exps = exps.split(',')[0];
      exps = exps.split(';')[0];
      exps = exps.split('"')[0];
      exps = exps.split("'")[0];
      exps = exps.split(' ')[0];

      const code = `I18N.${exps}`;
      const position = new Position();
      const transformedCn = _.get(I18N, exps.split('.'));

      if (typeof transformedCn === 'string') {
        position.cn = transformedCn;
        (position as any).line = index;
        position.code = code;
        positions.push(position);
      }
    }
  });

  return positions;
}

/**
 * 查找 I18N 表达式
 * @param code
 */
export function findI18NPositions(code: string) {
  const cachedPoses = cache.getPositionsByCode(code);

  if (cachedPoses) {
    return cachedPoses;
  }

  const I18N = getI18N();
  const positions = [] as Position[];
  const regexMatches = getRegexMatches(I18N, code);
  let matchPositions = positions.concat(regexMatches);

  matchPositions = _.uniqBy(matchPositions, (position: any) => {
    return `${position.code}-${position.line}`;
  });

  cache.addCache(code, matchPositions);

  return matchPositions;
}
