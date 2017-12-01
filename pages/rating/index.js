// pages/rating/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');


Page({
    data: {
        goodsStart: [true, true, true, true, true],
        sellerStart: [true, true, true, true, true],
        sellerScore: 5,
        goodsScore: 5
    },
    onLoad: function (options) {
        $.setTitle('评价')
        var orderInfo = JSON.parse(wx.getStorageSync('orderInfo'))
        this.setData({
            orderInfo
        })
        console.log(orderInfo)

    },
    setStart: function (e) {
        let index = e.target.dataset.index + 1
        let type = e.target.dataset.type
        let start = [false, false, false, false, false]
        start.fill(true, 0, index)
        if(type == 1){
            let goodsStart = start
            this.setData({
                goodsStart,
                goodsScore: index
            })
        }else {
            let sellerStart = start
            this.setData({
                sellerStart,
                sellerScore: index
            })
        }
    },
    addRating: function () {
        let url = api.postRating()
        let obj = {
            orderId: this.data.orderInfo.id,
            sellerId: this.data.orderInfo.seller.id,
            sellerScore: this.data.sellerScore,
            sellerComment: this.data.sellerComment || '',
            goodsRatingList:[
                {
                    id: this.data.orderInfo.goods.id,
                    score: this.data.goodsScore,
                    comment: this.data.goodsComment || ''
                }
            ]
        };

        $.post(url, obj).then(function (res) {
            if(res.data.code == 0){
                $.confirm('评价完成', function () {
                    wx.navigateBack({
                        delta: 1
                    })
                }, function () {
                    wx.navigateBack({
                        delta: 1
                    })
                })
            }else {
                $.alert(res.data.message || '评价失败')
            }
            console.log(res)
        }).catch(function (err) {
            $.alert('评价失败')
            console.log(err)
        });
        console.log(obj)
    },
    sellerComment: function (e) {
        let sellerComment = e.detail.value
        this.setData({
            sellerComment
        })
    },
    goodsComment: function (e) {
        let goodsComment = e.detail.value
        this.setData({
            goodsComment
        })
    }
})