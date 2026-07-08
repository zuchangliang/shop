<template>
    <view class="index xzj-home">
        <!-- #ifdef H5 -->
        <download-nav v-if="isShowDownload"></download-nav>
        <!-- #endif -->
        <bubble-tips top="50rpx" :discharge="isDischarge"></bubble-tips>

        <view class="xzj-hero">
            <navigator
                class="xzj-search"
                hover-class="none"
                url="/bundle_activity/pages/goods_search/goods_search"
            ></navigator>
        </view>

        <view class="xzj-content">
            <view class="xzj-feature-grid">
                <view class="xzj-panel xzj-hot-panel">
                    <view class="xzj-ad-title">{{ hotAdName }}</view>
                    <swiper
                        v-if="hotBannerList.length"
                        class="xzj-hot-image-swiper"
                        autoplay="true"
                        circular="true"
                        :indicator-dots="hotBannerList.length > 1"
                        :interval="3500"
                        :duration="500"
                    >
                        <swiper-item
                            v-for="(item, index) in hotBannerList"
                            :key="index"
                            @tap="tapBanner(item)"
                        >
                            <image
                                class="xzj-hot-banner"
                                :src="item.image"
                                mode="scaleToFill"
                            ></image>
                        </swiper-item>
                    </swiper>
                    <view class="xzj-hot-list" v-if="hotGoods.length">
                        <view
                            class="xzj-hot-line"
                            v-for="(item, index) in hotGoods.slice(1, 5)"
                            :key="item.id"
                        >
                            <text class="xzj-hot-rank">TOP·{{ index + 2 }}</text>
                            <text class="xzj-hot-name line1">{{ item.name }}</text>
                        </view>
                    </view>
                </view>

                <view
                    class="xzj-panel xzj-combo-panel"
                >
                    <view class="xzj-ad-title">{{ comboAdName }}</view>
                    <swiper
                        v-if="comboBannerList.length"
                        class="xzj-panel-swiper"
                        autoplay="true"
                        circular="true"
                        :indicator-dots="comboBannerList.length > 1"
                        :interval="3600"
                        :duration="500"
                    >
                        <swiper-item
                            v-for="(item, index) in comboBannerList"
                            :key="index"
                            @tap="tapBanner(item, comboUrl)"
                        >
                            <image
                                class="xzj-panel-bg"
                                :src="item.image"
                                mode="scaleToFill"
                            ></image>
                        </swiper-item>
                    </swiper>
                </view>
            </view>

            <view
                class="xzj-seckill-card"
            >
                <view class="xzj-ad-title">{{ seckillAdName }}</view>
                <swiper
                    v-if="seckillBannerList.length"
                    class="xzj-seckill-swiper"
                    autoplay="true"
                    circular="true"
                    :indicator-dots="seckillBannerList.length > 1"
                    :interval="3700"
                    :duration="500"
                >
                    <swiper-item
                        v-for="(item, index) in seckillBannerList"
                        :key="index"
                        @tap="tapBanner(item, '/bundle_activity/pages/goods_seckill/goods_seckill')"
                    >
                        <image
                            class="xzj-seckill-bg"
                            :src="item.image"
                            mode="scaleToFill"
                        ></image>
                    </swiper-item>
                </swiper>
                <view class="xzj-seckill-time" v-if="seckillGoods.length">
                    <text>{{ seckill.start_time }}点场</text>
                    <u-count-down
                        :timestamp="remainTime"
                        separator-color="#fff"
                        color="#fff"
                        :separator-size="22"
                        :font-size="22"
                        bg-color="transparent"
                    ></u-count-down>
                </view>
            </view>

            <view class="xzj-quick-wrap">
                <navigator
                    class="xzj-quick-item"
                    hover-class="none"
                    url="/bundle_activity/pages/hot_list/hot_list"
                >
                    <image src="/static/images/home-xzj/quick-hot.jpg" mode="aspectFit"></image>
                    <text>热卖榜单</text>
                </navigator>
                <navigator
                    class="xzj-quick-item"
                    hover-class="none"
                    url="/bundle_activity/pages/news_list/news_list"
                >
                    <image src="/static/images/home-xzj/quick-news.jpg" mode="aspectFit"></image>
                    <text>商城资讯</text>
                </navigator>
                <view class="xzj-quick-item" @tap="goPage('/bundle_user/pages/user_vip/user_vip')">
                    <image src="/static/images/home-xzj/quick-member.jpg" mode="aspectFit"></image>
                    <text>会员专区</text>
                </view>
                <view class="xzj-quick-item" @tap="goPage('/bundle_user/pages/user_collection/user_collection')">
                    <image src="/static/images/home-xzj/quick-favorite.jpg" mode="aspectFit"></image>
                    <text>我的收藏</text>
                </view>
            </view>

            <view class="xzj-news" v-if="news.length">
                <text class="xzj-news-label">最新</text>
                <swiper
                    autoplay="true"
                    vertical="true"
                    circular="true"
                    :interval="3000"
                    class="xzj-news-swiper"
                >
                    <swiper-item v-for="(item, index) in news" :key="index">
                        <navigator
                            class="xzj-news-title line1"
                            hover-class="none"
                            url="/bundle_activity/pages/news_list/news_list"
                        >
                            {{ item.title }}
                        </navigator>
                    </swiper-item>
                </swiper>
            </view>
        </view>

        <home-tabbar current="index"></home-tabbar>

        <u-popup class="coupons-popup" v-model="showCoupop" mode="center">
            <view class="wrap">
                <image class="coupon-bg" src="/static/images/home_coupon_bg.png"></image>
                <scroll-view :scroll-y="true" style="height: 460rpx; margin-top: 300rpx">
                    <view class="item" v-for="(item, index) in couponPopList" :key="item.id">
                        <image class="img" src="/static/images/pop_bg_coupon.png"></image>
                        <view class="row item-con">
                            <view class="row-center price">
                                <price-format
                                    color="#FF2C3C"
                                    :showSubscript="true"
                                    :subscriptSize="32"
                                    :first-size="56"
                                    :second-size="40"
                                    :price="item.money"
                                />
                            </view>
                            <view class="ml20 mr20">
                                <view class="bold md lighter">{{ item.name }}</view>
                                <view class="xs muted mt10">{{ item.use_goods_type }}</view>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>
            <view class="white row-center bg-primary lg btn br60" @click="showCoupop = false"
                >立即领取</view
            >
        </u-popup>
        <!-- #ifdef APP-PLUS -->
        <lyg-popup
            v-if="appConfig.app_agreement"
            title="用户使用及隐私保护政策提示"
            protocolPath="/bundle_order/pages/server_explan/server_explan?type=0"
            policyPath="/bundle_order/pages/server_explan/server_explan?type=1"
            policyStorageKey="has_read_privacy"
        >
        </lyg-popup>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <!-- 用户隐私协议弹框 -->
        <privacy-popup v-model="showPrivacyPopup"></privacy-popup>
        <!-- #endif -->

        <!-- 无网络提示 -->
        <u-no-network z-index="1200" @retry="handleRetry"></u-no-network>

        <u-back-top
            :scroll-top="scrollTop"
            :top="1000"
            :customStyle="{
                backgroundColor: '#FFF',
                color: '#000',
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)'
            }"
        ></u-back-top>
    </view>
