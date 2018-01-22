// pages/my/index.js

const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()


Page({
    data: {
      islogin: wx.getStorageSync('token')
    },
    onLoad: function (options) {
        $.setTitle('我的')
    },
    onShow:function(){
      this.setData({
        islogin: wx.getStorageSync('token')
      })
    },
    login: function (){
      $.jump('../mobile/index')
    },
    logout: function () {
      var _this = this;
        $.confirm('确认退出？', function () {
            wx.removeStorageSync('unionId')
            wx.removeStorageSync('openId')
            wx.removeStorageSync('token')
            $.alert('已退出!')
            _this.setData({
              islogin: ''
            })
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
    },
    coupon: function(){
        $.jump('../coupon/index')
    }
})