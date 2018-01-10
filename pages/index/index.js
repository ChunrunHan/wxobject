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
        $.setTitle('盛华优选')
        this.init()
    },
    onShow: function(){
      // this.init()
    },
    getRecommendList: function () {
        var _this = this

        var obj = {
            province: '山东省',
            city: '青岛市',
            district: wx.getStorageSync('district'),
            zone: wx.getStorageSync('zone'),
            lng: parseFloat(wx.getStorageSync('longitude')),
            lat: parseFloat(wx.getStorageSync('latitude')),
        }
        var url = api.getRecommendList({
            page: _this.data.page
        })
        $.showLoading()
        $.post(url, obj).then(function (res) {
            wx.stopPullDownRefresh()
            $.hideLoading()
            if (res.data.errCode == 0) {
                var recommendList = res.data.dataList
                recommendList.forEach(function (obj) {
                    obj.images = obj.images.split(':')[0]
                })
                if (_this.data.page > 0) {
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
            console.log(err)
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
            success: function (ress) {
                console.log(ress);
                let zone = ress.name
                $.qqmapwx.geocoder({
                    address: ress.address,
                    success: function (res) {
                        console.log(res)
                        console.log(' - - - - -  --  -- ')
                        let latitude = res.result.location.lat
                        let longitude = res.result.location.lng

                        let city = res.result.address_components.city
                        if (city != '青岛市') {
                            $.alert('区域不在青岛市, 请重新选择')
                            zone = "重新选择"


                            _this.setData({
                                zone,
                            })
                            return false
                        }

                        _this.setData({
                            latitude,
                            longitude,
                            zone,
                        })

                        wx.setStorageSync('latitude', latitude)
                        wx.setStorageSync('longitude', longitude)
                        wx.setStorageSync('zone', zone)
                        wx.setStorageSync('district', res.result.address_components.district)

                        _this.getRecommendList()
                        _this.getAd()
                    },
                    fail: function (err) {
                        console.log(err)
                    }
                })

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
            this.getAd()
        } else {
            this.getLocation()
        }
    },
    onPullDownRefresh: function () {
        this.init()
        this.getRecommendList()
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
    getAd: function () {
        console.log('getAd')
        var latitude = wx.getStorageSync('latitude')
        var longitude = wx.getStorageSync('longitude')
        let _this = this
        let obj = {
            lng: longitude,
            lat: latitude
        }
        console.log(obj)
        let url = api.getAd
        $.post(url, obj).then(function (res) {
            if (res.data.errCode === 0) {
                let adList = res.data.dataList
                adList.forEach(obj => {
                    obj.id = JSON.parse(obj.afterClick).goodsId
                    obj.image = `http://${app.bucket}.oss-cn-qingdao.aliyuncs.com/ad/` + obj.image
                })
                _this.setData({
                    adList
                })
                console.log(res.data)

            }

        }).catch(function (err) {
            console.log(err)
        })
    },
    openDetail: function (e) {
        console.log(e)
        let id = e.currentTarget.dataset.id
        let url = `../goods_details/index?id=${id}`
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
    getLocation: function () {
        let _this = this
        wx.getLocation({
            type: 'wgs84',
            success: function (ress) {
                let latitude = ress.latitude
                let longitude = ress.longitude
                $.qqmapwx.reverseGeocoder({
                    location: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    success: function (res) {
                        $.qqmapwx.geocoder({
                            address: res.result.address,
                            success: function (res) {
                                console.log(res)
                                let lat = res.result.location.lat
                                let lng = res.result.location.lng
                                let city = res.result.address_components.city
                                if (city != '青岛市') {
                                    $.alert('区域不在青岛市, 请重新选择')
                                    zone = "手动选择"

                                    _this.setData({
                                        zone,
                                    })
                                    return false
                                }
                                wx.setStorageSync('latitude', lat)
                                wx.setStorageSync('longitude', lng)
                                wx.setStorageSync('zone', res.result.title)
                                wx.setStorageSync('district', res.result.address_components.district)
                                _this.init()
                            },
                            fail: function (err) {
                                console.log(err)
                            }
                        })
                    },
                    fail: function (err) {
                        console.log(err)
                    }
                })
            }
        })

    }
})
