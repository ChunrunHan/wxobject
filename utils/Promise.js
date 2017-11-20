function wxPromis(fn) {

    return function (obj) {
        return new Promise(function(resolve, reject) {
            obj.success = function (res) {
                resolve(res)
            }

            obj.fail = function (res) {
                reject(res)
            }

            fn(obj)
        })
    }
}

module.exports = wxPromis