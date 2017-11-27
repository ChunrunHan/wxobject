/**
 *  kouchao 创建于 2017/11/20
 */
const imgUrl = `https://dev.yezhubao.net/oss_mall`
const promise = require('promise').wxPromisify;
const ajax = require('ajax');
var QQMapWX = require('qqmap-wx-jssdk.min');
var qqmapsdk = new QQMapWX({
    key: 'WHGBZ-5JZKO-4PMWR-SEXNN-4O54Z-SNFO5'
})
module.exports = {
    get: ajax.get,
    post: ajax.post,
    put: ajax.put,
    del: ajax.del,
    wxLogin: promise(wx.login),
    setTitle: function (title) {
        wx.setNavigationBarTitle({
            title: title
        })
    },
    isMobile: function (number) {
        var reg = /^1[3|4|5|7|8][0-9]{9}$/;
        return reg.test(number)
    },
    alert: function (content) {
        wx.showModal({
            content: content
        })
    },
    confirm: function(content, fn1, fn2){
        wx.showModal({
            title: '提示',
            content: content,
            success: function(res) {
                if (res.confirm) {
                    fn1()
                } else if (res.cancel) {
                    if(fn2){
                        fn2()
                    }

                }
            }
        })
    }
,
    showLoading: function (title) {
        wx.showLoading({
            title: title || '加载中',
        })
    },
    hideLoading: function () {
        wx.hideLoading()
    },
    getLocation: promise(wx.getLocation),
    qqmapsdk: qqmapsdk,
    imgUrl: imgUrl

}