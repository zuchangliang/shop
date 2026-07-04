const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'bundle_user', 'pages', 'user_vip', 'user_vip.vue'),
  'utf8'
);

assert.strictEqual(
  /previous-margin="(?!0(?:rpx|px)?")[^"]+"/.test(source),
  false,
  'user_vip swiper should not expose the previous card because cropped member names look broken'
);

assert.strictEqual(
  /next-margin="(?!0(?:rpx|px)?")[^"]+"/.test(source),
  false,
  'user_vip swiper should not expose the next card because cropped member names look broken'
);

assert.strictEqual(
  /width:\s*600rpx/.test(source),
  false,
  'user_vip card should use responsive width instead of fixed 600rpx'
);

assert.strictEqual(
  /width:\s*540rpx/.test(source),
  false,
  'user_vip progress bar should use responsive width instead of fixed 540rpx'
);
