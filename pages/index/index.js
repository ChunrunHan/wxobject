//index.js
//获取应用实例
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()
const swiperCofing = {
    indicatorDots: false,
    indicatorColor: 'rgba(0, 0, 0, .3)',
    indicatorActiveColor: '#000000',
    autoplay: true,
    current: 0,
    interval: 2000,
    duration: 500,
    circular: true,
    vertical: false
}
Page({
    data: {
        imgUrls: [
            'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        swiperCofing: swiperCofing
    },
    onLoad: function () {
        this.login()
    },
    login: function () {
        $.wxLogin().then(function (res) {
            wx.setStorageSync('code', res.code)

            var unionId = wx.getStorageSync('unionId')
            if (unionId) {
                $.showLoading('正在登陆')
                $.get(api.login({
                    unionId
                })).then(function (res) {
                    $.hideLoading()

                    if(res.data.errCode !== 0){
                        wx.reLaunch({
                            url: '../mobile/index'
                        })
                    }
                })
            } else {
                wx.reLaunch({
                    url: '../mobile/index'
                })
            }

        })
    }
})
