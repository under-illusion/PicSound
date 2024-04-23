// app.js
App({
  globalData:{
    is_selected :false,
    song_id:'475072483',
    singer_name:"The Chainsmokers",
    song_name:'Something Just Like This',
    sizeIndex:'1',
    pic_url:'/pages/sources/logo.png',
    remark:'usr remark',
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
})
