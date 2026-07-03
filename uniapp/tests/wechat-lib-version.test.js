const assert = require('assert');
const fs = require('fs');
const path = require('path');

const projectConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'project.config.json'), 'utf8')
);

function compareVersions(actual, minimum) {
  const actualParts = actual.split('.').map((part) => Number(part));
  const minimumParts = minimum.split('.').map((part) => Number(part));
  const length = Math.max(actualParts.length, minimumParts.length);

  for (let index = 0; index < length; index += 1) {
    const actualPart = actualParts[index] || 0;
    const minimumPart = minimumParts[index] || 0;
    if (actualPart > minimumPart) return 1;
    if (actualPart < minimumPart) return -1;
  }

  return 0;
}

assert.ok(projectConfig.libVersion, 'project.config.json should define libVersion');
assert.ok(
  compareVersions(projectConfig.libVersion, '2.21.2') >= 0,
  `WeChat chooseAvatar requires base library >= 2.21.2, got ${projectConfig.libVersion}`
);
