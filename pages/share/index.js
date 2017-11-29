// pages/share/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()

Page({
    data: {
        imgUrl: $.imgUrl
    },
    onLoad: function (options) {
        let goodsId = options.goodsId
        let groupId = options.groupId
        this.setData({
            goodsId,
            groupId
        })
        this.getGoodsDetails()
        this.getGroupsUserList()
    },
    getGoodsDetails: function () {
        let _this = this
        let url = api.getGoodsDetails(this.data.goodsId)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
                let goodsDetails = res.data.data
                goodsDetails.images = goodsDetails.images.split(':')
                goodsDetails.description = goodsDetails.description.split(':')
                goodsDetails.startTime = new Date(goodsDetails.startTime).Format("yyyy-MM-dd hh:mm:ss")
                let _goodsDetails = JSON.stringify(goodsDetails)

                setInterval(() => {
                    goodsDetails = JSON.parse(_goodsDetails)
                    goodsDetails.endTime = $.getTime(goodsDetails.endTime)
                    _this.setData({
                        goodsDetails
                    })
                }, 100)
            }

        }).catch(function (err) {
            console.log(err)
        })
    },
    getGroupsUserList: function () {
        let _this = this
        let url = api.getGroupsUser(this.data.groupId)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {

                let groupNumber = JSON.parse(JSON.stringify(res.data.dataList)).length
                let groupsUserList = res.data.dataList
                for (let i = groupsUserList.length; i < 10 ; i++ ) {
                    groupsUserList.push({
                        avatar: null
                    })
                }
                let openId = wx.getStorageSync('openId')
                let isMe = false
                groupsUserList.forEach(obj => {
                    if(obj.openId == openId){
                        console.log(obj.openId)
                        isMe = true
                    }
                })
                _this.setData({
                    groupsUserList,
                    groupNumber,
                    isMe
                })
            }

        }).catch(function (err) {
            console.log(err)
        })
    },
    onShareAppMessage: function (res) {
        return {
            title: this.data.goodsDetails.name
        }
    },
    postOrder: function (e) {
        let _this = this
        $.login().then(function () {
            let url = api.postOrder()
            let obj = {
                goodsId: _this.data.goodsDetails.id,
                singleBuy: false,
                groupId: _this.data.groupId,
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
                console.log(JSON.parse(res.data.additional))
                let payObj = JSON.parse(res.data.additional)
                return $.wxRequestPayment(payObj)
            }).then(function (res) {
                console.log(res)
            }).catch(function (err) {
                console.log(err)
            })
        })


    }
})