</template>

<script>
import { mapMutations, mapGetters, mapActions } from 'vuex'
import { getHome, getMenu, getBestList, getAdList } from '@/api/store'
import { loadingType } from '@/utils/type'
import { loadingFun, menuJump, arraySlice, setTabbar, getRect, trottle } from '@/utils/tools'
import { toLogin } from '@/utils/login'
import Cache from '@/utils/cache'
import { getConfig, userShare, getRegisterCoupon } from '@/api/app'
import { baseURL } from '@/config/app'
const app = getApp()
export default {
    data() {
        return {
            scrollTop: 0,
            navSwiperH: 374,
            logo: '',
            navHeight: 0,
            currentSwiper: 0,
            page: 1,
            status: loadingType.LOADING,
            remainTime: '',
            navBg: 0,
            navList: [],
            news: [],
            goodsList: [],
            seckill: {},
            seckillGoods: [],
            hotGoods: [],
            newGoods: [],
            activityArea: [],
            hotBanners: [],
            comboBanners: [],
            seckillBanners: [],
            showCoupop: false,
            couponPopList: [],
            coupon: [],
            isDischarge: true,
            enable: true,
            hasBootstrappedHome: false,
            isShowDownload: false,
            showPrivacyPopup: false //微信用户隐私协议
        }
    },
    mounted() {
        this.applyHomeShell()
        this.bootstrapHomePage()
    },
    async onLoad(options) {
        // #ifdef MP-WEIXIN
        if (wx.getPrivacySetting) {
            wx.getPrivacySetting({
                success: (res) => {
                    console.log(res, '------') // 返回结果为: res = { needAuthorization: true/false, privacyContractName: '《xxx隐私保护指引》' }
                    if (res.needAuthorization) {
                        // 需要弹出隐私协议
                        setTimeout(() => {
                            uni.hideTabBar()
                        }, 100)
                        this.showPrivacyPopup = true
                    } else {
                        uni.showTabBar()
                    }
                },
                fail: (err) => {
                    uni.showTabBar()
                    console.log(err)
                }
            })
        } else {
            uni.showTabBar()
        }

        // #endif

        const createAnimation =
            typeof wx !== 'undefined' && wx.createAnimation
                ? wx.createAnimation
                : uni.createAnimation
        if (createAnimation) {
            this.headerAction = createAnimation({
                delay: 0,
                duration: 100,
                timingFunction: 'ease-in-out'
            })
        }
        this.onPageScroll = trottle(this.onPageScroll, 500, this)
        this.hideSystemTabbar()
        this.navHeight = app.globalData.navHeight
        this.isDischarge = false
        await this.getHomeFun()
        await this.getHomeImageAdsFun()
        await this.getMenuFun()
        this.getBestListFun()
        console.log(this.appConfig)
        // #ifdef H5
        if (options && options.isapp == 1) {
            this.isShowDownload = true
        }
        // #endif
    },
    async onShow() {
        this.applyHomeShell()
        this.$nextTick(function () {
            getRect('.index').then((res) => {
                if (res.top == 0) {
                    this.navBg = 0
                }
            })
        })

        // #ifdef H5
        this.enable = true
        // #endif
        this.hideSystemTabbar()
        await this.getHomeFun()
        this.getHomeImageAdsFun()
        this.getCartNum()
        this.isLogin && this.getRegisterCouponFun()

        // #ifdef MP
        wx.getUpdateManager().onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        wx.getUpdateManager().applyUpdate()
                    }
                }
            })
        })
        // #endif
    },
    onHide() {
        // #ifdef H5
        this.enable = false
        this.removeHomeShell()
        // #endif
    },
    onReachBottom() {
        this.getBestListFun()
    },
    onPullDownRefresh() {
        this.getHomeFun()
        this.getMenuFun()
        this.getHomeImageAdsFun()
    },
    onShareAppMessage() {
        console.log(this.inviteCode)
        const shareInfo = Cache.get('shareInfo')
        return {
            title: shareInfo.mnp_share_title,
            path: 'pages/index/index?invite_code=' + this.inviteCode,
            imageUrl: shareInfo.mnp_share_image
        }
    },
    onPageScroll(e) {
        const top = uni.upx2px(100)
        const { scrollTop } = e
        if (!this.enable) return
        let percent = scrollTop / top
        this.navBg = percent > 1 ? 1 : percent
        this.scrollTop = scrollTop
    },
    destroyed() {
        this.isDischarge = true
        this.removeHomeShell()
    },
    methods: {
        ...mapMutations(['SETCONFIG']),
        ...mapActions(['getCartNum', 'getUser']),
        async bootstrapHomePage() {
            if (this.hasBootstrappedHome) return
            this.hasBootstrappedHome = true
            this.hideSystemTabbar()
            this.isDischarge = false
            await Promise.allSettled([
                this.getHomeFun(),
                this.getMenuFun(),
                this.getHomeImageAdsFun(),
                this.getBestListFun()
            ])
            setTimeout(() => {
                if (!this.hotGoods.length && !this.goodsList.length) {
                    this.hydrateHomeByUniRequest()
                }
            }, 1200)
        },
        requestByUni(path, data = {}) {
            return new Promise((resolve) => {
                uni.request({
                    url: `${baseURL}/api/${path}`,
                    data,
                    method: 'GET',
                    header: {
                        'content-type': 'application/json'
                    },
                    success: (res) => {
                        if (typeof res.data === 'string') {
                            try {
                                resolve(JSON.parse(res.data))
                            } catch (e) {
                                resolve({})
                            }
                            return
                        }
                        resolve(res.data || {})
                    },
                    fail: (err) => {
                        console.log(err)
                        resolve({})
                    }
                })
            })
        },
        async hydrateHomeByUniRequest() {
            const [homeRes, bestRes, hotBannerRes, comboBannerRes, seckillBannerRes] = await Promise.all([
                this.requestByUni('index/lists'),
                this.requestByUni('goods/getBestList', { page_no: 1 }),
                this.requestByUni('ad_content/lists', { pid: 15, client: 1 }),
                this.requestByUni('ad_content/lists', { pid: 23, client: 1 }),
                this.requestByUni('ad_content/lists', { pid: 14, client: 1 })
            ])
            if (homeRes.code == 1 && homeRes.data) {
                const { coupon, news, seckill = {}, host_goods, shop_logo, new_goods, activity_area, xzj_ads = {} } =
                    homeRes.data
                this.remainTime = seckill.end_time
                    ? Math.abs(seckill.end_time - Date.parse(new Date()) / 1000)
                    : 0
                this.logo = shop_logo
                this.news = news || []
                this.seckillGoods = seckill.goods || []
                this.seckill = seckill
                this.hotGoods = host_goods || []
                this.coupon = coupon || []
                this.newGoods = new_goods || []
                this.activityArea = activity_area || []
                this.applyHomeImageAdsFromHome(xzj_ads)
            }
            if (bestRes.code == 1 && bestRes.data) {
                const { list = [], more } = bestRes.data
                this.goodsList = list
                this.page = 2
                this.status = more ? loadingType.LOADING : loadingType.FINISHED
            }
            this.hydrateHomeImageAds(hotBannerRes, comboBannerRes, seckillBannerRes)
        },
        // 网络重试刷新网络请求（解决在ios中首次进入时需要授权蜂窝加载空白页面问题
        async handleRetry() {
            console.log('网络重试刷')
            try {
                const { code, data } = await getConfig()
                if (code == 1) {
                    this.SETCONFIG(data)
                    setTabbar()
                }
            } catch (e) {
                uni.showTabBar()
            }
            this.applyHomeShell()
            this.getShareInfo()
            this.getUser()
        },
        async getShareInfo() {
            const { code, data } = await userShare()
            if (code == 1) {
                Cache.set('shareInfo', data)
            }
        },
        async getHomeFun() {
            const { code, data } = await getHome()
            uni.stopPullDownRefresh()
            if (code == 1) {
                const { coupon, news, seckill = {}, host_goods, shop_logo, new_goods, activity_area, xzj_ads = {} } =
                    data
                this.remainTime = seckill.end_time
                    ? Math.abs(seckill.end_time - Date.parse(new Date()) / 1000)
                    : 0
                this.logo = shop_logo
                this.news = news || []
                this.seckillGoods = seckill.goods || []
                this.seckill = seckill
                this.hotGoods = host_goods || []
                this.coupon = coupon || []
                this.newGoods = new_goods || []
                this.activityArea = activity_area || []
                this.applyHomeImageAdsFromHome(xzj_ads)
            }
        },

        applyHomeImageAdsFromHome(xzjAds = {}) {
            if (!xzjAds || typeof xzjAds !== 'object') return
            this.hotBanners = Array.isArray(xzjAds.hot) ? xzjAds.hot : []
            this.comboBanners = Array.isArray(xzjAds.combo) ? xzjAds.combo : []
            this.seckillBanners = Array.isArray(xzjAds.seckill) ? xzjAds.seckill : []
        },

        hydrateHomeImageAds(hotBannerRes = {}, comboBannerRes = {}, seckillBannerRes = {}) {
            if (hotBannerRes.code == 1 && Array.isArray(hotBannerRes.data) && hotBannerRes.data.length) {
                this.hotBanners = hotBannerRes.data
            }
            if (comboBannerRes.code == 1 && Array.isArray(comboBannerRes.data) && comboBannerRes.data.length) {
                this.comboBanners = comboBannerRes.data
            }
            if (seckillBannerRes.code == 1 && Array.isArray(seckillBannerRes.data) && seckillBannerRes.data.length) {
                this.seckillBanners = seckillBannerRes.data
            }
        },

        async getHomeImageAdsFun() {
            if (
                this.hotBanners.length ||
                this.comboBanners.length ||
                this.seckillBanners.length
            ) {
                return
            }
            try {
                const [hotBannerRes, comboBannerRes, seckillBannerRes] = await Promise.all([
                    getAdList({ pid: 15, client: 1 }),
                    getAdList({ pid: 23, client: 1 }),
                    getAdList({ pid: 14, client: 1 })
                ])
                this.hydrateHomeImageAds(hotBannerRes, comboBannerRes, seckillBannerRes)
            } catch (e) {
                console.log(e)
            }
            if (
                this.hotBanners.length ||
                this.comboBanners.length ||
                this.seckillBanners.length
            ) {
                return
            }
            const [hotBannerRes, comboBannerRes, seckillBannerRes] = await Promise.all([
                this.requestByUni('ad_content/lists', { pid: 15, client: 1 }),
                this.requestByUni('ad_content/lists', { pid: 23, client: 1 }),
                this.requestByUni('ad_content/lists', { pid: 14, client: 1 })
            ])
            this.hydrateHomeImageAds(hotBannerRes, comboBannerRes, seckillBannerRes)
        },

        async getMenuFun() {
            const { code, data } = await getMenu({
                type: 1
            })
            uni.stopPullDownRefresh()
            if (code == 1) {
                //   截取数组
                if (data.length <= 5) {
                    this.navSwiperH = 200
                } else {
                    this.navSwiperH = 374
                }
                this.navList = arraySlice(data)
            }
        },
        async getBestListFun() {
            let { page, goodsList, status } = this
            const data = await loadingFun(getBestList, page, goodsList, status)
            if (!data) return
            this.page = data.page
            this.goodsList = data.dataList
            this.status = data.status
        },
        async tapMenu(item) {
            if (!this.isLogin) return toLogin()
            menuJump(item)
        },
        goPage(url) {
            if (!this.isLogin) return toLogin()
            uni.navigateTo({
                url
            })
        },
        tapBanner(item, fallbackUrl = '') {
            const targetUrl = item && item.link ? item.link : fallbackUrl
            if (!targetUrl) return
            const params = item.params && Object.keys(item.params).length
                ? `?${Object.keys(item.params)
                      .map((key) => `${key}=${item.params[key]}`)
                      .join('&')}`
                : ''
            if (item.is_tab) {
                uni.switchTab({
                    url: targetUrl
                })
                return
            }
            if (/^https?:\/\//.test(targetUrl)) {
                // #ifdef H5
                window.location.href = targetUrl
                // #endif
                return
            }
            uni.navigateTo({
                url: `${targetUrl}${params}`
            })
        },
        hideSystemTabbar() {
            ;[0, 80, 240, 600, 1200].forEach((delay) => {
                setTimeout(() => {
                    uni.hideTabBar({
                        animation: false
                    })
                }, delay)
            })
        },
        getAdName(list, fallback) {
            const item = Array.isArray(list) ? list[0] : null
            return (item && (item.name || item.title || item.ad_name || item.desc)) || fallback
        },
        applyHomeShell() {
            // #ifdef H5
            if (typeof document !== 'undefined') {
                document.body.classList.add('xzj-home-page')
            }
            // #endif
            this.hideSystemTabbar()
        },
        removeHomeShell() {
            // #ifdef H5
            if (typeof document !== 'undefined') {
                document.body.classList.remove('xzj-home-page')
            }
            // #endif
        },
        swiperChange(e) {
            this.currentSwiper = e.detail.current
        },
        getRegisterCouponFun() {
            getRegisterCoupon().then((res) => {
                if (res.code == 1) {
                    if (res.data && res.data.length) {
                        this.showCoupop = true
                    }
                    this.couponPopList = res.data
                }
            })
        }
    },
    computed: {
        ...mapGetters(['cartNum', 'inviteCode', 'appConfig']),
        navBackground() {
            return this.seting.top_bg_image
                ? {
                      'background-image': `url(${this.seting.top_bg_image})`
                  }
                : {}
        },
        showLogo() {
            return this.seting.logo
        },
        navSearch() {
            if (this.showLogo === 0) return true

            return this.navBg < 1 ? false : true
        },
        seting() {
            const { index_setting } = this.appConfig
            return index_setting
        },
        comboUrl() {
            const item = this.activityArea[0]
            if (!item) return '/bundle_activity/pages/hot_list/hot_list'
            return `/bundle_activity/pages/activity_detail/activity_detail?id=${item.id}&name=${item.title}&title=${item.name}`
        },
        hotAdName() {
            return '热销榜单'
        },
        comboAdName() {
            return '超值组合'
        },
        seckillAdName() {
            return '超值秒杀'
        },
        hotBannerList() {
            return this.hotBanners
        },
        comboBannerList() {
            return this.comboBanners
        },
        seckillBannerList() {
            return this.seckillBanners
        }
    }
}
</script>

