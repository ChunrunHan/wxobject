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
        $.setTitle('乐拼青岛')
        this.init()
    },
    getRecommendList: function () {
        var _this = this
        // var obj = {
        //     province: '山东省',
        //     city: '青岛市',
        //     district: wx.getStorageSync('district'),
        //     zone: wx.getStorageSync('zone'),
        //     longitude: wx.getStorageSync('longitude'),
        //     latitude: wx.getStorageSync('latitude'),
        //     page: _this.data.page
        // }
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
                if(_this.data.page > 0){
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
            success: function (res) {
                var zone = res.name
                var latitude = res.latitude
                var longitude = res.longitude
                let obj = {
                    latitude,
                    longitude,
                    zone
                }

                if (!res.address.includes('山东省青岛市')) {
                    $.alert('区域不在青岛市, 请重新选择')
                    zone = "重新选择"

                    _this.setData({
                        zone,
                    })
                    return false
                } else

                var district = $.getDistrict(res.address).district

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
                _this.getAd()

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
            wx.setStorageSync('latitude', '36.06623')
            wx.setStorageSync('longitude', '120.38299')
            wx.setStorageSync('zone', '全青岛')
            wx.setStorageSync('district', '市南区')
            this.init()
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
            lng : longitude,
            lat : latitude
        }
        let url = api.getAd
        $.post(url, obj).then(function (res) {
            if (res.data.errCode === 0) {
                let adList = res.data.dataList
                adList.forEach(obj => {
                    obj.id = JSON.parse(obj.afterClick).goodsId
                    obj.image = 'http://yzb-mall.oss-cn-qingdao.aliyuncs.com/ad/' + obj.image
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
    openDetail: function(e) {
        let id = e.target.dataset.id
        let url = `../goods_details/index?id=${id}`
        $.jump(url)
    },
    getFormId: function (e) {
        let formId = e.detail.formId;
        app.formIds.push(formId)
        console.log(`getFormId: ${formId}`)
        console.log(app.formIds)
    }
})
