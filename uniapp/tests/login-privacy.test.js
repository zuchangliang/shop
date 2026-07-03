const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'bundle_user', 'pages', 'login', 'login.vue'),
  'utf8'
);
const manifest = fs.readFileSync(
  path.join(__dirname, '..', 'manifest.json'),
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

assert.match(
  source,
  /<privacy-popup\s+v-model=["']showPrivacyPopup["']/,
  'login page should mount the official WeChat privacy popup before avatar nickname collection'
);

assert.match(
  manifest,
  /"mp-weixin"\s*:\s*\{[\s\S]*"__usePrivacyCheck__"\s*:\s*true/,
  'WeChat mini program config should enable privacy checks for local DevTools and real-device privacy authorization'
);

assert.match(
  source,
  /showPrivacyPopup:\s*false/,
  'login page should track whether the official privacy popup is visible'
);

const checkPrivacySetting = extractMethodBody('checkPrivacySetting');
assert.match(
  checkPrivacySetting,
  /wx\.getPrivacySetting\s*\(/,
  'login page should query wx.getPrivacySetting on WeChat mini program'
);
assert.match(
  checkPrivacySetting,
  /needAuthorization/,
  'login page should show the official privacy popup when WeChat says authorization is needed'
);

const mnpLoginFun = extractMethodBody('mnpLoginFun');
assert.match(
  mnpLoginFun,
  /await\s+this\.checkPrivacySetting\s*\(\s*\)/,
  'mini program login should stop and show the official privacy popup before profile collection if privacy authorization is missing'
);
