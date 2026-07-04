const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const root = path.resolve(__dirname, '../..');
const pagesJson = JSON.parse(fs.readFileSync(path.join(root, 'uniapp/pages.json'), 'utf8'));
const menuSource = fs.readFileSync(path.join(root, 'server/application/common/model/Menu_.php'), 'utf8');

const routes = new Set();
for (const page of pagesJson.pages || []) {
  routes.add(`/${page.path}`);
  routes.add(page.path);
}
for (const pkg of pagesJson.subPackages || []) {
  for (const page of pkg.pages || []) {
    routes.add(`/${pkg.root}/${page.path}`);
    routes.add(`${pkg.root}/${page.path}`);
  }
}

function assertRegisteredRoute(label, route) {
  if (!route.startsWith('/')) {
    return;
  }
  if (!route.startsWith('/pages/') && !route.startsWith('/bundle_')) {
    return;
  }

  const routePath = route.split('?')[0];
  assert(routes.has(routePath), `${label} points to unregistered miniapp route: ${route}`);
}

function assertNoOldRoutePrefixes(label, source) {
  const oldRoutePatterns = [
    /\/bundle\/pages\/[A-Za-z0-9_/?=&.-]*/g,
    /['"`]\/pages\/user_[A-Za-z0-9_/?=&.-]*/g,
    /['"`]\/pages\/news_[A-Za-z0-9_/?=&.-]*/g,
    /['"`]\/pages\/goods_[A-Za-z0-9_/?=&.-]*/g,
    /['"`]\/pages\/hot_list\/[A-Za-z0-9_/?=&.-]*/g,
  ];

  for (const pattern of oldRoutePatterns) {
    const matches = source.match(pattern) || [];
    assert(matches.length === 0, `${label} contains old miniapp route(s): ${matches.join(', ')}`);
  }
}

function extractPhpArrayRoutes(source, keyName) {
  const pattern = new RegExp(`'${keyName}'\\s*=>\\s*'([^']+)'`, 'g');
  const routes = [];
  let match;
  while ((match = pattern.exec(source))) {
    routes.push(match[1]);
  }
  return routes;
}

function walkFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'unpackage', 'dist'].includes(entry.name)) {
      continue;
    }
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(filePath, files);
    } else if (/\.(vue|js|php)$/.test(entry.name)) {
      files.push(filePath);
    }
  }
  return files;
}

assertNoOldRoutePrefixes('Menu_', menuSource);
for (const route of extractPhpArrayRoutes(menuSource, 'link')) {
  assertRegisteredRoute('Menu_', route);
}

const adSource = fs.readFileSync(path.join(root, 'server/application/common/model/Ad.php'), 'utf8');
assertNoOldRoutePrefixes('Ad', adSource);
for (const route of extractPhpArrayRoutes(adSource, 'path')) {
  assertRegisteredRoute('Ad', route);
}
for (const route of extractPhpArrayRoutes(adSource, 'mobile')) {
  assertRegisteredRoute('Ad mobile path', route);
}

for (const filePath of walkFiles(path.join(root, 'uniapp'))) {
  if (filePath.endsWith(path.join('uniapp', 'tests', 'subpackage-size.test.js'))) {
    continue;
  }
  const relativePath = path.relative(root, filePath);
  assertNoOldRoutePrefixes(relativePath, fs.readFileSync(filePath, 'utf8'));
}

const noticeSettingSource = fs.readFileSync(
  path.join(root, 'server/application/common/model/NoticeSetting.php'),
  'utf8'
);
assert(
  !noticeSettingSource.includes("'/pages/order_details/order_details"),
  'NoticeSetting order scene points to old order details route'
);
assert(
  noticeSettingSource.includes("'/bundle_order/pages/order_details/order_details"),
  'NoticeSetting order scene should point to registered order details route'
);

const liveGoodsAddSource = fs.readFileSync(
  path.join(root, 'server/application/admin/view/live_goods/add.html'),
  'utf8'
);
assert(
  !/(?<!bundle_activity\/)pages\/goods_details\/goods_details/.test(liveGoodsAddSource),
  'live goods admin page contains old goods details route'
);
assert(
  liveGoodsAddSource.includes('bundle_activity/pages/goods_details/goods_details'),
  'live goods admin page should use registered goods details route'
);

const menuDecorateLogicSource = fs.readFileSync(
  path.join(root, 'server/application/admin/logic/MenuDecorateLogic.php'),
  'utf8'
);
assert(
  /public static function centerList[\s\S]*?Menu_::getMenuContent\(2,\$item\['link_address'\]\)/.test(menuDecorateLogicSource),
  'MenuDecorateLogic centerList should resolve personal-center menu links with scene 2'
);

console.log('menu route tests passed');
