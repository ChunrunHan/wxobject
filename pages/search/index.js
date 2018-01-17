// pages/my/index.js

const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()
var loading = false

Page({
    data: {
      haveValue:false,
      searchGoods: '',
      more: '没有更多数据',
      history: [],
      imgUrl: $.imgUrl,
      showHis: true,
      page: 0,
      recommendList:[]

    },
    onLoad: function (options) {
        $.setTitle('搜索')
    
    },
    onShow: function(){
      var history = wx.getStorageSync('history');
      console.log('搜索历史' + history);
      history = history || [];
      this.setData({
        history: history
      })
      if (history) {
        this.setData({
          showHis: true
        })
      }
      wx.getStorageSync('province')
      wx.getStorageSync('city')
      wx.getStorageSync('district')
      wx.getStorageSync('latitude')
      wx.getStorageSync('longitude')
      wx.getStorageSync('zone')
      // sellerId[String] 商家id，[可以为空]
      // categoryId[String] 分类id, [可以为空]

    },
    getSearchValue: function(e){
      var _this = this;
      console.log(e.detail.value);
      console.log(e.detail.value.length);
      var valueLength = e.detail.value.length;
      var goods = e.detail.value;
      if (valueLength){
        _this.setData({
          haveValue: true,
          searchGoods: goods
        })
      }else{
        _this.setData({
          haveValue: false,
          searchGoods: ''
        })
      }

    },
    selectItem:function(e){
      var _this = this;
      console.log(e.target.dataset.text)
      _this.setData({
        searchGoods: e.target.dataset.text,
        haveValue: true
      })

    },
    searchGoods: function(e){
      var _this = this;
      console.log(e);
      console.log(_this.data.searchGoods)
      var currentGoods = _this.data.searchGoods;
      if (_this.data.history !== ''){
        if (_this.arryHave(currentGoods,_this.data.history)){
          console.log('true有');
          _this.getGoodsList()
        }else{
          console.log('false木有');
          _this.setData({
            history: _this.data.history.concat(currentGoods),
            showHis: true
          })
          console.log(_this.data.history)
          wx.setStorageSync('history', _this.data.history)
          console.log(wx.getStorageSync('history'));
          _this.getGoodsList()
        }

      }else{
        _this.setData({
          history: _this.data.history.concat(currentGoods),
          showHis: true
        })
        console.log(_this.data.history)
        wx.setStorageSync('history', _this.data.history)
        console.log(wx.getStorageSync('history'));
        _this.getGoodsList()
      }
      


    },
    arryHave:function(item,arry){
      for(var i = 0;i<arry.length;i++){
        if (item == arry[i]){
          return true;
        }else{
          continue;
        }
      }
      return false;

    },
    clearHistory: function(e){
      this.setData({
        history:[],
        showHis: false
      })
      wx.setStorageSync('history',this.data.history)
    },
    openDetail: function (e) {
      console.log(e)
      let id = e.currentTarget.dataset.id
      let url = `../goods_details/index?id=${id}`
      $.jump(url)
    },
    getFormId: function (e) {
      let formId = e.detail.formId;
      let time = new Date().getTime()
      app.formIds.push({
        formId,
        time
      })
      console.log(`getFormId: ${formId}`)
      console.log(app.formIds)
    },
    getMore: function () {
      console.log("加载啊");
      if (!loading) {
        var page = this.data.page + 1
        var more = '加载中'
        loading = true
        this.setData({
          page,
          more
        })
        this.getGoodsList()
      }

    },
    getGoodsList: function () {
      console.log('执行啊');
      var _this = this
      var obj = {
        province: '山东省',
        city: '青岛市',
        district: wx.getStorageSync('district'),
        zone: wx.getStorageSync('zone'),
        longitude : parseFloat(wx.getStorageSync('longitude')),
        latitude : parseFloat(wx.getStorageSync('latitude')),
        sellerId :'',
        categoryId :'',
        goodsName: _this.data.searchGoods,
        page : _this.data.page,
        size :10
      }
      var url = api.postSearchGoods()
      console.log(url);
      console.log(obj)
      $.showLoading()
      $.post(url,obj).then(function (res) {
        console.log(res);
        $.hideLoading()
        if (res.data.errCode == 0) {
          var recommendList = res.data.dataList
          recommendList.forEach(function (obj) {
            obj.images = obj.images.split(':')[0]
          })
          if (_this.data.page > 0) {
            recommendList = [..._this.data.recommendList, ...recommendList]
          }
          console.log(JSON.stringify(recommendList));
          _this.setData({
            recommendList,
            showHis: false
          })
          loading = false
          _this.setData({
            more: '上拉加载更多'
          })
        } else {
          _this.setData({
            more: '没有更多数据',
            showHis: false
          })
        }

      }).catch(function (err) {
        $.hideLoading()
        console.log(err)
        _this.setData({
          more: '没有更多数据',
          showHis: false
        })
      })
    }
})