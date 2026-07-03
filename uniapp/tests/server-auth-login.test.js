const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..');
const accountController = fs.readFileSync(
  path.join(repoRoot, 'server', 'application', 'api', 'controller', 'Account.php'),
  'utf8'
);
const userServer = fs.readFileSync(
  path.join(repoRoot, 'server', 'application', 'api', 'server', 'UserServer.php'),
  'utf8'
);

const authLoginMethod = accountController.match(/public function authLogin\(\)[\s\S]*?public function updateUser\(\)/);
assert.ok(authLoginMethod, 'Account::authLogin should exist before updateUser');

assert.match(
  authLoginMethod[0],
  /empty\(\$post\['code'\]\)/,
  'authLogin should still require wx.login code'
);

assert.strictEqual(
  /empty\(\$post\['nickname'\]\)/.test(authLoginMethod[0]),
  false,
  'authLogin must not require nickname because WeChat profile authorization is optional'
);

const updateUserMethod = userServer.match(/public static function updateUser\([\s\S]*?return \$user_info;/);
assert.ok(updateUserMethod, 'UserServer::updateUser should exist');

assert.match(
  updateUserMethod[0],
  /if\s*\(\s*empty\(\$avatar_url\)\s*\)/,
  'UserServer::updateUser should handle an empty avatar url without downloading it'
);
