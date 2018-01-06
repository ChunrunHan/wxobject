function wxPromisify(fn) {
    return function (obj) {
        obj = obj || {}
        return new Promise(function (resolve, reject) {
            obj.success = function (res) {
                // console.log(res)
                resolve(res)
            }

            obj.fail = function (res) {
                wx.hideLoading()
                reject(res)
            }

            fn(obj)
        })
    }
}

module.exports = {
    wxPromisify: wxPromisify
}