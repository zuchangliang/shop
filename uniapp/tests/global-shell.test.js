const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const nonHomeTabPages = [
  'pages/sort/sort.vue',
  'pages/shop_cart/shop_cart.vue',
  'pages/user/user.vue'
]

const tabbar = read('components/home-tabbar/home-tabbar.vue')
assert(
  tabbar.includes("name: 'home-tabbar'") || tabbar.includes('name: "home-tabbar"'),
  'home-tabbar component should expose a stable component name'
)
assert(
  tabbar.includes('xzj-tabbar') && tabbar.includes('switchTab'),
  'home-tabbar should own home-only tabbar markup and switching behavior'
)

const index = read('pages/index/index.vue')
assert(
  index.includes('class="index xzj-home"'),
  'home page should own the xzj-home shell class'
)
assert(
  index.includes('<home-tabbar current="index"'),
  'home page should render home-tabbar'
)
assert(
  !index.includes('setTabbar()\n        this.hideSystemTabbar()'),
  'home page should not show the native tabbar before hiding it'
)
assert(
  index.includes('[0, 80, 240, 600, 1200]'),
  'home page should repeatedly hide the native tabbar after async app config updates'
)
assert(
  index.includes('xzj-home-page') && index.includes('applyHomeShell') && index.includes('removeHomeShell'),
  'home page should toggle the route-scoped body class for the H5 native tabbar'
)
assert(
  index.includes('--xzj-page-max-width') && index.includes('--xzj-tabbar-height'),
  'home page should define its own shell CSS variables'
)
assert(
  index.includes('hotAdName') && index.includes('comboAdName') && index.includes('seckillAdName'),
  'home page ad cards should render ad names separately from ad images'
)

for (const file of nonHomeTabPages) {
  const source = read(file)
  assert(
    !source.includes('xzj-page') && !source.includes('xzj-home'),
    `${file} should not use the home shell class`
  )
  assert(
    !source.includes('home-tabbar') && !source.includes('common-tabbar'),
    `${file} should use the native tabbar, not the home-only tabbar`
  )
}

const app = read('App.vue')
assert(
  !app.includes('--xzj-page-max-width') && !app.includes('uni.hideTabBar'),
  'App.vue should not define or force home-only page shell behavior globally'
)
assert(
  app.includes('body.xzj-home-page uni-tabbar .uni-tabbar'),
  'App.vue should expose only the body-class gated H5 native tabbar override'
)
