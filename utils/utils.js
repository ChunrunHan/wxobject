/**
 *  kouchao 创建于 2017/11/20
 */
const api = require('api');
const app = getApp()

const imgUrl = `https://dev.yezhubao.net/oss_mall`
const promise = require('promise').wxPromisify;
const ajax = require('ajax');
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
    confirm: function (content, fn1, fn2) {
        wx.showModal({
            title: '提示',
            content: content,
            success: function (res) {
                if (res.confirm) {
                    fn1()
                } else if (res.cancel) {
                    if (fn2) {
                        fn2()
                    }

                }
            }
        })
    },
    showLoading: function (title) {
        wx.showLoading({
            title: title || '加载中',
        })
    },
    hideLoading: function () {
        wx.hideLoading()
    },
    getLocation: promise(wx.getLocation),
    getDistrict: str => {
        return {
            province: str.slice(0,3),
            city: str.slice(3,6),
            district: str.slice(6,9)

        }
    },
    imgUrl: imgUrl,
    getTime: function (number) {
        var time = parseInt((number - new Date().getTime()) / 1000)
        var h = parseInt(time / 3600)
        var m = parseInt(time / 60 % 60)
        var s = parseInt(time % 60)

        h = h < 0 ? '0' : h
        m = m < 0 ? '0' : m
        s = s < 0 ? '0' : s

        if (!((h + ':' + m + ':' + s) == '00:00:00')) {
            h = h < 10 ? '0' + h : h
            m = m < 10 ? '0' + m : m
            s = s < 10 ? '0' + s : s
        }

        return h + ':' + m + ':' + s
    },
    wxRequestPayment: promise(wx.requestPayment),
    jump: function (url, close) {
        if(close){
            wx.redirectTo({
                url: url
            })
        }else {
            wx.navigateTo({
                url: url
            })
        }

    },
    login: function () {
        var _this = this
        return new Promise(function (resolve, reject) {
            _this.wxLogin().then(function (res) {
                wx.setStorageSync('code', res.code)

                var unionId = wx.getStorageSync('unionId')
                var openId = wx.getStorageSync('openId')
                if (openId) {
                    _this.get(api.login({
                        unionId,
                        openId
                    })).then(function (res) {

                        if (res.data.errCode !== 0) {
                            _this.jump('../mobile/index')
                        } else {
                            wx.setStorageSync('token', res.data.data.token)
                            wx.getUserInfo({
                                success: function(ress) {
                                    console.log(ress.userInfo)
                                    let userInfo = ress.userInfo
                                    let nickName = userInfo.nickName
                                    let avatarUrl = userInfo.avatarUrl
                                    let gender = userInfo.gender //性别 0：未知、1：男、2：女
                                    let province = userInfo.province
                                    let city = userInfo.city
                                    let country = userInfo.country

                                    let url = api.putUser
                                    let obj = {
                                        nickname: nickName,
                                        wxAvatar: avatarUrl
                                    }
                                    console.log(app.formIds)
                                    if(app.formIds.length > 0){
                                        _this.post(api.postFormId, app.formIds).then(function (res) {
                                            console.log(res)
                                            if(res.data.code == 0){
                                                console.log('上传formId成功')
                                                app.formIds = []
                                            }
                                        }).catch(function (err) {
                                            console.log('上传formId失败')
                                            console.log(err)
                                        })
                                    }
                                    if(!res.data.data.wxAvatar){
                                        _this.put(url, obj).then(function (res) {
                                            console.log(res)
                                            if(res.data.errCode == 0){
                                                console.log('上传头像成功')
                                            }
                                        }).catch(function (err) {
                                            console.log('上传头像失败')
                                            console.log(err)
                                        })
                                    }

                                }
                            })
                            resolve(res)
                        }
                    })
                } else {
                    _this.jump('../mobile/index')
                }

            }).catch(function (err) {
                reject(err)
            })
        })
    },
    math: {
        add: function (num1, num2) {
            var r1, r2, m;
            try {
                r1 = num1.toString().split('.')[1].length;
            } catch (e) {
                r1 = 0;
            }
            try {
                r2 = num2.toString().split(".")[1].length;
            } catch (e) {
                r2 = 0;
            }
            m = Math.pow(10, Math.max(r1, r2));
            // return (num1*m+num2*m)/m;
            return Math.round(num1 * m + num2 * m) / m;
        },
        sub: function (num1, num2) {
            var r1, r2, m;
            try {
                r1 = num1.toString().split('.')[1].length;
            } catch (e) {
                r1 = 0;
            }
            try {
                r2 = num2.toString().split(".")[1].length;
            } catch (e) {
                r2 = 0;
            }
            m = Math.pow(10, Math.max(r1, r2));
            n = (r1 >= r2) ? r1 : r2;
            return (Math.round(num1 * m - num2 * m) / m).toFixed(n);
        },
        mul: function (num1, num2) {
            var m = 0, s1 = num1.toString(), s2 = num2.toString();
            try {
                m += s1.split(".")[1].length
            } catch (e) {

            };
            try {
                m += s2.split(".")[1].length
            } catch (e) {

            };
            return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
        },
        div: function (num1, num2) {
            var t1, t2, r1, r2;
            try {
                t1 = num1.toString().split('.')[1].length;
            } catch (e) {
                t1 = 0;
            }
            try {
                t2 = num2.toString().split(".")[1].length;
            } catch (e) {
                t2 = 0;
            }
            r1 = Number(num1.toString().replace(".", ""));
            r2 = Number(num2.toString().replace(".", ""));
            return (r1 / r2) * Math.pow(10, t2 - t1);
        }
    }

}