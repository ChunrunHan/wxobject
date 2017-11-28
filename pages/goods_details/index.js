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
        imgUrl: $.imgUrl,
        box: false
    },
    onLoad: function (e) {
        console.log(e.id)
        this.getGoodsDetails(e.id)
        this.getGroupList(e.id)
    },
    getGoodsDetails: function (id) {
        let _this = this
        let url = api.getGoodsDetails(id)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
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
    },
    getGroupList: function (id) {
        let _this = this
        let url = api.getGroups(id)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
                let groupList =  res.data.dataList
                let _groupList = JSON.stringify(groupList);


                setInterval(() => {

                    groupList = JSON.parse(_groupList)
                    Array.from(groupList, (obj) => {
                        obj.endTime = $.getTime(obj.endTime)
                    })
                    _this.setData({
                        groupList
                    })
                }, 100)
                console.log(goodsDetails)
            }else {
                let groupList = [{
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://www.spiiker.com/u/useravatar/2017/0629/20170629154255808.jpg',
                    name: '姓名',
                    remaining: 2
                }, {
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://e.hiphotos.baidu.com/zhidao/wh%3D450%2C600/sign=450129f5d12a60595245e91e1d0418ad/a8773912b31bb051ec177614307adab44aede0df.jpg',
                    name: '姓名',
                    remaining: 2
                }, {
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://up.qqjia.com/z/01/tu3938_2.jpg',
                    name: '姓名',
                    remaining: 2
                }, {
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://www.qqzhi.com/uploadpic/2014-10-02/015030299.jpg',
                    name: '姓名',
                    remaining: 2
                }, {
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://www.qqzhi.com/uploadpic/2015-01-18/215804662.jpg',
                    name: '姓名',
                    remaining: 2
                }, {
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://b.hiphotos.baidu.com/zhidao/wh%3D450%2C600/sign=2b4e25657a8b4710ce7af5c8f6feefcb/b90e7bec54e736d1bec1514c93504fc2d46269a0.jpg',
                    name: '姓名',
                    remaining: 2
                }, {
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://p1.qqyou.com/touxiang/uploadpic/2010-12/201012119574358236.jpg',
                    name: '姓名',
                    remaining: 2
                }, {
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://k2.jsqq.net/uploads/allimg/1703/7_170312181624_2.jpg',
                    name: '姓名',
                    remaining: 2
                }, {
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://n.7k7kimg.cn/2014/0813/1407909755246.jpg',
                    name: '姓名',
                    remaining: 2
                }, {
                    id: 12345,
                    endTime: new Date(`2017/11/29`).getTime(),
                    avatar: 'http://www.qqzhi.com/uploadpic/2014-09-27/093145285.jpg',
                    name: '姓名',
                    remaining: 2
                }]




            }

        }).catch(function (err) {
            console.log(err)
        })
    },
    showBox: function () {
        this.setData({
            box: true
        })
    },
    hideBox: function () {
        this.setData({
            box: false
        })
    }
})