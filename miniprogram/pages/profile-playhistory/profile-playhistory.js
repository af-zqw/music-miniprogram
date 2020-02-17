// pages/profile-playhistory/profile-playhistory.js
const app  = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musicList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const playHistory = wx.getStorageSync(app.globalData.openid)
    console.log(playHistory)
    if(playHistory.length == 0) {
      wx.showModal({
        title: '播放历史为空',
        content: '',
      })
    } else {
      // 把storeage里面存储的musiclist替换成播放历史的列表，里面原本的存储是在外面点击一个歌单，把那个歌单存储到本地，然后在播放页播放的时候，也是按照本地存储的歌单进行操作。
      wx.setStorage({
        key: 'musiclist',
        data: playHistory,
      })
      this.setData({
        musicList: playHistory
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})