<style lang="scss">
.xzj-home {
    --xzj-page-bg: #a01421;
    --xzj-page-max-width: 430px;
    --xzj-tabbar-height: 66px;
    --xzj-tabbar-space: 90px;
    display: block;
    width: 100%;
    max-width: var(--xzj-page-max-width);
    min-height: 100vh;
    margin: 0 auto;
    padding-bottom: calc(var(--xzj-tabbar-space) + constant(safe-area-inset-bottom));
    padding-bottom: calc(var(--xzj-tabbar-space) + env(safe-area-inset-bottom));
    background: var(--xzj-page-bg);
    box-sizing: border-box;
    overflow-x: hidden;

    .xzj-hero {
        display: block;
        position: relative;
        height: min(78vw, 335px);
        background: url(../../static/images/home-xzj/hero-bg.jpg) no-repeat top center;
        background-size: 100% auto;
    }

    .xzj-search {
        position: absolute;
        left: min(3.467vw, 15px);
        right: min(3.467vw, 15px);
        bottom: min(2.667vw, 11px);
        height: min(9.067vw, 39px);
        z-index: 5;
        overflow: hidden;
        border-radius: min(2.667vw, 12px);
        opacity: 0.9;
        background: url(../../static/images/home-xzj/search-bar.jpg) no-repeat center center;
        background-size: 100% 100%;
        box-shadow: 0 4px 16px rgba(60, 0, 0, 0.12);
        transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;

        &:active,
        &:hover {
            opacity: 1;
            transform: translateY(-1px);
            box-shadow: 0 7px 20px rgba(60, 0, 0, 0.18);
        }
    }

    .xzj-content {
        display: block;
        padding: min(1.333vw, 6px) min(3.467vw, 15px) min(4.267vw, 18px);
        border-radius: 0 0 min(3.733vw, 16px) min(3.733vw, 16px);
        background: #a01421 url(../../static/images/home-xzj/hero-bg.jpg) no-repeat top center;
        background-size: 100% auto;
        background-position-y: calc(-1 * min(78vw, 335px));
    }

    .xzj-feature-grid {
        display: flex;
        justify-content: space-between;
        padding-top: 0;
    }

    .xzj-panel {
        position: relative;
        width: calc((100% - min(4.533vw, 20px)) / 2);
        aspect-ratio: 760 / 841;
        box-sizing: border-box;
        overflow: hidden;
        border-radius: min(2.4vw, 10px);
        background: #991420;
    }

    .xzj-ad-title {
        position: absolute;
        top: min(1vw, 7px);
        left: min(2vw, 13px);
        z-index: 4;
        display: block;
        max-width: calc(100% - min(5.866vw, 26px));
        box-sizing: border-box;
        overflow: hidden;
        color: #fff;
        font-size: min(2.733vw, 16px);
        font-weight: 500;
        line-height: min(5.333vw, 23px);
        letter-spacing: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-shadow: 0 1px 2px rgba(68, 0, 0, 0.45);
    }

    .xzj-hot-panel {
        padding: min(7.467vw, 32px) min(1.867vw, 8px) min(1.867vw, 8px);
        background: #a41422;
    }

    .xzj-hot-image-swiper {
        position: relative;
        z-index: 1;
        width: 100%;
        height: min(17.6vw, 76px);
        display: block;
        overflow: hidden;
        margin-top: 0;
        border-radius: min(1.067vw, 5px);
        background: #f2d28d;
    }

    .xzj-hot-banner {
        width: 100%;
        height: 100%;
        display: block;
        overflow: hidden;
    }

    .xzj-hot-banner {
        ::v-deep img,
        ::v-deep .uni-image-img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
    }

    .xzj-hot-list {
        position: relative;
        z-index: 2;
        margin-top: min(1.6vw, 7px);
        padding-top: min(0.533vw, 2px);
        border-radius: min(1.067vw, 5px);
        background: transparent;
    }

    .xzj-hot-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: min(4.8vw, 21px);
        border-top: 1px solid rgba(255, 255, 255, 0.5);
        color: #fff7df;
        font-size: min(2.667vw, 11px);
    }

    .xzj-hot-rank {
        flex: none;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    .xzj-hot-name {
        max-width: min(21.867vw, 94px);
        text-align: right;
        color: #fff7df;
    }

    .xzj-combo-panel {
        padding: min(7.467vw, 32px) min(1.867vw, 8px) min(1.867vw, 8px);
        background: #a41422;
    }

    .xzj-panel-swiper,
    .xzj-seckill-swiper {
        position: relative;
        z-index: 1;
        width: 100%;
        display: block;
        overflow: hidden;
        margin-top: 0;
        border-radius: min(1.067vw, 5px);
    }

    .xzj-panel-swiper {
        height: 100%;
    }

    .xzj-seckill-swiper {
        height: 100%;
        display: block;
    }

    .xzj-panel-bg,
    .xzj-seckill-bg {
        width: 100%;
        height: 100%;
        display: block;
    }

    .xzj-panel-bg,
    .xzj-seckill-bg {
        ::v-deep img,
        ::v-deep .uni-image-img {
            width: 100% !important;
            height: 100% !important;
            object-fit: fill !important;
        }
    }

    .xzj-seckill-card {
        position: relative;
        display: block;
        aspect-ratio: 1100 / 513;
        margin-top: min(2.4vw, 10px);
        padding: min(7.467vw, 32px) min(1.867vw, 8px) min(1.867vw, 8px);
        box-sizing: border-box;
        overflow: hidden;
        border-radius: min(2.4vw, 10px);
        background: #a41422;
    }

    .xzj-seckill-time {
        position: absolute;
        left: min(5.333vw, 23px);
        right: min(5.333vw, 23px);
        bottom: min(3.2vw, 14px);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: #fff;
        font-size: min(2.667vw, 11px);
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        transform: scale(0.92);
        transform-origin: right center;
    }

    .xzj-quick-wrap {
        display: flex;
        align-items: center;
        justify-content: space-around;
        margin-top: min(3.2vw, 14px);
        padding: min(3.2vw, 14px) min(2.4vw, 10px) min(3.467vw, 15px);
        border-radius: min(3.2vw, 14px);
        background: rgba(255, 255, 255, 0.92);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 4px 14px rgba(73, 8, 12, 0.12);
    }

    .xzj-quick-item {
        width: 25%;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #111;
        font-size: min(2.167vw, 11px);
        font-weight: 500;
        line-height: 1.15;

        image {
            width: min(10.133vw, 44px);
            height: min(10.133vw, 44px);
            margin-bottom: min(1.333vw, 6px);
            border-radius: min(2.4vw, 10px);
        }

        ::v-deep img,
        ::v-deep .uni-image-img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
        }
    }

    .xzj-news {
        display: flex;
        align-items: center;
        height: min(8.533vw, 37px);
        margin-top: min(2.4vw, 10px);
        padding: 0 min(2.933vw, 13px);
        border-radius: min(1.6vw, 7px);
        background: #fff;
        color: #9e1420;
    }

    .xzj-news-label {
        flex: none;
        margin-right: min(2.133vw, 9px);
        padding: 2px min(1.6vw, 7px);
        border: 1px solid #9e1420;
        border-radius: 18px;
        font-size: min(2.667vw, 11px);
        line-height: 1.2;
    }

    .xzj-news-swiper {
        flex: 1;
        height: min(8.533vw, 37px);
    }

    .xzj-news-title {
        height: min(8.533vw, 37px);
        line-height: min(8.533vw, 37px);
        color: #333;
        font-size: min(3.2vw, 14px);
    }
}

