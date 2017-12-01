// pages/rating-list/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
var loading = false

Page({
   data: {
        ratingList: [],
        page: 0

    },
    onLoad: function (options) {
        $.setTitle('评价列表')
      this.getRating(options.id)
    },
    getRating: function (id) {
        console.log('getRating')
        let _this = this
        let obj = {
            goodsId: id,
            page: this.data.page,
            size: 10
        }
        let url = api.getRating(obj)
        $.get(url).then(function (res) {
            if (res.data.errCode === 0) {
                let ratingList = res.data.dataList
                ratingList.forEach(obj => {
                    obj.createTime = new Date(obj.createTime).Format("yyyy.MM.dd")
                })
                if(_this.data.page > 0){
                    ratingList = [..._this.data.ratingList, ...ratingList]
                }



                _this.setData({
                    ratingList
                })

                loading = false
                console.log(ratingList)

                if(ratingList.length <= 10){
                    loading = true
                    _this.setData({
                        more: '没有更多数据'
                    })
                }
            }else {
                _this.setData({
                    more: '没有更多数据'
                })
            }

        }).catch(function (err) {
            console.log(err)
        })
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

            this.getRating()
        }

    },
    onReachBottom: function () {
        this.getMore()
    }
})