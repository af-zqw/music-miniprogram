// pages/profile-bloghistory/profile-bloghistory.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getListByCloudFn()
  },
  _getListByCloudFn() {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'blog',
      data: {
        $url: 'getListByOpenid',
        start: this.data.blogList.length,
        count: 10
      }
    }).then((res) => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      if (!res.result.length) {
        wx.showToast({
          title: '没有更多了哦',
          icon: 'none'
        })
      }
      this.setData({
        blogList:this.data.blogList.concat(res.result)
      })
    })
  },
  goComment(event) {   // 点击卡片进入评论界面
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
    })
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
    this.setData({  // 先清空
      blogList: []
    })
    this._getListByCloudFn()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getListByCloudFn()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    // 分享需要外面的按钮绑定open-type来触发
    let blogObj = event.target.dataset.blog
    let text = blogObj.content
    if (text.length > 10) {
      text = text.substring(0, 10) + '...'
    }
    return {
      title: `分享动态：${text}`,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`
    }
  }
})