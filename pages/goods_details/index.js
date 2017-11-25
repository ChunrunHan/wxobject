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
Page({
    data: {
        swiperCofing: swiperCofing,
        goodsDetails: {},
        imgUrl: $.imgUrl
    },
    onLoad: function (e) {
        console.log(e.id)
        this.getGoodsDetails(e.id)
    },
    getGoodsDetails: function (id) {
        let _this = this
        let url = api.getGoodsDetails(id)
        $.get(url).then(function (res) {
            if(res.data.errCode === 0){
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
    postOrder: function (e) {
        let _this = this
        let url = api.postOrder()
        let obj = {
            goodsId: this.data.goodsDetails.id,
            singleBuy: true,
            groupId: '',
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
            console.log(res)
        }).catch(function (err) {
            console.log(err)
        })
    }
})