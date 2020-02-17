const MAX_WORDS_NUM = 140 // 输入字数最大值
const MAX_IMG_NUM = 9 // 选择图片的最大次数
let content = ''  // 表示用户输入的内容
let avatarUrl = ''  // 用户头像
let nickName = ''  // 用户头像
const db = wx.cloud.database() // 获取云数据库对象
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0, // 表示输入的字数
    footerBottom: 0, // 表示footer的bottom值
    images: [], // 选择了的图片
    selectphoto: true // 添加图片元素是否显示
  },
  onInput(event) {
    let wordsNum = event.detail.value.length
    if(wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  onFocus(event) { // 获取焦点,event中有键盘的高度
    this.setData({
      footerBottom:event.detail.height  // 设置底下footer的bottom值
    })
  },
  onBlur() { //失去焦点
    this.setData({
      footerBottom: 0
    })
  },
  onChooseImage() {  //选择图片
    let max = MAX_IMG_NUM - this.data.images.length //还能选择多少张
    wx.chooseImage({
      count: max,
      sizeType: ['original','compressed'],
      sourceType: ['album','camera'],
      success: (res) => {
        this.setData({
          images:this.data.images.concat(res.tempFilePaths)
        })
        // 选择一次还能选择几张
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectphoto: max <= 0 ? false :true  // 隐藏添加按钮
        })
      },
    })
  },
  onDelImage(event) { // 删除已选图片
    this.data.images.splice(event.target.dataset.index,1)
    this.setData({
      images: this.data.images,
      selectphoto:true
    })
  },
  onPreviewImage(event) {  // 点击图片预览
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },
  send() {
    if(content.trim() == '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }
    wx.showLoading({
      title: '发布中...',
      mask: true
    })
    // 图片上传
    let promiseArr = []
    let fileIds = []  // 图片路径数组
    for(let i=0, len = this.data.images.length; i < len; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        // 获取到图片的拓展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({  // 存储到云存储的方法，一次只能上传一张图片
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix, // 存储到云存储的路径
          filePath: item,  // 图片的临时路径，也就是data里面的images的数组项
          success: (res) => { // 上传成功
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    // 存到云数据库
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          content,
          img: fileIds,
          avatarUrl: avatarUrl,
          nickName: nickName,
          createTime: db.serverDate()  // 服务端的时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        wx.navigateBack()  // 返回到上一个页面
        // 获取页面的方法，获取到是一个数组，顺序是按路由的记录来的，获取到可以执行别的页面的方法
        const pages = getCurrentPages()
        const prevPage = pages[pages.length -2]  // -2是上一个页面，-1是当前页面
        prevPage.onPullDownRefresh()
      })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    avatarUrl = options.avatarUrl
    nickName = options.nickName
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