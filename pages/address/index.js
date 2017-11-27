// pages/address/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()

var loading = false

Page({
    data: {
    },
    onLoad: function (options) {
        $.setTitle('收货地址')
        this.getAddressList()
    },
    chooseLocation: function () {
        var _this = this
        wx.chooseLocation({
            success: function (res) {
                var zone = res.name
                var latitude = res.latitude
                var longitude = res.longitude
                let obj = {
                    latitude,
                    longitude,
                    zone
                }
                _this.setLocationData(obj)

            }
        })
    },
    setLocationData: function (obj) {
        var _this = this
        var latitude = obj.latitude
        var longitude = obj.longitude
        var zone = obj.zone
        $.qqmapsdk.reverseGeocoder({
            location: {
                latitude: obj.latitude,
                longitude: obj.longitude
            },
            success: function (res) {
                console.log(res)

                zone = zone || res.result.address_reference.landmark_l1.title

                var province = res.result.address_component.province
                var city = res.result.address_component.city
                var district = res.result.address_component.district

                _this.setData({
                    latitude,
                    longitude,
                    zone,
                    district,
                    city,
                    province
                })
            }
        });
    },
    inputAddress: function (e) {
        let address = e.detail.value
        this.setData({
            address
        })
    },
    showBox: function () {
        console.log('showBox')
        this.setData({
            box: true
        })
    },
    hideBox: function () {
        this.setData({
            box: false
        })
    },
    setAddOrEdit: function (e) {
        console.log(e.target.dataset.addoretdit)
        let addOrEdit = e.target.dataset.addoretdit
        this.setData({
            addOrEdit
        })
        this.showBox()
    },
    save: function () {
        
    },
    getAddressList: function() {
        let _this = this
        let url = api.getAddressList({})

        $.get(url).then(function (res) {
            wx.stopPullDownRefresh()
            $.hideLoading()
            if (res.data.errCode == 0) {
                let addressList = res.data.dataList
                _this.setData({
                    addressList
                })
                loading = false
                _this.setData({
                    more: '上拉加载更多'
                })
            } else {
                _this.setData({
                    more: '没有更多数据'
                })
            }


        }).catch(function (err) {

            _this.setData({
                more: '没有更多数据'
            })

        })
    },
    setDefault: function (e) {
        let _this = this
        let index = e.target.dataset.index
        let addressId = this.data.addressList[index].id
        let isDfault = this.data.addressList[index].default
        let url = api.putAddressDefault(addressId)
        if(!isDfault){
            $.put(url, {}).then(function (res) {
                wx.stopPullDownRefresh()
                $.hideLoading()
                if (res.data.code == 0) {
                    _this.getAddressList()
                } else {
                    $.alert('设为默认地址失败')
                }


            }).catch(function (err) {
                $.alert('设为默认地址失败')
            })
        }
    },
    deleteAddress: function (e) {
        let _this = this
        let index = e.target.dataset.index
        let addressId = this.data.addressList[index].id
        let url = api.deleteAddressDefault(addressId)
        
    }
})