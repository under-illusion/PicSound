const app = getApp()
Page({
  data:{
    imageUrl:'',
    hintText:'Insert Your Photo',
    sizes: ['12.7cm*8.9cm（5 inches）', '15.2cm*10.2cm（6 inches）', '17.8cm*12.7cm（7 inches）', '25.4cm*20.3cm（10 inches）'],
    selectedSizeIndex: -1,

    music_name:'',
    remark:'',
  },

  onLoad:function () {
    this.setData({
      remark:app.globalData.remark,
      selectedSizeIndex:app.globalData.sizeIndex,
      imageUrl:app.globalData.pic_url,
      music_name:app.globalData.song_name
    })
  },

  chooseImage: function() {
    var that = this;
    wx.chooseMedia({
      count:1,
      mediaType:['image'],
      maxDuration:30,
      camera:'back',
      success(res)
      {
        console.log(res.tempFiles[0].size)
        console.log(res.tempFiles[0].tempFilePath)
        that.setData({
          imageUrl : res.tempFiles[0].tempFilePath,
          hintText : '',
        });
        app.globalData.pic_url = that.data.imageUrl
        wx.showToast({
          title: 'upload sucess!!!',
          icon:'loading',
          duration:500
        })
      }
    })
  },

  deleteImg: function (e) {
    var that = this;
    wx.showModal({
      title: 'Tip',
      content: 'Are you sure to delete the photo?',
      complete: (res) => {
        if (res.confirm) {
          console.log('delete!!!');
        }
    
        if (res.cancel) {
          console.log("cancel!!!");
          return false;
        }
        that.setData({
          hintText : 'Insert Your Photo',
          imageUrl : ''
        });
      }
    })
  },

  previewImg: function () {
    var photo = this.data.imageUrl;
    console.log(photo)
    wx.previewImage({
      current : photo,
      urls: photo
    })
  },

  bindPickerChange: function (e) {
    this.setData({
      selectedSizeIndex: e.detail.value
    })
  },

  remarkInputAction:function (options) {
    var that = this;
    that.setData({
      remark : options.detail.value
    })
    app.globalData.remark = that.data.remark
    console.log(this.data.remark)
  },


  button_upload:function () {
    var that = this;
    app.globalData.sizeIndex = that.data.selectedSizeIndex
    wx.switchTab({
      url: '../mine/mine',
      success:function () {
        wx.showToast({
          title: 'success !!!',
          icon: 'success',
          duration:2000
        });
      }
    })

  },

  musicChoose:function () {
    wx.navigateTo({
      url: '../music/music',
    })
  }
});