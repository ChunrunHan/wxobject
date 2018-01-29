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
        let singleBuy = options.singleBuy == 'true' ? true : false

        console.log('支付成功页面的参数')
        console.log(`goodsId: ${goodsId}`)
        console.log(`groupId: ${groupId}`)
        console.log(`singleBuy: ${singleBuy}`)
        console.log('- - - - - - - - - -')

        this.setData({
            goodsId,
            groupId,
            singleBuy
        })

        this.getGoodsDetails()

        if(!singleBuy){
            this.getGroupsUserList()
            this.groupExpireTime()
        }

    },
    getGoodsDetails: function () {
        let _this = this
        let url = api.getGoodsDetails(this.data.goodsId)
        $.get(url).then(function (res) {
          if (res.statusCode == 200){
            if (res.data.errCode === 0) {
              let goodsDetails = res.data.data
              $.setTitle(goodsDetails.name)
              goodsDetails.images = goodsDetails.images.split(':')[0]
              goodsDetails.description = goodsDetails.description.split(':')
              goodsDetails.startTime = new Date(parseInt(goodsDetails.startTime)).Format('yyyy-MM-dd hh:mm:ss')
              _this.setData({
                goodsDetails
              })
            }
          } else {
            $.statusHandler(res.statusCode)
          }
            

        }).catch(function (err) {
            console.log(err)
        })
    },
    getGroupsUserList: function () {
        let _this = this
        let url = api.getGroupsUser(this.data.groupId)
        $.get(url).then(function (res) {
          if (res.statusCode == 200) {
            if (res.data.errCode === 0) {
              console.log('getGroupsUserList的参数')
              let groupNumber = JSON.parse(JSON.stringify(res.data.dataList)).length
              let groupsUserList = res.data.dataList

              for (let i = groupsUserList.length; i < 10; i++) {
                groupsUserList.push({
                  avatar: null
                })
              }
              let openId = wx.getStorageSync('openId')
              console.log(`openId: ${openId}`)

              let isMe = false
              groupsUserList.forEach(obj => {
                if (obj.openId == openId) {
                  console.log(obj.openId)
                  isMe = true
                }
              })


              console.log(`groupsUserList: `)
              console.log(res.data.dataList)
              console.log(`groupNumber:`)
              console.log(groupNumber)
              console.log(`isMe: ${isMe}`)
              console.log('- - - - - - - - - -')

              _this.setData({
                groupsUserList,
                groupNumber,
                isMe
              })
            }
          } else {
            $.statusHandler(res.statusCode)
          }
            

        }).catch(function (err) {
            console.log(err)
        })
    },
    onShareAppMessage: function (res) {
        let singleBuy = this.data.singleBuy
        console.log(`singleBuy: ${singleBuy}`)
        let path = ''
        let title = this.data.goodsDetails.name
        let obj = {}
        if(singleBuy || !(this.data.goodsDetails.buyerLimit - (this.data.groupNumber || 0))){
            path = `/pages/goods_details/index?id=${this.data.goodsId}`
            let imageUrl = `${this.data.imgUrl}/${this.data.goodsDetails.sellerId}/${this.data.goodsDetails.images}`
            obj = {
                title,
                path,
                imageUrl
            }
            console.log(imageUrl)
        }else {
            path = `/pages/share/index?goodsId=${this.data.goodsId}&groupId=${this.data.groupId}`
            obj = {
                title,
                path
            }
        }
        console.log(`path: ${path}`)
        return obj
    },
    pay: function (e) {
        var _this = this
        $.login().then(function (res) {
            console.log(e.currentTarget.dataset.type)
            let singleBuy = e.currentTarget.dataset.type
            let goodsId = _this.data.goodsDetails.id
            let groupId = e.currentTarget.dataset.groupid
            let url = `../pay/index?singleBuy=${singleBuy}&goodsId=${goodsId}&groupId=${groupId}`

            console.log('pay的参数')
            console.log(`singleBuy: ${singleBuy}`)
            console.log(`goodsId: ${goodsId}`)
            console.log(`groupId: ${groupId}`)
            console.log(`url: ${url}`)
            console.log('- - - - - - - - - -')

            $.jump(url)
        })

    },
    groupExpireTime: function () {
        var _this = this;
        var url = api.groupExpireTime(this.data.groupId)
        $.get(url).then(function (res) {
          if (res.statusCode == 200){
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
          } else {
            $.statusHandler(res.statusCode)
          }
            

        }).catch(function (err) {
            console.log(err)
        })

    },
    goGoodsDetail: function(){
      console.log('立即抢购');
      let url = `../goods_details/index?id=${this.data.goodsId}`
      $.jump(url)
    },
    goTab: function(e){
      console.log(e.currentTarget.id);
      var pageText = e.currentTarget.id;
      switch (pageText) {
        case 'index':
          wx.switchTab({
            url: `../${pageText}/index`
          })
          break;
        case 'search':
          wx.switchTab({
            url: `../${pageText}/index`
          })
          break;
        case 'order':
          wx.switchTab({
            url: `../${pageText}/index`
          })
          break;
        case 'my':
          wx.switchTab({
            url: `../${pageText}/index`
          })
          break;
      }
    }
})