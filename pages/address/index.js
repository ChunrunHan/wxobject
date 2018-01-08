// pages/address/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const city = require('../../utils/city');
const app = getApp();
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var demo = new QQMapWX({
  key: 'YFBBZ-AJRKO-KAKWM-S55DU-S3K2S-UNBQK' // 必填
});

var loading = false

Page({
  data: {
    showAddress: false,
    sheng: [],//获取到的所有的省
    shi: [],//选择的该省的所有市
    qu: [],//选择的该市的所有区县
    sheng_index: 0,//picker-view省项选择的value值
    shi_index: 0,//picker-view市项选择的value值
    qu_index: 0,//picker-view区县项选择的value值
    shengshi: null,//取到该数据的所有省市区数据
    jieguo: {},//最后取到的省市区名字
    animationData: {}
  },
  onLoad: function (options) {
    console.log(city.city())
    var regions = city.city();

    this.setData({
      shengshi: regions
    });

    this.jilian();
    console.log(options.setAddress)
    $.setTitle('收货地址')
    this.setData({
      text: options.setAddress ? '使用此地址' : '设为默认'
    })
    this.getAddressList()
  },
  setAddress: function (e) {
    if (this.data.text == '使用此地址') {
      this.setDefault(e)
    }
  },
  chooseLocation: function () {
    var _this = this
    wx.chooseLocation({
      success: function (ress) {
        var zone = ress.name
        $.qqmapwx.geocoder({
          address: ress.address,
          success: function (res) {
            console.log(res)
            console.log(' - - - - -  --  -- ')
            let latitude = res.result.location.lat
            let longitude = res.result.location.lng

            var province = res.result.address_components.province
            var city = res.result.address_components.city
            var district = res.result.address_components.district

            _this.setData({
              latitude,
              longitude,
              zone,
              district,
              city,
              province
            })
          },
          fail: function (err) {
            console.log(err)
          }
        })
      }
    })
  },
  inputAddress: function (e) {
    let address = e.detail.value
    this.setData({
      address
    })
  },
  inputMobile: function (e) {
    let mobile = e.detail.value
    this.setData({
      mobile
    })
  },
  inputReceiver: function (e) {
    let receiver = e.detail.value
    this.setData({
      receiver
    })
  },
  showBox: function () {
    console.log('showBox')
    this.setData({
      box: true
    })
  },
  hideBox: function () {
    this.setData({
      receiver: '',
      mobile: '',
      latitude: '',
      longitude: '',
      zone: '',
      district: '',
      city: '',
      address: '',
      province: '',
      addOrEdit: '',
      box: false
    })
  },
  addOrEdit: function (e) {
    let index = e.currentTarget.dataset.index || e.target.dataset.index || 0
    let addOrEdit = e.currentTarget.dataset.addoredit

    if (addOrEdit) {
      let addOrEdit = this.data.addressList[index].id

      console.log(index)
      let latitude = this.data.addressList[index].latitude
      let longitude = this.data.addressList[index].longitude
      let district = this.data.addressList[index].district
      let address = this.data.addressList[index].address
      let zone = this.data.addressList[index].zone || ''
      let city = this.data.addressList[index].city
      let province = this.data.addressList[index].province
      let receiver = this.data.addressList[index].receiver
      let mobile = this.data.addressList[index].mobile
      let jieguo = {
        sheng: this.data.addressList[index].province,
        shi: this.data.addressList[index].city,
        qu: this.data.addressList[index].district

      };

      this.setData({
        jieguo: jieguo
      });

      this.setData({
        receiver,
        mobile,
        latitude,
        longitude,
        zone,
        district,
        city,
        address,
        province,
        addOrEdit
      })
    } else {
      console.log('添加')
      this.getCurrentPos();
      this.setData({
        addOrEdit
      })
      console.log(this.data);
    }


    this.showBox()
  },
  save: function () {
    this.addOrEditAddress()
  },
  getAddressList: function () {
    $.showLoading()

    let _this = this
    let url = api.getAddressList({})
    $.get(url).then(function (res) {
      wx.stopPullDownRefresh()
      $.hideLoading()
      if (res.data.errCode == 0) {
        let addressList = res.data.dataList
        _this.setData({
          addressList
        })
        loading = false
        _this.setData({
          more: '上拉加载更多'
        })
      } else {
        _this.setData({
          addressList: [],
          more: '没有更多数据'
        })
      }


    }).catch(function (err) {

      _this.setData({
        more: '没有更多数据'
      })

    })
  },
  setDefault: function (e) {

    let _this = this
    let index = e.currentTarget.dataset.index
    let addressId = this.data.addressList[index].id
    let isDfault = this.data.addressList[index].default
    // if (this.data.addressList[index].latitude == 0 && this.data.addressList[index].longitude == 0) {
    //     $.alert('地区信息已过期，重新选择地区')
    //     return false
    // }
    let url = api.putAddressDefault(addressId)
    if (!isDfault) {
      $.showLoading()
      $.put(url, {}).then(function (res) {
        $.hideLoading()
        if (res.data.code == 0) {
          _this.getAddressList()
          if (_this.data.text == '使用此地址') {
            wx.navigateBack({
              delta: 1
            })
          }
        } else {
          $.alert('设为默认地址失败')
        }


      }).catch(function (err) {
        $.showLoading()

        $.alert('设为默认地址失败')
      })
    }
  },
  deleteAddress: function (e) {
    let _this = this
    let index = e.currentTarget.dataset.index
    console.log(e)

    let addressId = _this.data.addressList[index].id
    let url = api.deleteAddress(addressId)
    $.confirm('确认删除地址？', function () {
      $.showLoading()
      $.del(url).then(function (res) {
        $.hideLoading()
        if (res.data.code == 0) {
          $.alert('删除地址成功')
          _this.getAddressList()
        } else {
          $.alert('删除地址失败')
        }


      }).catch(function (err) {
        $.showLoading()

        $.alert('删除地址失败')
      })
    })
  },
  addOrEditAddress: function () {
    var _this = this
    var url = api.addOrEditAddress()
    var obj = {
      province: this.data.jieguo.sheng,
      city: this.data.jieguo.shi,
      district: this.data.jieguo.qu,
      address: this.data.address,
      zone: '',
      mobile: this.data.mobile,
      receiver: this.data.receiver,
      latitude: '',
      longitude: ''
    }

    if (!obj.receiver) {
      $.alert('请输入您的名字')
      return false
    }

    if (!$.isMobile(obj.mobile)) {
      $.alert('请输入正确的手机号')
      return false
    }

    // if (!this.data.zone) {
    //     $.alert('请选择地区')
    //     return false
    // }

    if (!this.data.address) {
      $.alert('请输入详细地址')
      return false
    }

    // if (obj.latitude == 0 && obj.longitude == 0) {
    //     $.alert('地区信息已过期，重新选择地区')
    //     return false
    // }

    if (!this.data.addOrEdit) {
      console.log(JSON.stringify(obj));
      $.post(url, obj).then(function (res) {
        $.hideLoading()
        if (res.data.code == 0) {
          _this.getAddressList()
          _this.hideBox()
          $.alert('添加成功')
        } else {
          $.alert('添加失败')
        }


      }).catch(function (err) {
        $.showLoading()

        $.alert('添加失败')
      })
    } else {
      console.log(obj)
      obj.id = this.data.addOrEdit
      $.put(url, obj).then(function (res) {
        $.hideLoading()
        if (res.data.code == 0) {
          _this.getAddressList()
          _this.hideBox()
          $.alert('修改成功')
        } else {
          $.alert('修改失败')
        }


      }).catch(function (err) {
        $.showLoading()

        $.alert('修改失败')
      })
    }


  },
  showLocation: function (e) {
    $.showLoading()
    var _this = this;
    _this.setData({
      showAddress: true,
      animation: 'divshow'
    })
    demo.reverseGeocoder({
      success: function (res) {
        wx.hideLoading()
        console.log(res);
        console.log(JSON.stringify(res.result.address_reference));
        console.log(_this.data.addOrEdit)
        var currentPOS = res.result.address_component;
        let jieguo = {
          shi: currentPOS.city,
          qu: currentPOS.district,
          sheng: currentPOS.province
        };

        _this.setData({
          jieguo: jieguo
        });
        var x = Array();
        let addressList = res.result.address_reference;
        console.log(addressList.length);
        for (var j in addressList) {
          console.log(addressList[j].title)
          x.push(addressList[j].title);
        }
        var _x = _this.unique(x);
        console.log(_x);
        _this.setData({
          addressListMore: _x
        })

        if (_this.data.addOrEdit == 0) {
          // 新增地址


        } else {
          // 编辑地址

        }
      },
      fail: function (res) {
        wx.hideLoading()
        console.log(res);
      },
      complete: function (res) {
        wx.hideLoading()
        console.log(res);
      }
    });

    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })

    this.animation = animation
    animation.height(0 + 'rpx').step()
    this.setData({
      animationData: animation.export()
    });
  },
  hideLocation: function (e) {
    var _this = this;
    _this.setData({
      showAddress: false,
      animation: 'divhide',
      address: e.currentTarget.dataset.address
    })
    console.log(e.currentTarget.dataset.address)

  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  dianji: function () {
    //这里写了一个动画，让其高度变为满屏
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    this.animation = animation
    animation.height(500 + 'rpx').step()
    this.setData({
      animationData: animation.export(),
      showAddress:false
    })

  },
  //取消按钮
  quxiao: function () {
    //这里也是动画，然其高度变为0
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })

    this.animation = animation
    animation.height(0 + 'rpx').step()
    this.setData({
      animationData: animation.export()
    });
    //取消不传值，这里就把jieguo 的值赋值为{}
    // this.setData({
    //   jieguo: {}
    // });
    this.getCurrentPos();
    console.log(this.data.jieguo);
  },
  //确认按钮
  queren: function () {
    //一样是动画，级联选择页消失，效果和取消一样
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    this.animation = animation
    animation.height(0 + 'rpx').step()
    this.setData({
      animationData: animation.export()
    });
    //打印最后选取的结果
    console.log(this.data.jieguo);
  },
  //这里是判断省市名称的显示
  jilian: function () {
    var that = this,
      shengshi = that.data.shengshi,
      sheng = [],
      shi = [],
      qu = [],
      qu_index = that.data.qu_index,
      shi_index = that.data.shi_index,
      sheng_index = that.data.sheng_index;
    //遍历所有的省，将省的名字存到sheng这个数组中
    for (let i = 0; i < shengshi.length; i++) {
      sheng.push(shengshi[i].name)
    }

    if (shengshi[sheng_index].regions) {//这里判断这个省级里面有没有市（如数据中的香港、澳门等就没有写市）
      if (shengshi[sheng_index].regions[shi_index]) {//这里是判断这个选择的省里面，有没有相应的下标为shi_index的市，因为这里的下标是前一次选择后的下标，比如之前选择的一个省有10个市，我刚好滑到了第十个市，现在又重新选择了省，但是这个省最多只有5个市，但是这时候的shi_index为9，而这里的市根本没有那么多，所以会报错
        //这里如果有这个市，那么把选中的这个省中的所有的市的名字保存到shi这个数组中
        for (let i = 0; i < shengshi[sheng_index].regions.length; i++) {
          shi.push(shengshi[sheng_index].regions[i].name);
        }
        console.log('执行了区级判断');

        if (shengshi[sheng_index].regions[shi_index].regions) {//这里是判断选择的这个市在数据里面有没有区县
          if (shengshi[sheng_index].regions[shi_index].regions[qu_index]) {//这里是判断选择的这个市里有没有下标为qu_index的区县，道理同上面市的选择
            console.log('这里判断有没有进区里');
            //有的话，把选择的这个市里面的所有的区县名字保存到qu这个数组中
            for (let i = 0; i < shengshi[sheng_index].regions[shi_index].regions.length; i++) {
              console.log('这里是写区得');
              qu.push(shengshi[sheng_index].regions[shi_index].regions[i].name);
            }
          } else {
            //这里和选择市的道理一样
            that.setData({
              qu_index: 0
            });
            for (let i = 0; i < shengshi[sheng_index].regions[shi_index].regions.length; i++) {
              qu.push(shengshi[sheng_index].regions[shi_index].regions[i].name);
            }
          }
        } else {
          //如果这个市里面没有区县，那么把这个市的名字就赋值给qu这个数组
          qu.push(shengshi[sheng_index].regions[shi_index].name);
        }
      } else {
        //如果选择的省里面没有下标为shi_index的市，那么把这个下标的值赋值为0；然后再把选中的该省的所有的市的名字放到shi这个数组中
        that.setData({
          shi_index: 0
        });
        for (let i = 0; i < shengshi[sheng_index].regions.length; i++) {
          shi.push(shengshi[sheng_index].regions[i].name);
        }

      }
    } else {
      //如果该省级没有市，那么就把省的名字作为市和区的名字
      shi.push(shengshi[sheng_index].name);
      qu.push(shengshi[sheng_index].name);
    }

    console.log(sheng);
    console.log(shi);
    console.log(qu);
    //选择成功后把相应的数组赋值给相应的变量
    that.setData({
      sheng: sheng,
      shi: shi,
      qu: qu
    });
    //有时候网络慢，会出现区县选择出现空白，这里是如果出现空白那么执行一次回调
    if (sheng.length == 0 || shi.length == 0 || qu.length == 0) {
      that.jilian();
      console.log('这里执行了回调');
      // console.log();
    }
    console.log(sheng[that.data.sheng_index]);
    console.log(shi[that.data.shi_index]);
    console.log(qu[that.data.qu_index]);
    //把选择的省市区都放到jieguo中
    let jieguo = {
      sheng: sheng[that.data.sheng_index],
      shi: shi[that.data.shi_index],
      qu: qu[that.data.qu_index]
    };

    that.setData({
      jieguo: jieguo
    });

  },
  //滚动选择的时候触发事件
  bindChange: function (e) {
    //这里是获取picker-view内的picker-view-column 当前选择的是第几项

    const val = e.detail.value
    this.setData({
      sheng_index: val[0],
      shi_index: val[1],
      qu_index: val[2]
    })
    this.jilian();
    console.log(val);

    console.log(this.data.jieguo);
  },
  getCurrentPos: function () {
    var _this = this;
    demo.reverseGeocoder({
      success: function (res) {
        console.log(res);
        console.log(JSON.stringify(res));
        console.log(res.result.address_component)
        console.log(_this.data.addOrEdit)
        var currentPOS = res.result.address_component;
        let jieguo = {
          shi: currentPOS.city,
          qu: currentPOS.district,
          sheng: currentPOS.province
        };

        _this.setData({
          jieguo: jieguo
        });
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  unique: function (arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      if (result.indexOf(arr[i]) == -1) {
        result.push(arr[i])
      }
    }
    return result;
  }
})