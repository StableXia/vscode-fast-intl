import * as assert from "assert";

import { I18N_PATH_VERIFY_REGEXP } from "../../regexp";

suite("regexp", () => {
  test("I18N_PATH_VERIFY_REGEXP", () => {
    assert.strictEqual(I18N_PATH_VERIFY_REGEXP.test("I18N.get('test')"), true);
    assert.strictEqual(I18N_PATH_VERIFY_REGEXP.test("I18N.get('test.a')"), true);
    assert.strictEqual(I18N_PATH_VERIFY_REGEXP.test("I18N.get(' test ')"), false);
    assert.strictEqual(I18N_PATH_VERIFY_REGEXP.test("I18N.get('test' )"), false);
    assert.strictEqual(I18N_PATH_VERIFY_REGEXP.test("I18N.get('test' ) "), false);
    assert.strictEqual(I18N_PATH_VERIFY_REGEXP.test("I18N.get('test' ) "), false);
  });
});
