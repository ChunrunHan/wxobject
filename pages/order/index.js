// pages/order/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()
var loading = false
Page({
    data: {
        nav: [{
            name: '待付款',
            status: '1'
        }, {
            name: '待成团',
            status: '5'
        }, {
            name: '待收货',
            status: '2'
        }, {
            name: '待评价',
            status: '3'
        }, {
            name: '已完成',
            status: '4'
        }],
        status: '1',
        imgUrl: $.imgUrl,
        more: '上拉加载更多'
    },
    onLoad: function (options) {
        $.setTitle('订单列表')
        this.init()
    },
    getOrderList: function () {
        var _this = this
        var obj = {
            status: _this.data.status,
            page: _this.data.page
        }
        var url = api.getOrderList(obj)
        $.showLoading()
        $.get(url).then(function (res) {
            wx.stopPullDownRefresh()
            $.hideLoading()
            if (res.data.errCode == 0) {
                var orderList = res.data.dataList
                orderList.forEach(function (obj) {
                    // obj.images = obj.images.split(':')[0]
                    obj.status = _this.statusCode[obj.status]
                    obj.orderTime = new Date(obj.orderTime).Format('yyyy-MM-dd hh:mm:ss')
                    obj.goods.images = obj.goods.images.split(':')[0]
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
    pay: function (e) {
        $.showLoading('支付中')
        let _this = this
        let url = api.payOrder(e.target.dataset.orderid)
        $.post(url, {}).then(function (res) {
            if(res.data.code == 0){
                if(res.data.additional){
                    console.log(JSON.parse(res.data.additional))
                    let payObj = JSON.parse(res.data.additional)
                    return $.wxRequestPayment(payObj)
                }else {
                    _this.init()
                    throw '支付金额为0'
                }
            }else {
                $.alert(res.data.message || '支付失败')
                throw res
            }
        }).then(function (res) {
            console.log('支付成功')
            _this.init()
            $.hideLoading()
        }).catch(function (err) {
            console.log(err)
            $.hideLoading()
        })
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
    }
})