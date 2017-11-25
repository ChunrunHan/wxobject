// pages/order/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()
var loading = false
Page({
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  getOrderList: function () {
      var _this = this
      var obj = {
          userId: 'xxx',
          status: 'xxx',
          page: _this.data.page
      }
      var url = api.getOrderList(obj)
      $.showLoading()
      $.get(url).then(function (res) {
          wx.stopPullDownRefresh()
          $.hideLoading()
          if (res.data.errCode == 0) {
              var recommendList = res.data.dataList
              recommendList.forEach(function (obj) {
                  obj.images = obj.images.split(':')[0]
              })
              _this.setData({
                  recommendList
              })
              loading = false
              _this.setData({
                  more: '上拉加载更多'
              })
          } else {
              _this.setData({
                  more: '没有更多数据'
              })
          }


      }).catch(function (err) {
          console.log(err)
          _this.setData({
              more: '没有更多数据'
          })
          wx.stopPullDownRefresh()
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})