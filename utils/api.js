const baseUrl = `https://dev.yezhubao.net`
const mallUrl = `https://dev.yezhubao.net/mall`
module.exports = {
    getSms: function (mobile) {
        var url = `${baseUrl}/user/sms/${mobile}/login`
        return url
    },
    login: function (obj) {
        var url = `${baseUrl}/user/micro_app/login/${obj.mobile || ''}/${obj.smsValidateCode || ''}/${obj.jsCode || ''}/${obj.unionId || ''}`
        return url
    }
}