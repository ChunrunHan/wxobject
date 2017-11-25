// pages/mobile/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()
Page({
    data: {
        getSmsCodeText: '获取验证码',
        mobile: ''
    },
    onLoad: function (options) {
        $.setTitle('绑定手机号')
    },
    getSmsCode: function () {
        var _this = this
        var mobile = _this.data.mobile

        if(!$.isMobile(mobile)){
            $.alert('请输入正确的手机号')
            return false
        }

        if(_this.data.getSmsCodeText === '获取验证码'){

            $.showLoading('正在获取验证码')
            var count = 59
            console.log(`getSmsCode`)
            this.setData({
                getSmsCodeText: '60秒后重置'
            })
            var time = setInterval(function () {
                if(count == 1){
                    _this.setData({
                        getSmsCodeText: `获取验证码`
                    })
                    clearInterval(time)
                }else {
                    _this.setData({
                        getSmsCodeText: `${count--}秒后重置`
                    })
                }
            }, 1000)

            $.get(api.getSms(mobile)).then(function () {
                $.hideLoading()
                wx.showToast({
                    title: '验证码已发送',
                    icon: 'success',
                    duration: 1000
                })
            })
        }
    },
    inputMobile: function (e) {
        this.setData({
            mobile: e.detail.value
        })
    },
    inputSmsCode: function (e) {
        this.setData({
            smsValidateCode : e.detail.value
        })
    },
    login: function () {
        var _this = this
        var mobile = _this.data.mobile
        var smsValidateCode = _this.data.smsValidateCode
        var jsCode = wx.getStorageSync('code')
        if(!smsValidateCode){
            $.alert('请输入短信验证码')
            return false
        }

        if(!$.isMobile(mobile)){
            $.alert('请输入正确的手机号')
            return false
        }
        $.showLoading('正在登陆')
        $.get(api.login({
            mobile,
            smsValidateCode,
            jsCode
        })).then(function (res) {
            $.hideLoading()

            if(res.data.errCode == 0){
                wx.setStorageSync('unionId', res.data.data.wxUnionId)
                wx.setStorageSync('openId', res.data.data.wxOpenId)
                wx.reLaunch({
                    url: '../index/index'
                })
            }else {
                $.alert(res.data.errMsg || '登陆失败')
            }

            console.log(res.data.data.unionId)
        })

    }
})