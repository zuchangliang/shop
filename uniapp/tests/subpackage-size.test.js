const assert = require('assert');
const fs = require('fs');
const path = require('path');

const uniappRoot = path.join(__dirname, '..');
const pagesJson = fs.readFileSync(path.join(uniappRoot, 'pages.json'), 'utf8');
const pagesConfig = JSON.parse(pagesJson);

assert.strictEqual(
  /"root"\s*:\s*"bundle"/.test(pagesJson),
  false,
  'pages.json should not keep all secondary pages under the oversized bundle subpackage'
);

const declaredRoots = [...pagesJson.matchAll(/"root"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
const packageLimitBytes = 2048 * 1024;
const allowedMainPages = new Set([
  'pages/index/index',
  'pages/sort/sort',
  'pages/shop_cart/shop_cart',
  'pages/user/user',
  'components/uview-ui/components/u-avatar-cropper/u-avatar-cropper'
]);

for (const page of pagesConfig.pages) {
  assert.ok(
    allowedMainPages.has(page.path),
    `${page.path} should be moved out of the main package`
  );
}

function totalSize(dir) {
  return listFiles(dir).reduce((sum, file) => sum + fs.statSync(file).size, 0);
}

for (const root of ['bundle_activity', 'bundle_user', 'bundle_order']) {
  assert.ok(declaredRoots.includes(root), `${root} should be declared as a subpackage root`);
}

for (const subPackage of pagesConfig.subPackages) {
  for (const page of subPackage.pages) {
    assert.strictEqual(
      page.path.startsWith(`${subPackage.root}/`),
      false,
      `${subPackage.root} page ${page.path} should not include the subpackage root prefix`
    );
  }
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

for (const root of declaredRoots) {
  const sourceRoot = path.join(uniappRoot, root);
  const totalBytes = totalSize(sourceRoot);
  assert.ok(
    totalBytes <= packageLimitBytes,
    `${root} source size should be <= 2048KB, got ${(totalBytes / 1024).toFixed(1)}KB`
  );
}

const mpWeixinRoots = ['dev', 'build']
  .map((mode) => path.join(uniappRoot, 'unpackage', 'dist', mode, 'mp-weixin'))
  .filter((root) => fs.existsSync(path.join(root, 'app.json')));

for (const mpWeixinRoot of mpWeixinRoots) {
  const appJson = JSON.parse(fs.readFileSync(path.join(mpWeixinRoot, 'app.json'), 'utf8'));
  const subPackageRoots = new Set(declaredRoots);

  for (const wxssFile of listFiles(mpWeixinRoot).filter((file) => file.endsWith('.wxss'))) {
    const wxss = fs.readFileSync(wxssFile, 'utf8');
    assert.strictEqual(
      /@import\s+url\(/.test(wxss),
      false,
      `${path.relative(mpWeixinRoot, wxssFile)} should not use @import url(...) because WXSS does not compile it`
    );
  }

  for (const subPackage of appJson.subPackages || []) {
    const nestedRoot = path.join(mpWeixinRoot, subPackage.root, subPackage.root);
    assert.strictEqual(
      fs.existsSync(nestedRoot),
      false,
      `mp-weixin output should not keep stale nested root ${path.relative(mpWeixinRoot, nestedRoot)}`
    );

    for (const page of subPackage.pages || []) {
      assert.strictEqual(
        page.startsWith(`${subPackage.root}/`),
        false,
        `mp-weixin ${subPackage.root} page ${page} should not include the subpackage root prefix`
      );

      const wxmlPath = path.join(mpWeixinRoot, subPackage.root, `${page}.wxml`);
      assert.ok(
        fs.existsSync(wxmlPath),
        `mp-weixin should include ${path.relative(mpWeixinRoot, wxmlPath)}`
      );
    }
  }

  const mainPackageFiles = listFiles(mpWeixinRoot).filter((file) => {
    const topLevelName = path.relative(mpWeixinRoot, file).split(path.sep)[0];
    return !subPackageRoots.has(topLevelName);
  });
  const mainPackageBytes = mainPackageFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  assert.ok(
    mainPackageBytes <= packageLimitBytes,
    `mp-weixin main package size should be <= 2048KB, got ${(mainPackageBytes / 1024).toFixed(1)}KB`
  );

  for (const root of subPackageRoots) {
    const subPackageBytes = totalSize(path.join(mpWeixinRoot, root));
    assert.ok(
      subPackageBytes <= packageLimitBytes,
      `mp-weixin ${root} package size should be <= 2048KB, got ${(subPackageBytes / 1024).toFixed(1)}KB`
    );
  }
}

const sourceFiles = listFiles(uniappRoot).filter((file) => {
  if (file.includes(`${path.sep}unpackage${path.sep}`)) return false;
  if (file.includes(`${path.sep}node_modules${path.sep}`)) return false;
  if (file.endsWith(`${path.sep}tests${path.sep}subpackage-size.test.js`)) return false;
  return /\.(vue|js|json)$/.test(file);
});

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  assert.strictEqual(
    source.includes('/bundle/pages') || source.includes('bundle/pages'),
    false,
    `${path.relative(uniappRoot, file)} should not reference the old bundle/pages route`
  );

  const relativePath = path.relative(uniappRoot, file);
  if (/^bundle_(activity|user|order)\//.test(relativePath)) {
    assert.strictEqual(
      /(?:from\s+['"]|require\(\s*['"]|import\(\s*['"])\.\.\/\.\.\/(api|utils|config|store|mixins|js_sdk)\//.test(source),
      false,
      `${relativePath} should not import root modules with ../../ after being moved into a subpackage`
    );
  }
}
