// pages/goods_details/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');

const swiperCofing = {
    indicatorDots: false,
    indicatorColor: 'rgba(0, 0, 0, .3)',
    indicatorActiveColor: '#000000',
    autoplay: true,
    current: 0,
    interval: 2000,
    duration: 500,
    circular: true,
    vertical: false
}
let groupList = ''
let _groupList = ''
Page({
    data: {
        swiperCofing: swiperCofing,
        goodsDetails: {},
        imgUrl: $.imgUrl,
        box: false
    },
    onLoad: function (e) {
        $.setTitle('商品详情')
        console.log(e.id)
        let goodsId = e.id
        this.getGoodsDetails(goodsId)
        this.getRating(goodsId)
        this.setData({
            goodsId
        })
    },
    onShow: function () {
        clearInterval(this.time)
        this.getGroupList(this.data.goodsId)
    },
    getGoodsDetails: function (id) {
        let _this = this
        let url = api.getGoodsDetails(id)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
                let goodsDetails = res.data.data
                goodsDetails.images = goodsDetails.images.split(':')
                goodsDetails.description = goodsDetails.description.split(':')
                _this.setData({
                    goodsDetails
                })
                console.log(goodsDetails)
            }

        }).catch(function (err) {
            console.log(err)
        })
    },
    pay: function (e) {
        var _this = this
        $.login().then(function (res) {
            console.log(e.currentTarget.dataset.type)
            let singleBuy = e.currentTarget.dataset.type
            let goodsId = _this.data.goodsDetails.id
            let groupId = e.currentTarget.dataset.groupid || ''
            $.jump(`../pay/index?singleBuy=${singleBuy}&goodsId=${goodsId}&groupId=${groupId}`)
        })

    },
    getGroupList: function (id) {
        let _this = this
        let url = api.getGroups(id)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
                groupList = res.data.dataList
                _groupList = JSON.stringify(groupList);


                 this.time = setInterval(() => {

                    groupList = JSON.parse(_groupList)
                    Array.from(groupList, (obj) => {
                        obj.endTime = $.getTime(obj.endTime)
                    })
                    _this.setData({
                        groupList
                    })
                }, 100)
            }
        }).catch(function (err) {
            console.log(err)
        })
    },
    showBox: function () {
        this.setData({
            box: true
        })
    },
    hideBox: function () {
        this.setData({
            box: false
        })
    },
    onShareAppMessage: function () {
        return {
            title: this.data.goodsDetails.name,
            // imageUrl: this.data.imgUrl + '/' + this.data.goodsDetails.sellerId + '/' + this.data.goodsDetails.images[0]
        }
    },
    getRating: function (id) {
        console.log('getRating')
        let _this = this
        let obj = {
            goodsId: id,
            page: 0,
            size: 2
        }
        let url = api.getRating(obj)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
                let ratingList = res.data.dataList
                ratingList.forEach(obj => {
                    obj.createTime = new Date(obj.createTime).Format("yyyy.MM.dd")
                })
                _this.setData({
                    ratingList
                })
                console.log(ratingList)
            }

        }).catch(function (err) {
            console.log(err)
        })
    },
    goRatingList: function () {
        let url = `../rating-list/index`
        $.jump(url)
    }
})