const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'components', 'mplogin-popup', 'mplogin-popup.vue'),
  'utf8'
);

function extractMethodBody(methodName) {
  const methodPattern = new RegExp(`${methodName}\\s*\\(`, 'g');
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
  /open-type=["']chooseAvatar["'][\s\S]*@chooseavatar=["']onChooseAvatar["']/,
  'mini program login popup should keep the WeChat chooseAvatar entry'
);

assert.match(
  source,
  /@error=["']onChooseAvatarError["']/,
  'chooseAvatar button should surface platform errors instead of failing silently'
);

assert.strictEqual(
  /<div[\s>]/.test(source),
  false,
  'chooseAvatar button content should use mini-program native view tags instead of div'
);

assert.strictEqual(
  /<u-icon[\s>]/.test(source),
  false,
  'chooseAvatar button should avoid nested custom icon components that can interfere with open-type tapping'
);

assert.strictEqual(
  /<u-form-item[\s>]|<\/u-form-item>/.test(source),
  false,
  'avatar nickname collection should use native view rows instead of u-form-item wrappers around chooseAvatar'
);

assert.strictEqual(
  /<form[\s\S]*open-type=["']chooseAvatar["'][\s\S]*<\/form>/.test(source),
  false,
  'chooseAvatar button should stay outside the nickname form so WeChat open-type taps are not swallowed'
);

assert.strictEqual(
  /<u-popup[\s>]|<\/u-popup>/.test(source),
  false,
  'chooseAvatar should not be nested in u-popup because its generated catchtap wrapper can swallow WeChat open-type taps'
);

assert.match(
  source,
  /<form\s+@submit=["']handleSubmit["'][\s\S]*name=["']nickname["'][\s\S]*type=["']nickname["'][\s\S]*form-type=["']submit["']/,
  'nickname should be read through form submit because choosing the WeChat nickname may not trigger input or blur bindings'
);

assert.strictEqual(
  /:value=["']nickname["']/.test(source),
  false,
  'nickname input should not be controlled by :value so the WeChat nickname accessory can fill the visible field'
);

assert.strictEqual(
  /chooseLocalAvatar|uni\.chooseImage|从相册上传/.test(source),
  false,
  'mini program login popup should not bypass the WeChat avatar nickname flow with local album upload'
);

const onChooseAvatar = extractMethodBody('onChooseAvatar');
assert.match(
  onChooseAvatar,
  /this\.uploadAvatar\s*\(\s*avatarUrl\s*\)/,
  'onChooseAvatar should send the selected WeChat avatar through the shared upload path'
);

const onChooseAvatarError = extractMethodBody('onChooseAvatarError');
assert.match(
  onChooseAvatarError,
  /隐私保护指引/,
  'onChooseAvatarError should tell operators to update the mini program privacy guide when chooseAvatar is blocked'
);

const uploadAvatar = extractMethodBody('uploadAvatar');
assert.match(
  uploadAvatar,
  /uploadFile\s*\(\s*path\s*\)/,
  'uploadAvatar should upload the chosen avatar file'
);

const handleSubmit = extractMethodBody('handleSubmit');
assert.match(
  handleSubmit,
  /e\.detail\.value\.nickname/,
  'handleSubmit should read nickname from form submit so selected WeChat nickname is captured'
);
