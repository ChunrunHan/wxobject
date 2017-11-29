//index.js
//获取应用实例
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp()

var loading = false

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
        imgUrls: [
            'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        swiperCofing: swiperCofing,
        recommendList: [],
        zone: '正在定位',
        imgUrl: $.imgUrl,
        more: '下拉加载更多',
        page: 0
    },
    onLoad: function () {
        this.init()
        this.getSetting()
    },
    getRecommendList: function () {
        var _this = this
        var obj = {
            province: '山东省',
            city: '青岛市',
            district: wx.getStorageSync('district'),
            zone: wx.getStorageSync('zone'),
            longitude: wx.getStorageSync('longitude'),
            latitude: wx.getStorageSync('latitude'),
            page: _this.data.page
        }
        var url = api.getRecommendList(obj)
        $.showLoading()
        $.get(url).then(function (res) {
            wx.stopPullDownRefresh()
            $.hideLoading()
            if (res.data.errCode == 0) {
                var recommendList = res.data.dataList
                recommendList.forEach(function (obj) {
                    obj.images = obj.images.split(':')[0]
                })
                if(_this.page > 0){
                    recommendList = [..._this.data.recommendList, ...recommendList]
                }

                _this.setData({
                    recommendList
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
            console.log(err).
            _this.setData({
                more: '没有更多数据'
            })
            wx.stopPullDownRefresh()
        })
    },
    setLocal: function () {
        var _this = this
        $.getLocation().then(function (res) {
            console.log(res)
            var latitude = res.latitude
            var longitude = res.longitude
            let obj = {
                latitude,
                longitude
            }
            _this.setLocationData(obj)

        })
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
    init: function () {
        this.setData({
            recommendList: [],
            page: 0
        })
        var latitude = wx.getStorageSync('latitude')
        var longitude = wx.getStorageSync('longitude')
        var zone = wx.getStorageSync('zone')
        var district = wx.getStorageSync('district')

        if (latitude && longitude && zone && district) {
            this.setData({
                zone
            })
            this.getRecommendList()
        } else {
            this.setLocal()
        }
    },
    onPullDownRefresh: function () {
        this.init()
        this.getRecommendList()
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
                if (!res.result.address.includes('山东省青岛市')) {
                    if (zone) {
                        $.alert('区域不在青岛市, 请重新选择')
                        zone = "重新选择"
                    } else {
                        $.alert('当前定位不在青岛市, 请手动定位')
                        zone = "手动定位"
                    }

                    _this.setData({
                        zone,
                    })
                    return false
                } else

                    zone = zone || res.result.address_reference.landmark_l1.title

                var district = res.result.address_component.district

                _this.setData({
                    latitude,
                    longitude,
                    zone,
                })

                wx.setStorageSync('latitude', latitude)
                wx.setStorageSync('longitude', longitude)
                wx.setStorageSync('zone', zone)
                wx.setStorageSync('district', district)


                _this.getRecommendList()
            }
        });
    },
    getMore: function () {
        if (!loading) {
            var page = this.data.page + 1
            var more = '加载中'
            loading = true
            this.setData({
                page,
                more
            })

            this.getRecommendList()
        }

    },
    onReachBottom: function () {
        this.getMore()
    },
    getSetting: function () {
        wx.getUserInfo({
            success: function(res) {
                console.log(res.userInfo)
                var userInfo = res.userInfo
                var nickName = userInfo.nickName
                var avatarUrl = userInfo.avatarUrl
                var gender = userInfo.gender //性别 0：未知、1：男、2：女
                var province = userInfo.province
                var city = userInfo.city
                var country = userInfo.country
            }
        })
    }
})
