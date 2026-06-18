const fs = require('fs');
const path = require('path');

const pageScripts = [
  'miniprogram/pages/today/index.js',
  'miniprogram/pages/rewards/index.js',
  'miniprogram/pages/mine/index.js',
  'miniprogram/pages/weekly-plan/index.js',
  'miniprogram/pages/weekly-review/index.js',
  'miniprogram/pages/family/index.js',
  'miniprogram/pages/reward-settings/index.js'
];

describe('mini program share menu', () => {
  test('enables friend sharing on every page with a shared config', () => {
    for (const relativePath of pageScripts) {
      const source = fs.readFileSync(path.join(__dirname, '../../', relativePath), 'utf8');

      expect(source).toContain("require('../../utils/share')");
      expect(source).toContain('enableShareMenu()');
      expect(source).toContain('onShareAppMessage()');
      expect(source).toContain('getShareAppMessage()');
    }
  });
});
