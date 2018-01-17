// pages/order/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()
var loading = false
Page({
    data: {
      osshost: app.ossHost,
        nav: [{
            name: '待付款',
            status: '1'
        }, {
            name: '待成团',
            status: '5'
        }, {
            name: '配送中',
            status: '2'
        }, {
            name: '待评价',
            status: '3'
        }, {
            name: '已完成',
            status: '4'
        } , {
          name: '退款/售后',
          status: '6'
        }],
        status: '1',
        imgUrl: $.imgUrl,
        more: '上拉加载更多',
        returnOrder:{
          orderId:'',
          reason:'',
          images:''
        },
        box:false,
        files: [],
        ajax: true,
        infoBox: true
      

    },
    onLoad: function (options) {
        $.setTitle('订单列表')
        this.init()
    },
    onShow: function (options) {
      console.log('执行啊');
      console.log(this.data.ajax);
      if(this.data.ajax){
        this.init()
      }else{
      }
        
    },
    getOrderList: function () {
      console.log('执行啊');
        var _this = this
        var obj = {
            status: _this.data.status,
            page: _this.data.page
        }
        var url = api.getOrderList(obj)
        $.showLoading()
        $.get(url).then(function (res) {
          console.log(res);
            wx.stopPullDownRefresh()
            $.hideLoading()
            if (res.data.errCode == 0) {
                var orderList = res.data.dataList
                orderList.forEach(function (obj) {
                    // obj.images = obj.images.split(':')[0]
                    obj.status = _this.statusCode[obj.status]
                    obj.orderTime = new Date(obj.orderTime).Format('yyyy-MM-dd hh:mm:ss')
                    obj.expireTime = new Date(obj.expireTime).Format('yyyy-MM-dd hh:mm:ss')
                    if(obj.goods){
                        obj.goods.images = obj.goods.images.split(':')[0]
                    }
                })
                if(_this.data.page > 0){
                    orderList = [..._this.data.orderList, ...orderList]
                }
                _this.setData({
                    orderList
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
    selectStatus: function (e) {
        let status = e.target.dataset.status
        this.setData({
            status
        })
        this.init()
    },
    init: function () {
        loading = false
        this.setData({
            page: 0,
            scrollTop: 0,
            orderList: []
        })
        this.getOrderList()
    },
    statusCode: {
        '1': '待支付',
        '2': '待发货',
        '3': '待收货',
        '4': '已收货',
        '5': '待评价',
        '6': '已完成',
        '7': '取消订单审核中',
        '8': '已取消',
        '10': '已经申请退货，待审核',
        '11': '退货申请驳回',
        '12': '退货申请通过',
        '13': '退货已经发出',
        '14': '已经收到退货',
        '15': '将退货商品重新寄给客户',
        '16': '正在退款',
        '17': '退款成功',
        '18': '待拼团'
    },
    getMore: function () {
        if (!loading) {
            var page = this.data.page + 1
            var more = '加载中'
            loading = true
            this.setData({
                page,
                more
            })
            this.getOrderList()
        }

    },
    putOrderWatitingevalaute: function (e) {
        let _this = this
        let url = api.putOrderWatitingevalaute(e.target.dataset.orderid)
        $.put(url, {}).then(function (res) {
            if(res.data.code == 0){
                $.alert('确认收货成功')
                _this.init()
            }else {
                $.alert(res.data.message)
                $.alert('操作失败')
            }
            console.log(res)
        }).catch(function (err) {
            $.alert('操作失败')
        })
        
    },
    applicationForReturn: function(e){
      var _this = this;
      console.log(e)
      console.log(e.target.dataset.orderid);
      _this.setData({
        'returnOrder.orderId': e.target.dataset.orderid,
        ajax: false,
        box: true
      })
    },
    pay: function (e) {
        $.showLoading('支付中')
        console.log(e)
        let _this = this
        let singleBuy = e.target.dataset.singlebuy
        let goodsId = e.target.dataset.goodsid
        let groupId = e.target.dataset.groupid
        let orderId = e.target.dataset.orderid
        let openId = wx.getStorageSync('openId')
        let obj = {
            orderId,
            openId
        }

        let url = api.payOrder(obj)

        $.post(url, {}).then(function (res) {
            if(res.data.code == 0){
                if(res.data.additional){
                    console.log(JSON.parse(res.data.additional))
                    let payObj = JSON.parse(res.data.additional)
                    return $.wxRequestPayment(payObj)
                }else {
                    throw '支付金额为0'
                }
            }else {
                $.alert(res.data.message || '支付失败')
                throw res
            }
        }).then(function (res) {
            console.log('支付成功')
            _this.getGroupId(goodsId, groupId, singleBuy)
            $.hideLoading()
        }).catch(function (err) {
            console.log('支付金额为0 的err')
            console.log(err)

            if(err == '支付金额为0'){
                console.log('支付金额为0 获取groupId')
                _this.getGroupId(goodsId, groupId, singleBuy)
            }
            $.hideLoading()
        })
    },
    getGroupId: function (goodsId, groupId, singleBuy) {
        let _this = this
        console.log('当前是否存在groupId', groupId)
        if(groupId){
            console.log(`../share/index?goodsId=${goodsId}&groupId=${groupId}&singleBuy=${singleBuy}`)
            $.jump(`../share/index?goodsId=${goodsId}&groupId=${groupId}&singleBuy=${singleBuy}`)
        }else {
            console.log('不存在groupId', groupId)
            let url = api.getGroupId(goodsId)
            $.get(url).then(function (res) {
                console.log('获取到groupId', res.data.additional)
                console.log(`../share/index?goodsId=${goodsId}&groupId=${groupId}&singleBuy=${singleBuy}`)
                $.jump(`../share/index?goodsId=${goodsId}&groupId=${res.data.additional}&singleBuy=${singleBuy}`)
            }).then(function (res) {
                console.log(res)
            })
        }

    },
    call: function (e) {
        wx.makePhoneCall({
            phoneNumber: e.target.dataset.number
        })
    },
    goRating: function (e) {
        let index = e.target.dataset.index
        let orderInfo = JSON.stringify(this.data.orderList[index])
        wx.setStorageSync('orderInfo', orderInfo)
        let url = `../rating/index`

        $.jump(url)
    },
    requestRefund: function (e) {
        $.showLoading('请稍后')
        let _this = this
        let url = api.requestRefund(e.target.dataset.orderid)
        $.get(url).then(function (res) {
            $.hideLoading()
            if(res.data.code == 0){
                $.confirm('申请退货成功', function () {
                    _this.init()
                }, function () {
                    _this.init()
                })
            }else {
                $.alert(res.data.message || '申请退货成功')
                throw res
            }
        }).catch(function (err) {
            console.log(err)
            $.alert(res.data.message || '申请退货成功')
            $.hideLoading()
        })
    },
    showBox: function(){
      this.setData({
        box:true
      })
    },
    hideBox: function(){
      this.setData({
        box:false,
        ajax: true,
        files:[],
        'returnOrder.images':'',
        'returnOrder.reason':''
      })
    },
    hideInfoBox:function(){
      this.setData({
        infoBox:false
      })
    },
    inputReason: function(e){
      console.log(e.detail.value);
      this.setData({
        'returnOrder.reason': e.detail.value
      })
    },
    // 添加图片
    chooseImage:function(e){
      var _this = this;
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          console.log(res);
          var tempFilePaths = res.tempFiles[0].path;
          var filesize = res.tempFiles[0].size;
          // var tempFilePaths = res.tempFilePaths[0];
          // var filesize = res.tempFilePaths[0].size;
          console.log(filesize);
          var maxsize = 500 * 1024;
          console.log(filesize * 1024)
          if (filesize > maxsize) {
            $.alert('图片不能大于500KB');
          } else {
            wx.showLoading();
            $.ossUpload(tempFilePaths).then(function(res){
              wx.hideLoading()
              console.log(res);
              if (res.statusCode == 200) {
                wx.showToast({
                  title: '上传成功',
                });
                console.log(res.filename);
                var img = {
                  oldImg: tempFilePaths,
                  newImg: res.filename
                }
                _this.setData({
                  files: _this.data.files.concat(img)
                })
              }
            }).catch(function(){
              wx.hideLoading()

            })
          }
          console.log(res)
          
        }
      })
    },
    // 显示图片
    previewImage: function (e) {
      var imgs = this.data.files;
      console.log(this.data.files)
      var showImg = [];
      for (var i = 0; i < imgs.length; i++) {
        console.log(imgs[i].oldImg)
        showImg.push(imgs[i].oldImg);
      }
      console.log(showImg);
      wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: showImg // 需要预览的图片http链接列表
      })
    },
    //  删除图片
    delImage: function (e) {
      var that = this;
      console.log(e.currentTarget.id);
      console.log(e.currentTarget.dataset.name);
      var index = e.currentTarget.id;
      var delfilename = e.currentTarget.dataset.name;
      wx.showModal({
        title: '提示',
        content: "确定删除该照片",
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            var bucket = app.bucket;
            var delfile = [{
              bucket: bucket,
              object: delfilename
            }]
            var urlBase = app.urlBase;
            var url = urlBase + '/mall/oss/delete/wx_lpqd';
            $.post(url, delfile).then(function (res) {
              console.log(JSON.stringify(res));
              if (res.data.code == 0) {
                console.log('删除成功');
                wx.showToast({
                  title: '删除成功',
                })
                console.log(res);
        
                  var files = that.data.files;
                  console.log(files);
                  files.splice(index, 1);
                  that.setData({
                    files: files
                  });
                  
              } else {
                wx.showToast({
                  title: '删除失败',
                  image: '../../img/alert.png',
                  duration: 2000
                })
              }


            }).catch(function (err) {
              console.log('oss单个文件删除', err)
              if (err.errMsg == "request: fail timeout") {
                wx.showToast({
                  title: '删除请求超时',
                  image: '../../img/alert.png',
                  duration: 2000
                })
              } else {
                wx.showToast({
                  title: '删除失败',
                  image: '../../img/alert.png',
                  duration: 2000
                })
              }


            })

          } else if (res.cancel) {
            console.log('用户点击取消')

          }
        }
      });
    },
    // 退货请求
    submitReturnGoods:function(e){
      var _this = this;
      console.log(_this.data.returnOrder);
      console.log(_this.data.files);
      var returnInfo = _this.data.returnOrder;
      if (returnInfo.reason == ''){
        $.alert('请输入退货原因')
      }else if(_this.data.files.length == 0){
        $.alert('至少上传一张图片')
      }else{
        console.log(returnInfo);
        var newImg = [];
        var path = _this.data.files;
        console.log(JSON.stringify(path));

        for (var i = 0; i < path.length; i++) {
          console.log(path[i].newImg)
          newImg.push(path[i].newImg);
        }
        var imgsPath = newImg.join(":");
        console.log(imgsPath);
        _this.setData({
          'returnOrder.images':imgsPath
        })
       
       
        console.log('上传的数据' + JSON.stringify(returnInfo));
        wx.showLoading({
          title: '添加中',
        })
        console.log('上传的数据' + JSON.stringify(returnInfo));
        var url = app.urlBase + '/mall/order/request_refund';
        console.log(url);
        $.post(url, returnInfo).then(function (data) {
          wx.hideLoading();
          console.log(data);
          console.log(JSON.stringify(data));
          if (data.data.code == 0) {
            wx.showToast({
              title: '申请退货成功',
              duration: 2000
            })
            _this.hideBox();
            _this.init();
           
          } else if (data.statusCode == 200 && data.data.code != 0){
            // oss.statusHandler(data.statusCode);
            wx.showToast({
              title: data.data.message,
              image: '../../img/alert.png',
              duration: 2000
            })
          }

        }).catch(function (status) {
          wx.hideLoading();
          console.log(status.errMsg);
          wx.showToast({
            title: '请求超时',
            image: '../../img/alert.png',
            duration: 2000
          })
        });
      }
    },
    getServiceInfo: function(e){
      console.log(e.target.dataset.orderid);
      var _this = this;
      let info = e.target.dataset.orderid;
      wx.navigateTo({
        url: `../../pages/orderDetail/index?info=${info}`,
      })
      // _this.setData({
      //   infoBox: true,
      //   refundStatus: refundStatus,
      //   userId: userId
      // })
      // _this.getRefundOrderDetail(orderID);
    },
    getRefundOrderDetail: function (id) {
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
          that.setData({
            refundTime: dataList.dataList[0].time,
            refundTeason: dataList.dataList[0].reason,
            refundAmount: dataList.dataList[0].amount
          })
          var imgs = dataList.dataList[0].images.split(':');
          var imgURL = [];
          for (var i = 0; i < imgs.length; i++) {
            var a = `https://dev.yezhubao.net/oss_mall/${that.data.userId}/${imgs[i]}`;
            console.log(a)
            imgURL.push(a)
          }
          that.setData({
            images: imgURL
          })
        }
      }).catch(function (status) {
        console.log(status)
        // oss.statusHandler(status);
        console.log(status)
      })
    },
    getLogistics: function(e){
      console.log(e.target.dataset.goodsinfo)
      let info = e.target.dataset.goodsinfo;
      wx.navigateTo({
        url: `../../pages/logistics/index?info=${info}`,
      })
    },
    goGoodsDetail:function(e){
      console.log(e.currentTarget.id)
      let id = e.currentTarget.id;
      let url = `../goods_details/index?id=${id}`
      $.jump(url)
    },
    onShareAppMessage: function (e) {
      console.log(e);
      var id = e.target.dataset.goodsid;
      var img = e.target.dataset.img
      console.log(id);
      return {
        title: '优质好货不等人，大家快来拼团啊！',
        path: `/pages/goods_details/index?id=${id}`,
        imageUrl: img
      }
    },
})