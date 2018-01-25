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
      nowtime: new Date().getTime(),
      couponId:''
      

    },
    onLoad: function (options) {
      console.log(options)
      // { goodsId: "ff80b5b55fed3bfc015fed5306e80005", count: "1", couponId: "" }
      $.setTitle('我的优惠券')
      console.log(new Date().getTime())
      this.data.nowtime = new Date().getTime()
      this.data.goodsId = options.goodsId;
      this.data.count = options.count;
      console.log("传过来的优惠券id"+ options.couponId);
      this.data.couponId = options.couponId;
      this.data.groupBuyType = options.groupBuyType;
    
    },
    onShow: function(){
      console.log('onShow')
      console.log(this.data.loading)
      var _this = this;
      if (!_this.data.loading) {
        _this.data.loading = true
        _this.getUseCouponList();
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

        this.getUseCouponList()
      }
    },
    getUseCouponList: function(){
      console.log('获取可用优惠券')
      var _this = this;
      $.showLoading()
      console.log(_this.data.page);
      let url = api.getUseCoupons({
        goodsId: _this.data.goodsId,
        count: _this.data.count,
        groupBuyType: _this.data.groupBuyType,
        page: _this.data.page
      })
      console.log(url);
      $.get(url).then(function (res) {
        $.hideLoading()
        console.log(JSON.stringify(res));
        if (res.data.errCode == 0) {
          let couponList = res.data.dataList;
          for(var i = 0;i< couponList.length;i++){
            console.log(couponList[i].validityEndTime);
            couponList[i].validityEndTime = $.formatDate(couponList[i].validityEndTime);
            couponList[i].startuse = couponList[i].validityStartTime;
            couponList[i].validityStartTime = $.formatDate(couponList[i].validityStartTime); 
            couponList[i].rule.includeGoodsName = couponList[i].rule.includeGoodsName || '不限'
            if (couponList[i].type == 1){
              couponList[i].sendRule = `${couponList[i].rule.amountLimit}:${couponList[i].rule.decrease}`
            } else if (couponList[i].type == 2){
              couponList[i].sendRule = `${couponList[i].rule.amountLimit}:${couponList[i].rule.discount}`
              couponList[i].rule.discount = couponList[i].rule.discount * 10
            } else if (couponList[i].type == 3){
              couponList[i].sendRule = `${couponList[i].rule.amountLimit}:${couponList[i].rule.giftGoodsName}`
            } else if (couponList[i].type == 4){
              couponList[i].sendRule = `${couponList[i].rule.amountLimit}:${couponList[i].rule.decrease}`
            }
          }
          _this.setData({
            couponList: couponList = [..._this.data.couponList, ...couponList]
          })
          // console.log(JSON.stringify(couponList));
          if (couponList.length < this.data.size){
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

        _this.setData({
          more: '没有更多数据'
        })

      })

    },
    goBuyGoods: function(e){
      console.log(e.currentTarget.id)
      // data - status
      console.log(e.currentTarget.dataset.status)
      var _this = this;
      if (e.currentTarget.dataset.status == 'active'){
        // 可用优惠券
        var couponId = e.currentTarget.id;
        var sendRule = e.currentTarget.dataset.rule
        console.log(_this.data.couponId);
        if (couponId == _this.data.couponId) {
          // 当前已经选择该优惠券
          wx.showModal({
            title: '注意',
            content: '你已经选中当前优惠券',
          })
        } else {
          //  选择新的优惠券
          app.golobalData.sendcouponId = couponId;
          wx.navigateBack({
            
          })
         
        }
      }else{
        var reason = e.currentTarget.dataset.reason;
        wx.showModal({
          title: '注意',
          content: reason,
        })

      }
      
    }

})