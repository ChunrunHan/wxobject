// pages/share/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()

let expireTime = ''
let _expireTime = ''
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
        this.groupExpireTime()
    },
    getGoodsDetails: function () {
        let _this = this
        let url = api.getGoodsDetails(this.data.goodsId)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
                let goodsDetails = res.data.data
                $.setTitle(goodsDetails.name)
                goodsDetails.images = goodsDetails.images.split(':')
                goodsDetails.description = goodsDetails.description.split(':')
                _this.setData({
                    goodsDetails
                })
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
                for (let i = groupsUserList.length; i < 10; i++) {
                    groupsUserList.push({
                        avatar: null
                    })
                }
                let openId = wx.getStorageSync('openId')
                let isMe = false
                groupsUserList.forEach(obj => {
                    if (obj.openId == openId) {
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
            title: this.data.goodsDetails.name,
            path: `/pages/share/index?goodsId=${this.data.goodsId}&groupId=${this.data.groupId}`
        }
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
    groupExpireTime: function () {
        var _this = this;
        var url = api.groupExpireTime(this.data.groupId)
        $.get(url).then(function (res) {
            if (res.data.code === 0) {
                // expireTime = new Date(res.data.additional).Format("yyyy-MM-dd hh:mm:ss")
                expireTime = $.getTime(res.data.additional)
                _this.setData({
                    expireTime
                })
                setInterval(() => {
                    expireTime = $.getTime(res.data.additional)
                    _this.setData({
                        expireTime
                    })
                }, 1000)
            }


        }).catch(function (err) {
            console.log(err)
        })

    }
})