// pages/pay/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: $.imgUrl
    },
    onLoad: function (options) {
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
    getGoodsDetails: function () {
        let _this = this
        let url = api.getGoodsDetails(this.data.goodsId)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
                let goodsDetails = res.data.data
                goodsDetails.images = goodsDetails.images.split(':')
                goodsDetails.description = goodsDetails.description.split(':')
                let price = 0.00
                if(_this.data.singleBuy){
                    console.log('singleBuy')
                    price = goodsDetails.singlePrice
                }else {
                    if(_this.data.groupId){
                        console.log('memberPrice')
                        price = goodsDetails.memberPrice
                    }else {
                        console.log('leaderPrice')
                        price = goodsDetails.leaderPrice
                    }
                }

                _this.setData({
                    goodsDetails,
                    price
                })
                console.log(goodsDetails)
            }

        }).catch(function (err) {
            console.log(err)
        })
    },
    postOrder: function () {
        $.showLoading('支付中')
        let _this = this
        let url = api.postOrder()
        let obj = {
            goodsId: this.data.goodsId,
            singleBuy: this.data.singleBuy,
            groupId: this.data.groupId,
            count: 1,
            memo: "备注",
            address: {
                province: "山东省",
                city: "青岛市",
                district: "district",
                zone: "东城国际",
                address: "A区31号楼4单元1101",
                mobile: "13045049759",
                receiver: "隔壁王叔叔",
                lng: 123.1111,
                lat: 111.1233
            }
        }
        console.log(obj)
        $.post(url, obj).then(function (res) {
            if(res.data.code == 0){
                if(res.data.additional){
                    console.log(JSON.parse(res.data.additional))
                    let payObj = JSON.parse(res.data.additional)
                    return $.wxRequestPayment(payObj)
                }else {
                    $.alert(res.data.message || '支付失败')
                    throw res
                }
            }else {
                $.alert(res.data.message || '支付失败')
                throw res
            }
        }).then(function (res) {
            console.log('支付成功')
            _this.getGroupId(_this.data.goodsId)
            $.hideLoading()
        }).catch(function (err) {
            console.log('支付失败')
            console.log(err)
            $.hideLoading()
        })
    },
    getGroupId: function () {
        let _this = this
        let url = api.getGroupId(this.data.goodsId)
        $.get(url).then(function (res) {
            $.jump(`../share/index?goodsId=${_this.data.goodsId}&groupId=${res.data.additional}`, true)
        }).then(function (res) {
            console.log(res)
        })
    }
})