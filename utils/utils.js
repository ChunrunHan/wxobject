/**
 *  kouchao 创建于 2017/11/20
 */
const api = require('api');

const imgUrl = `https://dev.yezhubao.net/oss_mall`
const promise = require('promise').wxPromisify;
const ajax = require('ajax');
var QQMapWX = require('qqmap-wx-jssdk.min');
var qqmapsdk = new QQMapWX({
    key: 'WHGBZ-5JZKO-4PMWR-SEXNN-4O54Z-SNFO5'
})
module.exports = {
    get: ajax.get,
    post: ajax.post,
    put: ajax.put,
    del: ajax.del,
    wxLogin: promise(wx.login),
    setTitle: function (title) {
        wx.setNavigationBarTitle({
            title: title
        })
    },
    isMobile: function (number) {
        var reg = /^1[3|4|5|7|8][0-9]{9}$/;
        return reg.test(number)
    },
    alert: function (content) {
        wx.showModal({
            content: content
        })
    },
    confirm: function (content, fn1, fn2) {
        wx.showModal({
            title: '提示',
            content: content,
            success: function (res) {
                if (res.confirm) {
                    fn1()
                } else if (res.cancel) {
                    if (fn2) {
                        fn2()
                    }

                }
            }
        })
    },
    showLoading: function (title) {
        wx.showLoading({
            title: title || '加载中',
        })
    },
    hideLoading: function () {
        wx.hideLoading()
    },
    getLocation: promise(wx.getLocation),
    qqmapsdk: qqmapsdk,
    imgUrl: imgUrl,
    getTime: function (number) {
        var time = parseInt((number - new Date().getTime()) / 1000)
        var h = parseInt(time / 3600)
        var m = parseInt(time / 60 % 60)
        var s = parseInt(time % 60)

        h = h < 0 ? '0' : h
        m = m < 0 ? '0' : m
        s = s < 0 ? '0' : s

        if (!((h + ':' + m + ':' + s) == '00:00:00')) {
            h = h < 10 ? '0' + h : h
            m = m < 10 ? '0' + m : m
            s = s < 10 ? '0' + s : s
        }

        return h + ':' + m + ':' + s
    },
    wxRequestPayment: promise(wx.requestPayment),
    login: function () {
        var _this = this
        return new Promise(function (resolve, reject) {
            _this.wxLogin().then(function (res) {
                wx.setStorageSync('code', res.code)

                var unionId = wx.getStorageSync('unionId')
                var openId = wx.getStorageSync('openId')
                if (openId) {
                    _this.get(api.login({
                        unionId,
                        openId
                    })).then(function (res) {
                        if (res.data.errCode !== 0) {
                            wx.navigateTo({
                                url: '../mobile/index'
                            })
                        } else {
                            wx.setStorageSync('token', res.data.data.token)
                            resolve(res)
                        }
                    })
                } else {
                    wx.navigateTo({
                        url: '../mobile/index'
                    })
                }

            }).catch(function (err) {
                reject(err)
            })
        })


    }

}