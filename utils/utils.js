/**
 *  kouchao 创建于 2017/11/20
 */
const api = require('api');
const app = getApp()

const QQMapWX = require('qqmap-wx-jssdk');
const qqmapwx = new QQMapWX({
  key: 'WHGBZ-5JZKO-4PMWR-SEXNN-4O54Z-SNFO5' // 必填
});

const imgUrl = `https://dev.yezhubao.net/oss_mall`
// const imgUrl = `https://api.yezhubao.net/oss_mall`
const promise = require('promise').wxPromisify;
const ajax = require('ajax');
var wxUploadFile = promise(wx.uploadFile);

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
    if (close) {
      wx.redirectTo({
        url: url
      })
    } else {
      wx.navigateTo({
        url: url
      })
    }

  },
  login: function (yes) {
    console.log(yes);
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
            console.log('登录获取的' + res.data.errCode);
            if (res.data.errCode !== 0) {
              _this.jump('../mobile/index')
            } else {
              wx.setStorageSync('token', res.data.data.token)
              wx.getUserInfo({
                success: function (ress) {
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
                  if (app.formIds.length > 0) {
                    _this.post(api.postFormId, app.formIds).then(function (res) {
                      console.log(res)
                      if (res.data.code == 0) {
                        console.log('上传formId成功')
                        app.formIds = []
                      }
                    }).catch(function (err) {
                      console.log('上传formId失败')
                      console.log(err)
                    })
                  }
                  if (!res.data.data.wxAvatar) {
                    _this.put(url, obj).then(function (res) {
                      console.log('上传头像啊' + res)
                      if (res.data.errCode == 0) {
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
          if (yes == true) {
            wx.showModal({
              content: '当前尚未登录，是否登录？',
              cancelText: '稍后',
              confirmText: '登陆',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  _this.jump('../mobile/index')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          } else {
            _this.jump('../mobile/index')
          }

        }

      }).catch(function (err) {
        reject(err)
      })
    })
  },
  goLoginMobile: function () {
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '当前尚未登录，是否立即登录？',
      cancelText: '稍后',
      confirmText: '登录',
      success: function (res) {
        // false 没显示  true 显示
        if (res.confirm) {
          console.log('用户点击确定')
          _this.jump('../mobile/index')

        } else if (res.cancel) {
          console.log('用户点击取消')
          wx.setStorageSync('orderLoginAlertShown', 'false');
        }
      }
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
    sub: function Subtr(arg1, arg2) {
      var r1, r2, m, n;
      try {
        r1 = arg1.toString().split(".")[1].length;
      }
      catch (e) {
        r1 = 0;
      }
      try {
        r2 = arg2.toString().split(".")[1].length;
      }
      catch (e) {
        r2 = 0;
      }
      m = Math.pow(10, Math.max(r1, r2));
      //last modify by deeka
      //动态控制精度长度
      n = (r1 >= r2) ? r1 : r2;
      return ((arg1 * m - arg2 * m) / m).toFixed(n);
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
  },
  qqmapwx: qqmapwx,
  ossUpload: ossUpload,
  formatDate: formatDate,
  formatDateAll: formatDateAll
}

// / 时间戳转时间
function formatDate(timestamp) {
  timestamp = new Date(timestamp);
  var year = timestamp.getFullYear();
  var month = timestamp.getMonth() + 1;
  var date = timestamp.getDate();
  var hour = timestamp.getHours();
  var minute = timestamp.getMinutes();
  var second = timestamp.getSeconds();
  if (month < 10) {
    month = '0' + month;
  }
  if (date < 10) {
    date = '0' + date;
  }
  if (hour < 10) {
    hour = '0' + hour;
  }
  if (minute < 10) {
    minute = '0' + minute;
  }
  if (second < 10) {
    second = '0' + second;
  }
  // return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
  return year + "-" + month + "-" + date;
}

function formatDateAll(timestamp) {
  timestamp = new Date(timestamp);
  var year = timestamp.getFullYear();
  var month = timestamp.getMonth() + 1;
  var date = timestamp.getDate();
  var hour = timestamp.getHours();
  var minute = timestamp.getMinutes();
  var second = timestamp.getSeconds();
  if (month < 10) {
    month = '0' + month;
  }
  if (date < 10) {
    date = '0' + date;
  }
  if (hour < 10) {
    hour = '0' + hour;
  }
  if (minute < 10) {
    minute = '0' + minute;
  }
  if (second < 10) {
    second = '0' + second;
  }
  return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}


//  upload img to oss
function ossUpload(source) {
  console.log('ossUpload(' + source + ')');
  var upload = new Promise(function (resolve, reject) {

    stsUpdate().then(function (sts) {
      console.log(sts);
      var ossKeyId = sts.accessKeyId;
      var signature = sts.signature;
      var policy = sts.policy;
      var dir = sts.dir;
      var host = app.ossHost

      if (ossKeyId === undefined || signature === undefined) {
        reject(ERROR.INVALID_PARAMS);
      }

      var pos = source.lastIndexOf('.');
      var suffix = source.substring(pos).toLowerCase();
      var filename = uuid().replace(/-/, '') + suffix;
      var keyname = dir + filename;

      wx.showLoading({
        title: '上传中',
      });

      wxUploadFile({
        url: host,
        filePath: source,
        formData: {
          'key': keyname,
          'policy': policy,
          'OSSAccessKeyId': ossKeyId,
          'signature': signature,
          'success_action_status': '200'
        },
        name: "file"
      }).then(function (res) {
        wx.hideLoading();
        res.filename = filename
        resolve(res)
      }).catch(function (err) {
        wx.hideLoading();
        console.log(err);
        reject(err)
      })
    })
  });

  return upload;
}

// get post signature
function stsUpdate(forceUpdate) {
  var urlBase = app.urlBase;
  var url = urlBase + "/mall/oss/sign/wx_lpqd";
  console.log('ossupload图片上传url' + url);

  var getTts = new Promise(function (resolve, reject) {
    ajax.get(url).then(function (res) {
      if (res.statusCode !== 200) {
        throw (res)
      }
      console.log('res');
      console.log(res);

      console.log(res.data);
      console.log(res.data.data);
      var sts = res.data;
      if (sts.errCode !== 0) reject(sts.errorCode);
      console.log('sts=' + JSON.stringify(sts));
      var data = new Object();
      data.sts = sts.data;
      resolve(data.sts)

    }).catch(function (err) {
      wx.hideLoading();
      console.log('fail to update sts: ', err);
      reject(err)
    })
  })
  return getTts
}


//	oss单个文件删除
function delImgFromServer(file, source) {
  bucket = app.bucket;
  var delfile = [{
    bucket: bucket,
    object: file
  }]
  console.log('删除的文件名字： ' + delfile);
  console.log('删除的文件来源： ' + source);
  urlBase = app.urlBase;
  var url = urlBase + '/oss/delete/seller';
  ajax.post(url, delfile).then(function (res) {
    console.log('删除成功');
    console.log(res.data);

  }).catch(function (status) {
    console.log('oss单个文件删除' + status)
    statusHandler(status);
  })
}

function uuid() {
  var lut = [];
  for (var i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16); }
  var d0 = Math.random() * 0xffffffff | 0;
  var d1 = Math.random() * 0xffffffff | 0;
  var d2 = Math.random() * 0xffffffff | 0;
  var d3 = Math.random() * 0xffffffff | 0;
  return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] +
    lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] +
    lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
    lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
}