// #ifdef H5
::v-deep .home-bg {
    background: url(../../static/images/bg_hometop.png) no-repeat;
    background-size: 100% auto;
}

// #endif
.home-bg {
    background: url(../../static/images/bg_hometop.png) no-repeat;
    background-size: 100% auto;
}
.index {
    .live-play {
        position: fixed;
        z-index: 999;
        bottom: 200rpx;
        right: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80rpx;
        height: 80rpx;
        border: $solid-border;
        border-radius: 50%;
        font-size: 32rpx;
        background-color: #ffffff;

        &__icon {
            animation: scale 0.5s infinite;
        }

        @keyframes scale {
            from {
                top: 0px;
                transform: scale(1);
            }
            to {
                transform: scale(1.2);
            }
        }
    }

    background-size: 100% auto;

    .logo-wrap {
        position: absolute;

        .logo {
            width: auto;
            height: 52rpx;
        }
    }

    .header {
        .navigation-bar {
            padding-top: var(--status-bar-height);
            box-sizing: border-box;
        }
    }

    .contain {
        .main {
            position: relative;
            z-index: 9;
            padding: 0 20rpx;

            .nav {
                position: relative;
                border-radius: 14rpx;

                .nav-item {
                    width: 20%;
                    margin-top: 30rpx;

                    .nav-icon {
                        width: 82rpx;
                        height: 82rpx;
                        margin-bottom: 15rpx;
                    }
                }

                .dots {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    bottom: 20rpx;
                    display: flex;

                    .dot {
                        width: 10rpx;
                        height: 6rpx;
                        border-radius: 6rpx;
                        margin-right: 10rpx;
                        background-color: rgba(255, 44, 60, 0.4);

                        &.active {
                            width: 20rpx;
                            background-color: $color-primary;
                        }
                    }
                }
            }

            .information {
                height: 76rpx;
                box-shadow: 0px 0px 14px rgba(0, 0, 0, 0.06);
                padding: 0 20rpx;
                box-sizing: border-box;
                border-radius: 14rpx;

                .news {
                    position: relative;

                    .shade {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        z-index: 100;
                    }
                }

                .icon-toutiao {
                    width: 114rpx;
                    height: 34rpx;
                }

                .gap-line {
                    height: 28rpx;
                    width: 1px;
                    background-color: #dcdddc;
                    margin: 0 30rpx;
                }
            }

            .special-area {
                .item {
                    width: 300rpx;
                    border-radius: 20rpx;
                    display: inline-block;
                    overflow: hidden;
                    margin-right: 20rpx;

                    .title {
                        padding: 10rpx 0;
                    }

                    .desc {
                        background-color: #fee9eb;
                        padding: 6rpx 20rpx;
                        border-radius: 60rpx;
                        max-width: 260rpx;
                    }
                }
            }

            .activity-header {
                height: 90rpx;
                padding: 0 20rpx;
            }

            .seckill {
                .dec {
                    background-color: #fffbdb;
                    width: 150rpx;
                }
            }

            .hot,
            .new-goods {
                .title-image {
                    width: 144rpx;
                    height: 55rpx;
                }
            }
        }

        .goods {
            .goods-title {
                height: 100rpx;

                .line {
                    width: 58rpx;
                    height: 1px;
                    background-color: #ccc;
                    margin: 0 22rpx;
                }

                .icon {
                    width: 38rpx;
                    height: 38rpx;
                }
            }
        }
    }

    .coupon-pop-container {
        background-image: url(../../static/images/home_coupon_bg.png);
        width: 638rpx;
        height: 804rpx;
        background-size: 100% 100%;
        padding-top: 323rpx;

        .coupon-pop-lists {
            .coupon-pop-item {
                background-image: url(../../static/images/pop_bg_coupon.png);
                width: 488rpx;
                height: 150rpx;
                background-size: 100% 100%;
                margin-top: 20rpx;

                .coupon-left {
                    width: 160rpx;
                    height: 100%;
                }

                .coupon-right {
                    padding-left: 30rpx;
                    border-left: 1rpx dashed $color-primary;
                }
            }
        }
    }

    .coupons-popup {
        .wrap {
            position: relative;
            width: 638rpx;
            height: 803rpx;
            overflow: hidden;

            .coupon-bg {
                position: absolute;
                top: 0;
                width: 100%;
                height: 100%;
            }

            .item {
                position: relative;
                width: 488rpx;
                height: 150rpx;
                margin: 0 auto 20rpx;
            }

            .img {
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: 0;
            }

            .item-con {
                z-index: 10;
                position: relative;
                padding: 20rpx 0;
                height: 100%;
                box-sizing: border-box;

                .price {
                    width: 160rpx;
                    border-right: 1px dashed $color-primary;
                    height: 100%;
                }
            }
        }

        .btn {
            width: 478rpx;
            height: 84rpx;
            margin: 20rpx auto;
            box-sizing: border-box;
            border: 3px solid #f8d07c;
        }
    }
}
</style>
