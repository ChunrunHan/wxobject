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
    getGoodsDetails: function (id) {
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
    }
})