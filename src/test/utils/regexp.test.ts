import * as assert from "assert";

import { I18N_PATH_REGEXP, pickPathFromI18NGet } from "../../regexp";

suite("regexp", () => {
  test("I18N_PATH_REGEXP", () => {
    assert.strictEqual("I18N.get('a')".match(I18N_PATH_REGEXP)?.[1], "a");
    assert.strictEqual("I18N.get('a' ,  )".match(I18N_PATH_REGEXP)?.[1], "a");
    assert.strictEqual("I18N.get('aa')".match(I18N_PATH_REGEXP)?.[1], "aa");
    assert.strictEqual("I18N.get('aa_')".match(I18N_PATH_REGEXP)?.[1], "aa_");
    assert.strictEqual("I18N.get('a ')".match(I18N_PATH_REGEXP)?.[1], undefined);
    assert.strictEqual("I18N.get('a2')".match(I18N_PATH_REGEXP)?.[1], "a2");
    assert.strictEqual("I18N.get('a2 ')".match(I18N_PATH_REGEXP)?.[1], undefined);
    assert.strictEqual("I18N.get('a2&')".match(I18N_PATH_REGEXP)?.[1], undefined);
    assert.strictEqual("I18N.get('a.b(')".match(I18N_PATH_REGEXP)?.[1], undefined);
    assert.strictEqual("I18N.get('a.b.c'  , {})".match(I18N_PATH_REGEXP)?.[1], "a.b.c");
  });

  test("pickPathFromI18NGet", () => {
    assert.strictEqual(pickPathFromI18NGet(""), undefined);
    assert.strictEqual(pickPathFromI18NGet("I18N.get('a.bb.c')"), "a.bb.c");
    assert.strictEqual(pickPathFromI18NGet("I18N.get('a.bb.c ')"), undefined);
    assert.strictEqual(pickPathFromI18NGet("I18N.get('a.bb.c', {})"), "a.bb.c");
  });
});
