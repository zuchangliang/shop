const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'bundle_user', 'pages', 'login', 'login.vue'),
  'utf8'
);

function extractMethodBody(methodName) {
  const methodPattern = new RegExp(`(?:async\\s+)?${methodName}\\s*\\(`, 'g');
  let match;
  let nameIndex = -1;
  while ((match = methodPattern.exec(source)) !== null) {
    const previousChar = source[match.index - 1];
    if (previousChar !== '.') {
      nameIndex = match.index;
      break;
    }
  }

  assert.notStrictEqual(nameIndex, -1, `${methodName} should exist as a method`);

  const openBrace = source.indexOf('{', nameIndex);
  assert.notStrictEqual(openBrace, -1, `${methodName} should have a body`);

  let depth = 0;
  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openBrace + 1, index);
      }
    }
  }

  throw new Error(`${methodName} body was not closed`);
}

function countHideLoading(body) {
  return (body.match(/uni\.hideLoading\s*\(/g) || []).length;
}

const mnpLoginFun = extractMethodBody('mnpLoginFun');
const loginHandle = extractMethodBody('loginHandle');

assert.strictEqual(
  countHideLoading(loginHandle),
  0,
  'loginHandle is shared by paths that do not call uni.showLoading, so it must not call uni.hideLoading'
);

assert.strictEqual(
  countHideLoading(mnpLoginFun),
  0,
  'mnpLoginFun must not call uni.hideLoading because response interceptors can showToast before it returns'
);

assert.strictEqual(
  /uni\.showLoading\s*\(/.test(mnpLoginFun),
  false,
  'mnpLoginFun must not call uni.showLoading because authLogin errors are toasted by the request interceptor'
);

assert.strictEqual(
  mnpLoginFun.includes('getUserProfile'),
  false,
  'mnpLoginFun must not block wx.login/authLogin on getUserProfile'
);

assert.ok(
  mnpLoginFun.indexOf('await getWxCode()') < mnpLoginFun.indexOf('authLogin('),
  'mnpLoginFun should get the wx login code before sending authLogin'
);

assert.match(
  mnpLoginFun,
  /authLogin\s*\(\s*{[\s\S]*code:\s*wxCode[\s\S]*nickname:[\s\S]*headimgurl:[\s\S]*}\s*\)/,
  'mnpLoginFun should send authLogin after wx.login succeeds'
);

const authLoginCall = mnpLoginFun.match(/authLogin\s*\(\s*{([\s\S]*?)}\s*\)/);
assert.ok(authLoginCall, 'mnpLoginFun should call authLogin with an object payload');
assert.strictEqual(
  /nickname|headimgurl/.test(authLoginCall[1]),
  true,
  'authLogin payload should include fallback profile fields for old backends that still require nickname'
);

for (const match of mnpLoginFun.matchAll(/this\.\$toast\s*\(/g)) {
  assert.ok(match.index >= 0, 'mnpLoginFun toast calls are allowed without login loading');
}
