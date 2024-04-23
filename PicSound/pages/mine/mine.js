const app = getApp()
Page({
  jump:function () {
    app.globalData.is_selected = false
    wx.navigateTo({
      url: '../display/display',
    })
  }
})