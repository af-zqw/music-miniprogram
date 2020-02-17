//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {  // 全局属性
      playingMusicId: -1,  // 播放的歌曲id
      openid: -1
    }
    this.getOpenid()  // 获取openid
  },
  setPlayMusicId(musicId) {
    this.globalData.playingMusicId = musicId
  },
  getPlayMusicId() {
    return this.globalData.playingMusicId
  },
  getOpenid() {
    wx.cloud.callFunction({
      name:'login'
    }).then((res) => {
      const openid = res.result.openid
      this.globalData.openid = res.result.openid
      if (wx.getStorageSync(openid) == '') {
        wx.setStorageSync(openid, [])
      }
    })
  }
})
