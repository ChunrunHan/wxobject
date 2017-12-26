// pages/order/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()
Page({
    data: {
        files: []

    },
    onLoad: function (options) {
        $.setTitle('退款详情');
        console.log(options);
        console.log(options.info);
        var orderID = options.info.split(":")[0];
        var refundStatus = options.info.split(":")[1];
        var userId = options.info.split(":")[2];
        var _this = this;
        _this.setData({
          userId: userId,
          refundStatus: refundStatus,
          id: orderID
        })
        _this.getRefundOrderDetail(orderID);
        
    },
    onShow: function (options) {
     
        
    },
    getRefundOrderDetail: function (id) {
      wx.showLoading();
      var that = this;
      wx.showLoading();
      console.log(id);
      var url = `${app.urlBase}/mall/order/refund_list/${id}`;
      console.log(url);
      $.get(url).then(function (data) {
        wx.hideLoading();
        console.log(JSON.stringify(data));
        var statusCode = data.statusCode;
        var dataList = data.data;
        if (dataList.errCode == 0) {
          console.log(dataList.dataList);
          console.log(dataList.dataList.length);
          var maxTime = 0;
          for (var j = 0; j < dataList.dataList.length; j++){    
            var imgURL = [];
            if (dataList.dataList[j].images){
              var imgs = dataList.dataList[j].images.split(":");
              for (var i = 0; i < imgs.length; i++) {
                var a = `${app.ossHost}/${that.data.userId}/${imgs[i]}`;
                console.log(a)
                imgURL.push(a)
              }
              dataList.dataList[j].imgURL = imgURL;
              that.setData({
                files: that.data.files.concat(imgURL)
              })
            }else{
              // new Date('2017-12-20 13:50:44').getTime()
              console.log(dataList.dataList[j].time);
              var currentTime = dataList.dataList[j].time;
              currentTime = currentTime.replace(/-/g, '/');  
              currentTime = new Date(currentTime).getTime()
              currentTime = currentTime + (7*24*60*60*1000);
              if (currentTime > maxTime) {
                maxTime = currentTime;
              }
              console.log(typeof maxTime)
             
              that.setData({
                endTime: new Date(maxTime).Format('yyyy-MM-dd hh:mm:ss')
              })
              continue;
            }
          }
          that.setData({
            dataList: dataList.dataList
          })
          console.log(that.data.endTime);
        }
      }).catch(function (status) {
        wx.hideLoading()
        console.log(status)
        // oss.statusHandler(status);
        console.log(status)
      })
    },
    previewImage: function (e) {
      var imgs = this.data.files;
      console.log(this.data.files)
      // var showImg = [];
      // for (var i = 0; i < imgs.length; i++) {
      //   console.log(imgs[i].oldImg)
      //   showImg.push(imgs[i].oldImg);
      // }
      // console.log(showImg);
      wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: imgs // 需要预览的图片http链接列表
      })
    }
})