// pages/pay/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
var app = getApp();
Page({
    data: {
        imgUrl: $.imgUrl,
        count: 1,
        price: 0.00,
        useCoupon: false,
        conponName: '选择优惠券',
        conponTitle: '优惠券',
        couponId: ''
    },
    onLoad: function (options) {
        $.setTitle('确认支付')
        console.log(options)
        console.log('单独购买'+options.singleBuy);
        let groupBuyType;
        if (options.singleBuy == 'true'){
          groupBuyType = 0;
        } else if (options.singleBuy == 'false'){
          groupBuyType = 1;
        } else{
          groupBuyType = 2;
        }
        let singleBuy = options.singleBuy == 'true' ? true : false
        let goodsId = options.goodsId
        let groupId = options.groupId
        this.setData({
            singleBuy,
            goodsId,
            groupId,
            groupBuyType
        })
        this.getGoodsDetails()
        

    },
    onShow: function (options) {
        this.getAddressList();
        console.log('优惠券存储' + app.golobalData.sendRule)
        console.log('是否使用了优惠券' + this.data.useCoupon )
        if (app.golobalData.sendRule){
          if (this.data.useCoupon){
            let price = parseFloat(this.data.price)
            let payPrice = $.math.mul(this.data.count, price)
            this.setData({
              payPrice
            })
          }
          // 不为空，使用优惠券
          var couponData = app.golobalData.sendRule.split(":");
          this.setData({
            couponId: couponData[0],
            couponType: couponData[1],
            coponAmountLimit: couponData[2],
            coponTypeValue: couponData[3],
            conponTitle: couponData[4]
          });
          this.showFinalMoney(couponData[1])

        }
    },
    showFinalMoney: function(value){
      value = parseInt(value);
      var _this = this;
      if (value == 1) {
        // 满减
        console.log("满减")
        this.setData({
          conponName: `-￥${_this.data.coponTypeValue}`,
          useCoupon: true
        })
        
        var payPrice = $.math.sub(_this.data.payPrice, parseFloat(_this.data.coponTypeValue))
        this.setData({
          payPrice
        })

      } else if (value == 2) {
        // 折扣
        console.log("折扣")
        this.setData({
          conponName: `打${_this.data.coponTypeValue*10}折`,
          useCoupon: true
        })
        let price = parseFloat(this.data.coponTypeValue)
        let payPrice = $.math.mul(_this.data.payPrice, price)
        this.setData({
          payPrice
        })

      } else if (value == 3) {
        // 满赠
        console.log("满赠")
        this.setData({
          conponName: `满${_this.data.coponAmountLimit}赠${_this.data.coponTypeValue}`,
          useCoupon: true
        })


      } else if (value == 4) {
        // 折扣
        console.log("新人")
        this.setData({
          conponName: `满${_this.data.coponAmountLimit}减${_this.data.coponTypeValue}`,
          useCoupon: true
        })

      }
    },
    delCoupon: function(){
      app.golobalData.sendRule = ''
      this.setData({
        couponId: '',
        couponType: '',
        coponAmountLimit: '',
        coponTypeValue: '',
        useCoupon: false,
        conponName: '选择优惠券',
      });
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
                couponId: this.data.couponId,
                memo: "备注",
                address: {
                    province: this.data.address.province,
                    city: this.data.address.city,
                    district: this.data.address.district,
                    zone: this.data.address.zone,
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
        this.delCoupon();
    },
    plus: function () {
        let count = this.data.count
        count++
        this.setCount(count)
        this.delCoupon();
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
    },
    selectCoupon:function(e){
      var _this = this;
      if(_this.data.useCoupon){
        // 如果有优惠券
        $.jump(`../selectCoupon/index?goodsId=${_this.data.goodsId}&count=${_this.data.count}&couponId=${_this.data.couponId}&groupBuyType=${_this.data.groupBuyType}`)
      }else{
        // 如果没有优惠券
        $.jump(`../selectCoupon/index?goodsId=${_this.data.goodsId}&count=${_this.data.count}&couponId=${_this.data.couponId}&groupBuyType=${_this.data.groupBuyType}`)
      }
    }
})