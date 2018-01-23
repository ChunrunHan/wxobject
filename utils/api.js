const baseUrl = `https://dev.yezhubao.net`
const mallUrl = `https://dev.yezhubao.net/mall`
const expressUrl = `https://dev.yezhubao.net/express`
// const baseUrl = `https://api.yezhubao.net`
// const mallUrl = `https://api.yezhubao.net/mall`
// const expressUrl = `https://api.yezhubao.net/express`
module.exports = {
    getSms: mobile => `${baseUrl}/user/sms/${mobile}/login`,
    login: obj => `${baseUrl}/user/micro_app/login/${obj.mobile || ''}/${obj.smsValidateCode || ''}/${obj.jsCode || ''}/${obj.unionId || ''}/${obj.openId || ''}`,
    // getRecommendList: obj => `${mallUrl}/recommend/group/${obj.province}/${obj.city}/${obj.district}/${obj.zone}/${obj.longitude || 120.33}/${obj.latitude || 36.07}/${obj.page || 0}/${obj.size || 10}`,
    getRecommendList: obj => `${mallUrl}/recommend/group/${obj.page || 0}/${obj.size || 10}`,
    getGoodsDetails: goodsId => `${mallUrl}/goods/group/${goodsId}`,
    postOrder: () => `${mallUrl}/order/add/group`,
    getOrderList: obj => `${mallUrl}/order/list/group//${obj.status}/${obj.page || 0}/${obj.size || 10}`, 
    getExpressList: obj => `${expressUrl}/query/${obj.orderid}/${obj.company}/${obj.num}`,
    getAddressList: obj => `${mallUrl}/address/list/${obj.page || 0}/${obj.size || 10}`,
    putAddressDefault: addressId => `${mallUrl}/address/default/${addressId}`,
    deleteAddress: addressId => `${mallUrl}/address/${addressId}`,
    addOrEditAddress: () => `${mallUrl}/address`,
    getGroups: goodsId => `${mallUrl}/goods/groups/${goodsId}`,
    getGroupsUser: groupId => `${mallUrl}/goods/groups_user_info/${groupId}`,
    getGroupId: goodsId => `${mallUrl}/goods/user_group/${goodsId}`,
    putOrderWatitingevalaute: orderId => `${mallUrl}/order/watitingevalaute/${orderId}`,
    payOrder: obj => `${mallUrl}/payment/group/${obj.orderId}/${obj.openId}`,
    postRating: () => `${mallUrl}/rating`,
    getRating: obj => `${mallUrl}/rating/list/goods/ratings///${obj.goodsId}////${obj.page}/${obj.size}`,
    putUser: `${baseUrl}/user`,
    requestRefund: orderId => `${mallUrl}/order/request_refund/${orderId}`,
    groupExpireTime: groupId => `${mallUrl}/goods/group_expire_time/${groupId}`,
    getAd: `${mallUrl}/ad/group/list`,
    postFormId: `${mallUrl}/tm/form_id`,
    postSearchGoods: () =>`${mallUrl}/goods/search/group`,
    getCoupons: obj => `${mallUrl}/coupon/received/group/${obj.page || 0}/${obj.size || 10}`,
    getUseCoupons: obj => `${mallUrl}/coupon/effective/${obj.goodsId}/${obj.count}/${obj.groupBuyType}/${obj.page || 0}/${obj.size || 10}`
  
}