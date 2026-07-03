<template>
    <view>
        <view class="login-popup" v-if="showPop">
            <view class="login-popup-mask"></view>
            <view class="login-popup-panel">
                <view class="popup-header">
                    <image class="logo" mode="heightFix" :src="logo"></image>
                    <text class="title">{{ title }}</text>
                </view>
                <view class="popup-tips">
                    建议使用您的微信头像和昵称，以便获得更好的体验
                </view>
                <view class="popup-form">
                    <view class="profile-row">
                        <view class="profile-label"><text class="required">*</text>头像</view>
                        <view class="profile-content">
                            <button
                                class="select-avatar"
                                hover-class="none"
                                plain="true"
                                open-type="chooseAvatar"
                                @chooseavatar="onChooseAvatar"
                                @error="onChooseAvatarError"
                            >
                                <image
                                    class="avatar"
                                    :src="avatar"
                                    v-if="avatar"
                                />
                                <view class="select-btn" v-else>
                                    <text class="select-plus">+</text>
                                    <text>微信头像</text>
                                </view>
                            </button>
                        </view>
                    </view>
                    <form @submit="handleSubmit">
                        <view class="profile-row">
                            <view class="profile-label"><text class="required">*</text>昵称</view>
                            <view class="profile-content">
                                <input
                                    class="nickname-input"
                                    style="height: 60rpx"
                                    name="nickname"
                                    type="nickname"
                                    placeholder="请输入昵称"
                                    @input="onNicknameInput"
                                    @blur="onNicknameBlur"
                                />
                            </view>
                        </view>
                        <button
                            class="submit-btn bg-primary"
                            form-type="submit"
                        >
                            确定
                        </button>
                    </form>
                    <view class="close-btn" @tap="onClose">暂不登录</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { uploadFile } from "@/utils/tools";
export default {
    name: "mplogin-popup",
    props: {
        logo: {
            type: String,
            required: true
        },
		value: {
			type: Boolean,
            required: true
		},
        title: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            avatar: "",
            nickname: "",
        };
    },
    methods: {
        onChooseAvatar(e) {
            const avatarUrl = e.detail.avatarUrl;
            if (!avatarUrl) {
                return;
            }
            this.uploadAvatar(avatarUrl)
        },
        onChooseAvatarError(e) {
            const errMsg = (e && e.detail && e.detail.errMsg) || ''
            console.warn('chooseAvatar failed:', errMsg)
            if (/privacy|scope|declared/i.test(errMsg)) {
                return uni.showModal({
                    title: '头像授权失败',
                    content: '请在微信公众平台「用户隐私保护指引」中声明头像昵称用途后再测试。',
                    showCancel: false
                })
            }
            uni.showModal({
                title: '头像授权失败',
                content: '请检查微信版本、基础库版本或小程序隐私授权状态。',
                showCancel: false
            })
        },
        uploadAvatar(path) {
            uni.showLoading({
                title: "正在上传中...",
                mask: true,
            });
            uploadFile(path)
                .then((res) => {
                    uni.hideLoading();
                    this.avatar = res.url;
                })
                .catch(() => {
                    uni.hideLoading();
                    this.$toast({
                        title: "上传失败",
                    });
                });
        },
        onNicknameInput(e) {
            this.nickname = e.detail.value;
        },
        onNicknameBlur(e) {
            this.nickname = e.detail.value;
        },
        handleSubmit(e) {
            const formNickname = e.detail.value.nickname
            const nickname = formNickname || this.nickname
            const { avatar } = this
            if (!avatar) return this.$toast({
                title: '请添加头像'
            })
            if (!nickname) return this.$toast({
                title: '请输入昵称'
            })
            this.$emit('update', {
                avatar,
                nickname
            })
        },
		onClose() {
			this.showPop = false
			this.$emit('close')
		}
    },
	computed: {
		showPop: {
			get() {
				return this.value
			},
			set(val) {
				this.$emit('input', val)
			}
		}
	}
};
</script>

<style lang="scss">
.login-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1075;
}

.login-popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
}

.login-popup-panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 40rpx 40rpx 80rpx;
    padding-bottom: calc(80rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(80rpx + env(safe-area-inset-bottom));
    background: #fff;
    border-radius: 14rpx 14rpx 0 0;
    .popup-header {
        display: flex;
        align-items: center;
        .title {
            font-size: 38rpx;
            font-weight: bold;
        }
        .logo {
            flex: none;
            height: 80rpx;
            margin-right: 20rpx;
            border-radius: 4rpx;
        }
    }
    .popup-tips {
        color: #999;
        margin-top: 40rpx;
    }
    .popup-form {
        margin-top: 55rpx;
        .profile-row {
            display: flex;
            align-items: center;
            min-height: 106rpx;
            border-bottom: 1px solid #f2f2f2;
        }
        .profile-label {
            flex: none;
            width: 120rpx;
            font-size: 28rpx;
            color: #333;
            .required {
                color: #ff2c3c;
                margin-right: 4rpx;
            }
        }
        .profile-content {
            flex: 1;
            display: flex;
            align-items: center;
        }
        .select-avatar {
            width: 120rpx;
            height: 120rpx;
            padding: 0;
            margin: 0;
            border: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            color: #999;
            line-height: 1;
            &::after {
                border: none;
            }
            .avatar {
                width: 100%;
                height: 100%;
            }
            .select-btn {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                border: 1px dotted #ccc;
                font-size: 22rpx;
                line-height: 1.4;
				border-radius: 4rpx;
                .select-plus {
                    font-size: 42rpx;
                    line-height: 42rpx;
                }
            }
        }
        .nickname-input {
            width: 100%;
            font-size: 28rpx;
        }
        .submit-btn {
            height: 82rpx;
            line-height: 82rpx;
            border-radius: 41px;
            color: #fff;
            font-size: 30rpx;
            margin: 80rpx 35rpx 60rpx;
        }
        .close-btn {
            color: #999;
            font-size: 30rpx;
            text-align: center;
        }
    }
}
</style>
