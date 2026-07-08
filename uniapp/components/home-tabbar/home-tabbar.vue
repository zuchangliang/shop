<template>
    <view class="xzj-tabbar">
        <view
            v-for="item in tabs"
            :key="item.key"
            class="xzj-tab-item"
            :class="{ active: current === item.key }"
            @tap="switchTab(item.path)"
        >
            <view class="xzj-tab-icon">
                <u-icon
                    :name="item.icon"
                    :size="current === item.key ? item.activeSize : item.size"
                    :color="current === item.key ? '#a01421' : 'rgba(255, 255, 255, 0.72)'"
                ></u-icon>
            </view>
            <text>{{ item.text }}</text>
        </view>
    </view>
</template>

<script>
export default {
    name: 'home-tabbar',
    props: {
        current: {
            type: String,
            default: 'index'
        }
    },
    data() {
        return {
            tabs: [
                {
                    key: 'index',
                    text: '首页',
                    icon: 'home',
                    path: '/pages/index/index',
                    size: 31,
                    activeSize: 38
                },
                {
                    key: 'sort',
                    text: '分类',
                    icon: 'grid',
                    path: '/pages/sort/sort',
                    size: 31,
                    activeSize: 36
                },
                {
                    key: 'cart',
                    text: '购物车',
                    icon: 'shopping-cart',
                    path: '/pages/shop_cart/shop_cart',
                    size: 31,
                    activeSize: 36
                },
                {
                    key: 'user',
                    text: '我的',
                    icon: 'account',
                    path: '/pages/user/user',
                    size: 31,
                    activeSize: 36
                }
            ]
        }
    },
    methods: {
        switchTab(url) {
            uni.switchTab({
                url
            })
        }
    }
}
</script>

<style lang="scss">
.xzj-tabbar {
    position: fixed;
    left: 50%;
    right: auto;
    bottom: 0;
    z-index: 998;
    width: 100%;
    max-width: var(--xzj-page-max-width);
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: calc(var(--xzj-tabbar-height) + constant(safe-area-inset-bottom));
    height: calc(var(--xzj-tabbar-height) + env(safe-area-inset-bottom));
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--xzj-page-bg);
    box-shadow: 0 -6px 18px rgba(90, 5, 12, 0.18);
}

.xzj-tab-item {
    width: 25%;
    height: 58px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.68);
    font-size: 10px;
    line-height: 1.1;
}

.xzj-tab-icon {
    width: 27px;
    height: 27px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
}

.xzj-tab-item.active {
    color: #fff7df;
}

.xzj-tab-item.active .xzj-tab-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 3px;
    border-radius: 9px;
    background: #f1f1f1;
    box-shadow: 0 3px 10px rgba(80, 0, 0, 0.16);
}
</style>
