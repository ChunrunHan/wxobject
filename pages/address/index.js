// pages/address/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()

var loading = false

Page({
    data: {},
    onLoad: function (options) {
        console.log(options.setAddress)
        $.setTitle('收货地址')
        this.setData({
            text: options.setAddress ? '使用此地址' : '设为默认'
        })
        this.getAddressList()
    },
    setAddress: function (e) {
        if (this.data.text == '使用此地址') {
            this.setDefault(e)
        }
    },
    chooseLocation: function () {
        var _this = this
        wx.chooseLocation({
            success: function (ress) {
                var zone = ress.name
                $.qqmapwx.geocoder({
                    address: ress.address,
                    success: function (res) {
                        console.log(res)
                        console.log(' - - - - -  --  -- ')
                        let latitude = res.result.location.lat
                        let longitude = res.result.location.lng

                        var province = res.result.address_components.province
                        var city = res.result.address_components.city
                        var district = res.result.address_components.district

                        _this.setData({
                            latitude,
                            longitude,
                            zone,
                            district,
                            city,
                            province
                        })
                    },
                    fail: function (err) {
                        console.log(err)
                    }
                })
            }
        })
    },
    inputAddress: function (e) {
        let address = e.detail.value
        this.setData({
            address
        })
    },
    inputMobile: function (e) {
        let mobile = e.detail.value
        this.setData({
            mobile
        })
    },
    inputReceiver: function (e) {
        let receiver = e.detail.value
        this.setData({
            receiver
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
            receiver: '',
            mobile: '',
            latitude: '',
            longitude: '',
            zone: '',
            district: '',
            city: '',
            address: '',
            province: '',
            addOrEdit: '',
            box: false
        })
    },
    addOrEdit: function (e) {
        let index = e.currentTarget.dataset.index || e.target.dataset.index || 0
        let addOrEdit = e.currentTarget.dataset.addoredit

        if (addOrEdit) {
            let addOrEdit = this.data.addressList[index].id

            console.log(index)
            let latitude = this.data.addressList[index].latitude
            let longitude = this.data.addressList[index].longitude
            let district = this.data.addressList[index].district
            let address = this.data.addressList[index].address
            let zone = this.data.addressList[index].zone || ''
            let city = this.data.addressList[index].city
            let province = this.data.addressList[index].province
            let receiver = this.data.addressList[index].receiver
            let mobile = this.data.addressList[index].mobile


            this.setData({
                receiver,
                mobile,
                latitude,
                longitude,
                zone,
                district,
                city,
                address,
                province,
                addOrEdit
            })
        } else {
            this.setData({
                addOrEdit
            })
        }


        this.showBox()
    },
    save: function () {
        this.addOrEditAddress()
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
                _this.setData({
                    addressList
                })
                loading = false
                _this.setData({
                    more: '上拉加载更多'
                })
            } else {
                _this.setData({
                    addressList: [],
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
        let index = e.currentTarget.dataset.index
        let addressId = this.data.addressList[index].id
        let isDfault = this.data.addressList[index].default
        if (this.data.addressList[index].latitude == 0 && this.data.addressList[index].longitude == 0) {
            $.alert('地区信息已过期，重新选择地区')
            return false
        }
        let url = api.putAddressDefault(addressId)
        if (!isDfault) {
            $.showLoading()
            $.put(url, {}).then(function (res) {
                $.hideLoading()
                if (res.data.code == 0) {
                    _this.getAddressList()
                    if (_this.data.text == '使用此地址') {
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                } else {
                    $.alert('设为默认地址失败')
                }


            }).catch(function (err) {
                $.showLoading()

                $.alert('设为默认地址失败')
            })
        }
    },
    deleteAddress: function (e) {
        let _this = this
        let index = e.currentTarget.dataset.index
        console.log(e)

        let addressId = _this.data.addressList[index].id
        let url = api.deleteAddress(addressId)
        $.confirm('确认删除地址？', function () {
            $.showLoading()
            $.del(url).then(function (res) {
                $.hideLoading()
                if (res.data.code == 0) {
                    $.alert('删除地址成功')
                    _this.getAddressList()
                } else {
                    $.alert('删除地址失败')
                }


            }).catch(function (err) {
                $.showLoading()

                $.alert('删除地址失败')
            })
        })
    },
    addOrEditAddress: function () {
        var _this = this
        var url = api.addOrEditAddress()
        var obj = {
            province: this.data.province,
            city: this.data.city,
            district: this.data.district,
            address: this.data.address,
            zone: this.data.zone,
            mobile: this.data.mobile,
            receiver: this.data.receiver,
            latitude: this.data.latitude,
            longitude: this.data.longitude,
        }

        if (!obj.receiver) {
            $.alert('请输入您的名字')
            return false
        }

        if (!$.isMobile(obj.mobile)) {
            $.alert('请输入正确的手机号')
            return false
        }

        if (!this.data.zone) {
            $.alert('请选择地区')
            return false
        }

        if (!this.data.address) {
            $.alert('请输入详细地址')
            return false
        }

        if (obj.latitude == 0 && obj.longitude == 0) {
            $.alert('地区信息已过期，重新选择地区')
            return false
        }

        if (!this.data.addOrEdit) {
            $.post(url, obj).then(function (res) {
                $.hideLoading()
                if (res.data.code == 0) {
                    _this.getAddressList()
                    _this.hideBox()
                    $.alert('添加成功')
                } else {
                    $.alert('添加失败')
                }


            }).catch(function (err) {
                $.showLoading()

                $.alert('添加失败')
            })
        } else {
            console.log(obj)
            obj.id = this.data.addOrEdit
            $.put(url, obj).then(function (res) {
                $.hideLoading()
                if (res.data.code == 0) {
                    _this.getAddressList()
                    _this.hideBox()
                    $.alert('修改成功')
                } else {
                    $.alert('修改失败')
                }


            }).catch(function (err) {
                $.showLoading()

                $.alert('修改失败')
            })
        }


    }
})