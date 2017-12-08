// pages/pay/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
Page({
    data: {
        imgUrl: $.imgUrl,
        count: 1,
        price: 0.00
    },
    onLoad: function (options) {
        $.setTitle('确认支付')
        console.log(options)
        let singleBuy = options.singleBuy == 'true' ? true : false
        let goodsId = options.goodsId
        let groupId = options.groupId
        this.setData({
            singleBuy,
            goodsId,
            groupId
        })
        this.getGoodsDetails()

    },
    onShow: function (options) {
        this.getAddressList()
    },
    getGoodsDetails: function () {
        let _this = this
        let url = api.getGoodsDetails(this.data.goodsId)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
                let goodsDetails = res.data.data
                goodsDetails.images = goodsDetails.images.split(':')
                goodsDetails.description = goodsDetails.description.split(':')
                let price = 0.00
                if (_this.data.singleBuy) {
                    console.log('singleBuy')
                    price = goodsDetails.singlePrice
                } else {
                    if (_this.data.groupId) {
                        console.log('memberPrice')
                        price = goodsDetails.memberPrice
                    } else {
                        console.log('leaderPrice')
                        price = goodsDetails.leaderPrice
                    }
                }

                price = parseFloat(price)
                _this.setData({
                    goodsDetails,
                    price
                })
                _this.setCount(1)
                console.log(goodsDetails)
            }

        }).catch(function (err) {
            console.log(err)
        })
    },
    postOrder: function () {

        let _this = this
        let url = api.postOrder()
        let obj = {}
        try {
            obj = {
                goodsId: this.data.goodsId,
                singleBuy: this.data.singleBuy,
                groupId: this.data.groupId,
                count: this.data.count,
                memo: "备注",
                address: {
                    province: this.data.address.province,
                    city: this.data.address.city,
                    district: this.data.address.district,
                    zone: '',
                    address: this.data.address.address,
                    mobile: this.data.address.mobile,
                    receiver: this.data.address.receiver,
                    lng: this.data.address.longitude,
                    lat: this.data.address.latitude
                }
            }
        } catch (err) {
            $.alert('请选择地址或更新地址信息')
            return false
        }


        $.showLoading('支付中')
        console.log(obj)
        $.post(url, obj).then(function (res) {
            if (res.data.code == 0) {
                if (res.data.additional) {
                    console.log(JSON.parse(res.data.additional))
                    let payObj = JSON.parse(res.data.additional)
                    return $.wxRequestPayment(payObj)
                } else {
                    _this.getGroupId()
                    throw '支付金额为0'
                }
            } else {
                $.alert(res.data.message || '支付失败')
                throw res
            }
        }).then(function (res) {
            console.log('支付成功')
            _this.getGroupId()
            _this.groupExpireTime()
            $.hideLoading()
        }).catch(function (err) {
            console.log('支付金额为0 的err')
            console.log(err)
            $.hideLoading()
        })
    },
    groupExpireTime: function () {
        let _this = this
        let url = api.groupExpireTime(this.data.goodsId)
        $.get(url).then(function (res) {
            console.log('过期时间')
            console.log(res)
        }).then(function (res) {
            console.log(res)
        })
    },
    getGroupId: function () {
        let _this = this
        let groupId = this.data.groupId
        console.log('当前是否存在groupId', groupId)
        if(groupId){
            console.log('存在groupId', groupId)
            $.jump(`../share/index?goodsId=${_this.data.goodsId}&groupId=${groupId}&singleBuy=${_this.data.singleBuy}`, true)
        }else {
            console.log('不存在groupId', this.data.groupId)

            let url = api.getGroupId(this.data.goodsId)
            $.get(url).then(function (res) {
                console.log('获取到groupId', res.data.additional)

                $.jump(`../share/index?goodsId=${_this.data.goodsId}&groupId=${res.data.additional}&singleBuy=${_this.data.singleBuy}`, true)
            }).then(function (res) {
                console.log(res)
            })
        }

    },
    getAddressList: function () {
        $.showLoading()

        let _this = this
        let url = api.getAddressList({})
        $.get(url).then(function (res) {
            wx.stopPullDownRefresh()
            $.hideLoading()
            if (res.data.errCode == 0) {
                let addressList = res.data.dataList
                addressList.forEach(obj => {
                    if (obj.default == true) {
                        _this.setData({
                            address: obj
                        })
                    }
                })

            }


        }).catch(function (err) {

        })
    },
    reduce: function () {
        let count = this.data.count
        count--
        this.setCount(count)
    },
    plus: function () {
        let count = this.data.count
        count++
        this.setCount(count)
    },
    count: function (e) {
        let count = parseInt(e.detail.value)
        this.setCount(count)
    },
    setCount: function (count) {
        console.log(count)
        if (!count || count < 1) {
            count = 1
            this.setData({
                count
            })
        } else if (count > this.data.goodsDetails.timeoutLimit) {
            count = this.data.goodsDetails.timeoutLimit
            this.setData({
                count
            })
        } else {
            this.setData({
                count
            })
        }
        let price = parseFloat(this.data.price)
        let payPrice = $.math.mul(count, price)
        this.setData({
            payPrice
        })
    }
})