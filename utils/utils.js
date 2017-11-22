/**
 *  kouchao 创建于 2017/11/20
 */
const promise = require('promise');
const ajax = require('ajax');
module.exports = {
    get: ajax.get,
    post: ajax.post,
    put: ajax.put,
    wxLogin: promise.wxPromisify(wx.login),
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
    showLoading: function (title) {
        wx.showLoading({
            title: title || '加载中',
        })
    },
    hideLoading: function () {
        wx.hideLoading()
    }
}