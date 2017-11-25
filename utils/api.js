const baseUrl = `https://dev.yezhubao.net`
const mallUrl = `https://dev.yezhubao.net/mall`
module.exports = {
    getSms: function (mobile) {
        let url = `${baseUrl}/user/sms/${mobile}/login`
        return url
    },
    login: function (obj) {
        let url = `${baseUrl}/user/micro_app/login/${obj.mobile || ''}/${obj.smsValidateCode || ''}/${obj.jsCode || ''}/${obj.unionId || ''}`
        return url
    },
    getRecommendList: function (obj) {
        let url = `${mallUrl}/recommend/group/${obj.province}/${obj.city}/${obj.district}/${obj.zone}/${obj.longitude || 120.33}/${obj.latitude || 36.07}/${obj.page || 0}/${obj.size || 10}`
        return url
    },
    getGoodsDetails: goodsId => `${mallUrl}/goods/group/${goodsId}`,
    postOrder: () => `${mallUrl}/order/add/group`
}