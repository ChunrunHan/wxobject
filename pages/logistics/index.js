// pages/order/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()
var loading = false
Page({
    data: {
      imgUrl: $.imgUrl,
      sellerid:'',
      goodsImages: '',
      expressStatus: '无订单状态', //orderStatus[nu_state]
      company:'快递公司',
      num:'快递号',
      orderid:'商品单号',
      yes: true,
      expressList:[],
      lenght: '',
      more: '没有更多数据'


      

    },
    onLoad: function (options) {
        $.setTitle('物流详情')
        var _this = this;
        console.log(options.info) 
        // "20180111100504577286:yunda:3831750321651"
        var goodsInfo = options.info.split(":");
        var orderId = goodsInfo[0];
        var company = goodsInfo[1];
        var num = goodsInfo[2];
        var sellerid = goodsInfo[3];
        var img = goodsInfo[4];
        this.setData({
          sellerid: sellerid,
          goodsImages: img,
          company: _this.companyCode[company],
          num: num,
          orderid: orderId
        })
        this.getGoodsInfo(orderId,company,num);
        // this.getGoodsInfo();

    },
    onShow: function (options) {
      console.log('执行啊');
        
    },
    getGoodsInfo: function (orderId, company, num){
      console.log('获取快递信息');
      var _this = this
      var obj = {
        orderid: orderId,
        num: num,
        company: company

      }
      var url = api.getExpressList(obj)
      // var url = 'https://dev.yezhubao.net/express/query/43251155/yunda/3831750321651'
      $.showLoading()
      $.get(url).then(function (res) {
        wx.hideLoading();
        console.log(JSON.stringify(res));
        if (res.data.errCode == 0){
          var dataList = res.data.dataList;
          for(var i=0; i < dataList.length;i++){
            var cTime = dataList[i].time.split(" ");
            dataList[i].date = cTime[0].split("-")[1] + '-' + cTime[0].split("-")[2]; 
            dataList[i].time = cTime[1];
            dataList[i].nuState = _this.orderStatus[dataList[i].nu_state]
          }
          console.log(dataList)
          _this.setData({
            expressList: dataList,
            expressStatus: _this.orderStatus[res.data.nu_state],
            lenght: dataList.length-1
          })
          console.log(_this.data)
        }else{
          wx.hideLoading();
          // $.alert(res.data.errMsg);
          _this.setData({
            yes: false
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
    companyCode: {
        'yunda': '韵达',
        'shunfeng': '顺丰',
        'shentong': '申通',
        'yuantong': '圆通',
        'zhongtong': '中通',
        'huitongkuaidi': '汇通',
        'tiantian': '天天',
        'debangwuliu': '德邦',
        'guotongkuaidi': '国通',
        'ems': 'EMS'
    },
    orderStatus: {
      '0': '在途中',
      '1': '已揽收',
      '2': '疑难',
      '3': '已签收',
      '4': '退签',
      '5': '同城派送中',
      '6': '退回等状态'
    }
})