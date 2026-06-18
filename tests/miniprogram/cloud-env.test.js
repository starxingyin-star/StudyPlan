const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '../../miniprogram/app.js'),
  'utf8'
);

describe('cloud env config', () => {
  test('binds wx.cloud.init to the production cloud environment explicitly', () => {
    expect(appJs).toContain("env: 'cloud1-d7g7yii2b9c8c0665'");
  });
});
