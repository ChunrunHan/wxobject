const baseUrl = `https://dev.yezhubao.net`
const mallUrl = `https://dev.yezhubao.net/mall`
module.exports = {
    getSms: mobile => `${baseUrl}/user/sms/${mobile}/login`,
    login: obj => `${baseUrl}/user/micro_app/login/${obj.mobile || ''}/${obj.smsValidateCode || ''}/${obj.jsCode || ''}/${obj.unionId || ''}/${obj.openId || ''}`,
    getRecommendList: obj => `${mallUrl}/recommend/group/${obj.province}/${obj.city}/${obj.district}/${obj.zone}/${obj.longitude || 120.33}/${obj.latitude || 36.07}/${obj.page || 0}/${obj.size || 10}`,
    getGoodsDetails: goodsId => `${mallUrl}/goods/group/${goodsId}`,
    postOrder: () => `${mallUrl}/order/add/group`,
    getOrderList: obj => `${mallUrl}/order/list/customer/${obj.userId}/${obj.status}/${obj.page || 0}/${obj.size || 10}`,
    getAddressList: obj => `${mallUrl}/address/list/${obj.page || 0}/${obj.size || 10}`,
    putAddressDefault: addressId => `${mallUrl}/address/default/${addressId}`,
    deleteAddress: addressId => `${mallUrl}/address/${addressId}`,
    addOrEditAddress: () => `${mallUrl}/address`,
    getGroups: goodsId => `${mallUrl}/goods/groups/${goodsId}`,
    getGroupsUser: groupId => `${mallUrl}/goods/groups_user_info/${groupId}`,
    getGroupId: goodsId => `${mallUrl}/goods/user_group/${goodsId}`
}