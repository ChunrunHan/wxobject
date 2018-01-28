//app.js
Date.prototype.Format = function (fmt) { //author: meizz
  var o = {
    "M+": this.getMonth() + 1,                 //月份
    "d+": this.getDate(),                    //日
    "h+": this.getHours(),                   //小时
    "m+": this.getMinutes(),                 //分
    "s+": this.getSeconds(),                 //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds()             //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


Array.prototype.contains = function (needle) {
    for (i in this) {
        if (this[i] == needle) return true;
    }
    return false;
}


App({
  onLaunch: function () {
    wx.setStorageSync('orderLoginAlertShown', 'false')
  },
  formIds: [],
  // bucket: 'yzb-mall',
  // ossHost: 'https://dev.yezhubao.net/oss_mall',
  // urlBase: 'https://dev.yezhubao.net',
  bucket: 'yezhubao-mall',
  ossHost: 'https://api.yezhubao.net/oss_mall',
  urlBase: 'https://api.yezhubao.net',
  golobalData: {
    sendcouponId: ''
  }
})