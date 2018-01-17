// pages/my/index.js

const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()


Page({
    data: {
      haveValue:false,
      searchGoods: '',
      more: '没有更多数据',
      history: [],
      showHis: false
    },
    onLoad: function (options) {
        $.setTitle('搜索')
    
    },
    onshow: function(){
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
        }else{
          console.log('false木有');
          _this.setData({
            history: _this.data.history.concat(currentGoods),
            showHis: true
          })
          console.log(_this.data.history)
          // var list = _this.data.history.join(":");
          // console.log(list);
          wx.setStorageSync('history', _this.data.history)
          console.log(wx.getStorageSync('history'));
        }

      }else{
        _this.setData({
          history: _this.data.history.concat(currentGoods),
          showHis: true
        })
        console.log(_this.data.history)
        // var list = _this.data.history.join(":");
        // console.log(list);
        wx.setStorageSync('history', _this.data.history)
        console.log(wx.getStorageSync('history'));
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
    }
})