// pages/blog/blog.js
let keyword = ''  // 搜索关键字
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false, // 控制底部弹出是否显示
    blogList: []
  },
  // 发布
  onPublish() {
    wx.getSetting({  // 获取用户配置
      success:(res) => {
        if(res.authSetting['scope.userInfo']) {  // 判断用户是否受权
          wx.getUserInfo({  // 如果有授权就获取用户的信息
            success:(res) => {
              this.onLoginsuccess({
                detail: res.userInfo
              })
            }
          })
        } else {  // 如果没授权的话显示底部弹窗让用户受权
          this.setData({
            modalShow: true
          })
        }
      }
    })
  },
  onLoginsuccess(event) {  // 获取用户信息并跳转到编辑博客的页面
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },
  onLoginfail() {
    wx.showModal({
      title: '授权用户才能发布',
      content: '',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()  // 获取博客列表,通过云函数调用数据库

    // 通过小程序端调用数据库，数据库的默认权限是只有创建者者可读写
    // const db = wx.cloud.database()
    // db.collection('blog').orderBy('createTime','desc').get().then((res) => {
    //   const data = res.data
    //   for(let i = 0, len = data.length; i < len; i++) {
    //     data[i].createTime = data[i].createTime.toString()
    //   }
    //   this.setData({
    //     blogList: data
    //   })
    // })
  },

  _loadBlogList(start=0) {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'list',
        start: start,
        count: 10,
        keyword: keyword
      }
    }).then((res) => {
      wx.hideLoading()
      wx.stopPullDownRefresh()  // 停止下拉刷新
      if(!res.result.length) {
        wx.showToast({
          title: '没有更多了哦',
          icon: 'none'
        })
      }
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
    })
  },

  goComment(event) {   // 点击卡片进入评论界面
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
    })
  },

  onSearch(event) {  // 搜索事件，由搜索组件传递过来的
    keyword = event.detail.keyword
    this.setData({
      blogList: []
    })
    this._loadBlogList()
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
    this._loadBlogList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList(this.data.blogList.length)  // 触底再加载
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    // 分享需要外面的按钮绑定open-type来触发
    let blogObj = event.target.dataset.blog
    let text = blogObj.content
    if(text.length > 10) {
      text = text.substring(0,10) + '...'
    }
    return {
      title: `分享动态：${text}`,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`
    }
  }
})