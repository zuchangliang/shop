const fs = require('fs');
const path = require('path');

const LIMIT_BYTES = 2048 * 1024;

function requireTool(name) {
  const candidates = [
    name,
    `/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli/node_modules/${name}`
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
    }
  }

  throw new Error(`Cannot find ${name}. Run this script on a machine with HBuilderX installed.`);
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function packageSize(files) {
  return files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
}

function packageSizes(mpWeixinRoot) {
  const appPath = path.join(mpWeixinRoot, 'app.json');
  if (!fs.existsSync(appPath)) {
    throw new Error(`Missing app.json in ${mpWeixinRoot}`);
  }

  const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));
  const subPackageRoots = new Set((app.subPackages || []).map((subPackage) => subPackage.root));
  const files = listFiles(mpWeixinRoot);
  const mainFiles = files.filter((file) => {
    const topLevelName = path.relative(mpWeixinRoot, file).split(path.sep)[0];
    return !subPackageRoots.has(topLevelName);
  });

  const sizes = {
    main: packageSize(mainFiles)
  };
  for (const root of subPackageRoots) {
    sizes[root] = packageSize(listFiles(path.join(mpWeixinRoot, root)));
  }
  return sizes;
}

function mergeMissingFiles(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) return;
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      mergeMissingFiles(sourcePath, targetPath);
    } else if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function minifyJsonOrWxml(file) {
  const source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.json')) {
    try {
      fs.writeFileSync(file, JSON.stringify(JSON.parse(source)));
    } catch (error) {
      // Some generated JSON-like files may not be strict JSON. Leave them untouched.
    }
    return;
  }

  fs.writeFileSync(file, source.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' '));
}

function normalizeWxssImport(source) {
  return source.replace(/@import\s+url\(([^)]+)\);/g, (_match, importPath) => {
    const normalizedPath = importPath.trim().replace(/^['"]|['"]$/g, '');
    return `@import "${normalizedPath}";`;
  });
}

function normalizeSubPackageOutput(mpWeixinRoot) {
  const appPath = path.join(mpWeixinRoot, 'app.json');
  const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));
  let appChanged = false;

  for (const subPackage of app.subPackages || []) {
    const normalizedPages = (subPackage.pages || []).map((page) => {
      let next = page;
      while (next.startsWith(`${subPackage.root}/`)) {
        next = next.slice(subPackage.root.length + 1);
      }
      return next;
    });

    if (normalizedPages.some((page, index) => page !== subPackage.pages[index])) {
      subPackage.pages = normalizedPages;
      appChanged = true;
    }

    const subPackageRoot = path.join(mpWeixinRoot, subPackage.root);
    const nestedRoot = path.join(subPackageRoot, subPackage.root);
    if (fs.existsSync(nestedRoot)) {
      mergeMissingFiles(nestedRoot, subPackageRoot);
      fs.rmSync(nestedRoot, { recursive: true, force: true });
    }
  }

  if (appChanged) {
    fs.writeFileSync(appPath, JSON.stringify(app, null, 2));
  }

  for (const file of listFiles(mpWeixinRoot)) {
    if (!/\.(js|json|wxml|wxss)$/.test(file)) continue;
    let source = fs.readFileSync(file, 'utf8');
    let next = source;
    for (const subPackage of app.subPackages || []) {
      next = next
        .split(`/${subPackage.root}/${subPackage.root}/pages/`)
        .join(`/${subPackage.root}/pages/`);
      next = next
        .split(`${subPackage.root}/${subPackage.root}/pages/`)
        .join(`${subPackage.root}/pages/`);
    }
    if (next !== source) {
      fs.writeFileSync(file, next);
    }
  }
}

function pruneStalePages(mpWeixinRoot) {
  normalizeSubPackageOutput(mpWeixinRoot);

  const appPath = path.join(mpWeixinRoot, 'app.json');
  const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));

  const keepRootPages = new Set(
    (app.pages || [])
      .filter((page) => page.startsWith('pages/'))
      .map((page) => page.split('/')[1])
  );
  const rootPagesDir = path.join(mpWeixinRoot, 'pages');
  if (fs.existsSync(rootPagesDir)) {
    for (const entry of fs.readdirSync(rootPagesDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !keepRootPages.has(entry.name)) {
        fs.rmSync(path.join(rootPagesDir, entry.name), { recursive: true, force: true });
      }
    }
  }

  for (const subPackage of app.subPackages || []) {
    const keepSubPages = new Set((subPackage.pages || []).map((page) => page.split('/')[1]));
    const subPagesDir = path.join(mpWeixinRoot, subPackage.root, 'pages');
    if (!fs.existsSync(subPagesDir)) continue;
    for (const entry of fs.readdirSync(subPagesDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !keepSubPages.has(entry.name)) {
        fs.rmSync(path.join(subPagesDir, entry.name), { recursive: true, force: true });
      }
    }
  }
}

function compactMpWeixin(mpWeixinRoot, options = {}) {
  const root = path.resolve(mpWeixinRoot);
  const terser = requireTool('terser');
  const CleanCSS = requireTool('clean-css');
  const cleanCss = new CleanCSS({ level: 2, inline: false });

  pruneStalePages(root);

  for (const file of listFiles(root)) {
    if (file.endsWith('.js')) {
      const source = fs.readFileSync(file, 'utf8');
      const result = terser.minify(source, {
        compress: true,
        mangle: true,
        output: {
          comments: false
        }
      });
      if (result.error) throw result.error;
      fs.writeFileSync(file, result.code || source);
    } else if (file.endsWith('.wxss') || file.endsWith('.css')) {
      const source = fs.readFileSync(file, 'utf8');
      const result = cleanCss.minify(source);
      if (result.errors && result.errors.length) {
        throw new Error(result.errors.join('\n'));
      }
      fs.writeFileSync(file, normalizeWxssImport(result.styles || source));
    } else if (file.endsWith('.json') || file.endsWith('.wxml')) {
      minifyJsonOrWxml(file);
    }
  }

  const sizes = packageSizes(root);
  const oversized = Object.entries(sizes).filter(([, size]) => size > LIMIT_BYTES);
  if (oversized.length) {
    const details = oversized
      .map(([name, size]) => `${name} ${(size / 1024).toFixed(1)}KB`)
      .join(', ');
    throw new Error(`mp-weixin package size exceeds 2048KB: ${details}`);
  }

  if (!options.silent) {
    for (const [name, size] of Object.entries(sizes)) {
      console.log(`${name}: ${(size / 1024).toFixed(1)}KB`);
    }
  }

  return sizes;
}

if (require.main === module) {
  const defaultTargets = [
    path.join('unpackage', 'dist', 'dev', 'mp-weixin'),
    path.join('unpackage', 'dist', 'build', 'mp-weixin')
  ];
  const target = process.argv[2] || defaultTargets.find((candidate) => {
    return fs.existsSync(path.join(candidate, 'app.json'));
  }) || defaultTargets[0];
  compactMpWeixin(target);
}

module.exports = {
  compactMpWeixin,
  packageSizes
};
