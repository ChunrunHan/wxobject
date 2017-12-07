// pages/my/index.js

const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()


Page({
    data: {},
    onLoad: function (options) {
        $.setTitle('我的')
    },
    logout: function () {
        $.confirm('确认退出？', function () {
            wx.removeStorageSync('unionId')
            wx.removeStorageSync('openId')
            wx.removeStorageSync('token')
            $.alert('已退出!')
        })
    },
    order: function () {
        $.login().then(function () {
           $.jump('../order/index')
        })
    },
    address: function () {
        $.login().then(function () {
            $.jump('../address/index')
        })
    }
})