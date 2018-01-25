// pages/goods_details/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()

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
        box: false,
        files: []
    },
    onLoad: function (e) {
        $.setTitle('商品详情')
        console.log('商品的id'+e.id)
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
        app.golobalData.sendcouponId = ''
    },
    getGoodsDetails: function (id) {
        let _this = this
        let url = api.getGoodsDetails(id)
        $.get(url).then(function (res) {
          console.log(JSON.stringify(res))
            if (res.data.errCode === 0) {
                let goodsDetails = res.data.data
                goodsDetails.images = goodsDetails.images.split(':')
                for(var i = 0;i<goodsDetails.images.length;i++){
                  goodsDetails.images[i] = $.imgUrl + '/' + goodsDetails.sellerId + '/' + goodsDetails.images[i]+'!thumbnail'
                  // console.log(goodsDetails.images[i]);
                  _this.setData({
                    files: _this.data.files.concat(goodsDetails.images[i]),
                    servicePhone: goodsDetails.servicePhone
                  })
                }
                // console.log(_this.data.files)
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
          console.log('参团人数：'+JSON.stringify(res));
            if (res.data.errCode === 0) {
                groupList = res.data.dataList
                _groupList = JSON.stringify(groupList);


                _this.time = setInterval(() => {

                    groupList = JSON.parse(_groupList)
                    Array.from(groupList, (obj) => {
                        obj.endTime = $.getTime(obj.endTime)
                    })
                    _this.setData({
                        groupList
                    })
                }, 100)
            }else {
                groupList = []
                _groupList = JSON.stringify(groupList);
                groupList = JSON.parse(_groupList)
                _this.setData({
                    groupList
                })
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
          console.log('商品评论'+ JSON.stringify(res))
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
        let url = `../rating-list/index?id=${this.data.goodsId}`
        $.jump(url)
    },
    getFormId: function (e) {
        let formId = e.detail.formId;
        let time = new Date().getTime()
        app.formIds.push({
            formId,
            time
        })
        console.log(`getFormId: ${formId}`)
        console.log(app.formIds)
    },
    showImages: function(e){
      var files = this.data.files;
      console.log(files);
      // console.log(e)
      wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: files // 需要预览的图片http链接列表
      })
    },
    goIndex: function(e){
      console.log(e);
      wx.switchTab({
        url: '../index/index'
      })
    },
    callSeller: function(e){
      console.log("联系客服");
      wx.makePhoneCall({
        phoneNumber: this.data.servicePhone
      })
    }
})