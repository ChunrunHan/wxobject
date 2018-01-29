// pages/rating/index.js
const $ = require('../../utils/utils');
const api = require('../../utils/api');
const app = getApp();

Page({
    data: {
        osshost: app.ossHost,
        goodsStart: [true, true, true, true, true],
        sellerStart: [true, true, true, true, true],
        sellerScore: 5,
        goodsScore: 5,
        files:[]
    },
    onLoad: function (options) {
        $.setTitle('评价')
        var orderInfo = JSON.parse(wx.getStorageSync('orderInfo'))
        this.setData({
            orderInfo
        })
        console.log(orderInfo)

    },
    setStart: function (e) {
        let index = e.target.dataset.index + 1
        let type = e.target.dataset.type
        let start = [false, false, false, false, false]
        start.fill(true, 0, index)
        if(type == 1){
            let goodsStart = start
            this.setData({
                goodsStart,
                goodsScore: index
            })
        }else {
            let sellerStart = start
            this.setData({
                sellerStart,
                sellerScore: index
            })
        }
    },
    addRating: function () {
        var _this = this;
        let url = api.postRating()
        // if(!_this.data.files.length){
        //   $.alert('添加一张商品图片吧~');
        //   return;
        // }
        var newImg = [];
        var path = _this.data.files;
        console.log(JSON.stringify(path));

        for (var i = 0; i < path.length; i++) {
          console.log(path[i].newImg)
          newImg.push(path[i].newImg);
        }
        var imgsPath = newImg.join(":");
        console.log(imgsPath);
        let obj = {
            orderId: this.data.orderInfo.id,
            sellerId: this.data.orderInfo.seller.id,
            sellerScore: this.data.sellerScore,
            sellerComment: this.data.sellerComment || '',
            goodsRatingList:[
                {
                    id: this.data.orderInfo.goods.id,
                    score: this.data.goodsScore,
                    comment: this.data.goodsComment || '',
                    images: imgsPath
                }
            ]
        };

        $.post(url, obj).then(function (res) {
          if (res.statusCode == 200){
            if (res.data.code == 0) {
              $.confirm('评价完成', function () {
                wx.navigateBack({
                  delta: 1
                })
              }, function () {
                wx.navigateBack({
                  delta: 1
                })
              })
            } else {
              $.alert(res.data.message || '评价失败')
            }
          } else {
            $.statusHandler(res.statusCode)
          }
           
            console.log(res)
        }).catch(function (err) {
            $.alert('评价失败')
            console.log(err)
        });
        console.log(obj)
    },
    sellerComment: function (e) {
        let sellerComment = e.detail.value
        this.setData({
            sellerComment
        })
    },
    goodsComment: function (e) {
        let goodsComment = e.detail.value
        this.setData({
            goodsComment
        })
    },
    // 添加图片
    chooseImage: function (e) {
      var _this = this;
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          console.log(res);
          var tempFilePaths = res.tempFiles[0].path;
          var filesize = res.tempFiles[0].size;
          console.log(filesize);
          var maxsize = 500 * 1024;
          console.log(filesize * 1024)
          if (filesize > maxsize) {
            $.alert('图片不能大于500KB');
          } else {
            wx.showLoading();
            $.ossUpload(tempFilePaths).then(function (res) {
              wx.hideLoading()
              console.log(res);
              if (res.statusCode == 200) {
                wx.showToast({
                  title: '上传成功',
                });
                console.log(res.filename);
                var img = {
                  oldImg: tempFilePaths,
                  newImg: res.filename
                }
                _this.setData({
                  files: _this.data.files.concat(img)
                })
              } else {
                $.statusHandler(res.statusCode)
              }
            }).catch(function () {
              wx.hideLoading()

            })
          }
          console.log(res)

        }
      })
    },
    // 显示图片
    previewImage: function (e) {
      var imgs = this.data.files;
      console.log(this.data.files)
      var showImg = [];
      for (var i = 0; i < imgs.length; i++) {
        console.log(imgs[i].oldImg)
        showImg.push(imgs[i].oldImg);
      }
      console.log(showImg);
      wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: showImg // 需要预览的图片http链接列表
      })
    },
    //  删除图片
    delImage: function (e) {
      var that = this;
      console.log(e.currentTarget.id);
      console.log(e.currentTarget.dataset.name);
      var index = e.currentTarget.id;
      var delfilename = e.currentTarget.dataset.name;
      wx.showModal({
        title: '提示',
        content: "确定删除该照片",
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            var bucket = app.bucket;
            var delfile = [{
              bucket: bucket,
              object: delfilename
            }]
            var urlBase = app.urlBase;
            var url = urlBase + '/mall/oss/delete/wx_lpqd';
            $.post(url, delfile).then(function (res) {
              console.log(JSON.stringify(res));
              if (res.data.code == 0) {
                console.log('删除成功');
                wx.showToast({
                  title: '删除成功',
                })
                console.log(res);

                var files = that.data.files;
                console.log(files);
                files.splice(index, 1);
                that.setData({
                  files: files
                });

              } else {
                wx.showToast({
                  title: '删除失败',
                  image: '../../img/alert.png',
                  duration: 2000
                })
              }


            }).catch(function (err) {
              console.log('oss单个文件删除', err)
              if (err.errMsg == "request: fail timeout") {
                wx.showToast({
                  title: '删除请求超时',
                  image: '../../img/alert.png',
                  duration: 2000
                })
              } else {
                wx.showToast({
                  title: '删除失败',
                  image: '../../img/alert.png',
                  duration: 2000
                })
              }


            })

          } else if (res.cancel) {
            console.log('用户点击取消')

          }
        }
      });
    }
})