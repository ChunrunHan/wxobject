// pages/my/index.js

const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()

Page({
    data: {
      more: '没有更多数据',
      imgUrl: $.imgUrl,
      page: 0,
      size: 10,
      couponList: [],
      loading: false,
      nowtime: new Date().getTime()
      

    },
    onLoad: function (options) {
      console.log('onLoad')
      $.setTitle('我的优惠券')
      console.log(new Date().getTime())
      this.data.nowtime = new Date().getTime()
    
    },
    onShow: function(){
      console.log('onShow')
      console.log(this.data.loading)
      var _this = this;
      if (!_this.data.loading) {
        _this.data.loading = true
        _this.data.page = 0
        _this.getCouponList();
      }
     

    },
    getMore:function(e){
      console.log('加载更多啊');
      var _this = this;
      if (!_this.data.loading) {
        var page = this.data.page + 1
        var more = '加载中'
        _this.data.loading = true
        this.setData({
          page,
          more
        })

        this.getCouponList()
      }
    },
    getCouponList: function(){
      console.log('获取我的优惠券')
      var _this = this;
      $.showLoading()
      console.log(_this.data.page);
      let url = api.getCoupons({
        page: _this.data.page
      })
      console.log(url);
      $.get(url).then(function (res) {
        $.hideLoading()
        console.log(res)
        if (res.data.errCode == 0) {
          let couponList = res.data.dataList;
          for(var i = 0;i< couponList.length;i++){
            console.log(couponList[i].validityEndTime);
            couponList[i].validityEndTime = $.formatDate(couponList[i].validityEndTime);
            couponList[i].startuse = couponList[i].validityStartTime;
            couponList[i].validityStartTime = $.formatDate(couponList[i].validityStartTime); 
            couponList[i].rule.includeGoodsName = couponList[i].rule.includeGoodsName || '不限'
          }
          _this.setData({
            couponList: couponList = [..._this.data.couponList, ...couponList]
          })
          console.log(JSON.stringify(couponList));
          if (couponList.length < _this.data.size){
            _this.data.loading = true
            _this.setData({
              more: '没有更多数据'
            })

          }else{
            _this.data.loading = false
            _this.setData({
              more: '上拉加载更多'
            })

          }

          
          
        } else {
          _this.setData({
            couponList: [],
            more: '没有更多数据'
          })
        }


      }).catch(function (err) {
        console.log(err)
        _this.setData({
          more: '没有更多数据'
        })

      })

    },
    goBuyGoods: function(e){
      console.log(e.currentTarget.id)
      // data - status
      console.log(e.currentTarget.dataset.status)
      if (e.currentTarget.dataset.status == 'active'){
        var goodsid = e.currentTarget.id;
        if (goodsid) {
          console.log(goodsid);
          let url = `../goods_details/index?id=${goodsid}`
          $.jump(url)
        } else {
          wx.switchTab({
            url: '../index/index',
          })
        }
      }else{
        wx.showModal({
          title: '注意',
          content: '优惠券没有在使用时间范围不可用',
        })

      }
      
    }

})