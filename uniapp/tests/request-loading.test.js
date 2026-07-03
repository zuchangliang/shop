const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadRequestWithUni(uni) {
  const source = fs
    .readFileSync(
      path.join(__dirname, '..', 'components', 'uview-ui', 'libs', 'request', 'index.js'),
      'utf8'
    )
    .replace(
      /import deepMerge from "..\/function\/deepMerge";/,
      'const deepMerge = (target = {}, source = {}) => Object.assign({}, target, source);'
    )
    .replace(
      /import validate from "..\/function\/test";/,
      'const validate = { url: () => true };'
    )
    .replace(/export default new Request\s*;?/, 'module.exports = new Request();');

  const context = {
    module: { exports: {} },
    exports: {},
    uni,
    Promise,
    Object,
    setTimeout,
    clearTimeout
  };

  vm.runInNewContext(source, context);
  return context.module.exports;
}

async function runRequest(responseDelay) {
  const events = [];
  const uni = {
    showLoading() {
      events.push('show');
    },
    hideLoading() {
      events.push('hide');
    },
    request(options) {
      setTimeout(() => {
        options.complete({
          statusCode: 200,
          data: { code: 1 }
        });
      }, responseDelay);
    }
  };

  const request = loadRequestWithUni(uni);
  request.setConfig({
    showLoading: true,
    loadingTime: 10
  });

  await request.request({
    url: 'https://example.com/api/login'
  });

  return events;
}

(async () => {
  assert.deepStrictEqual(
    await runRequest(0),
    [],
    'fast requests must not call uni.hideLoading before delayed uni.showLoading runs'
  );

  assert.deepStrictEqual(
    await runRequest(20),
    ['show', 'hide'],
    'slow requests should call uni.showLoading and uni.hideLoading as a pair'
  );
})();
