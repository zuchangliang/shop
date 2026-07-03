const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'utils', 'login.js'),
  'utf8'
);

const getWxCode = source.match(/export function getWxCode\(\)\s*{[\s\S]*?\n}\r?\n\/\/小程序获取用户信息/);
assert.ok(getWxCode, 'getWxCode should exist');

assert.match(
  getWxCode[0],
  /if\s*\(\s*res\.code\s*\)/,
  'getWxCode should only resolve when wx.login returns a non-empty code'
);

assert.match(
  getWxCode[0],
  /reject\s*\(/,
  'getWxCode should reject when wx.login does not return a code'
);
