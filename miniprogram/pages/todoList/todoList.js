const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue:'',
    date: '' + (new Date().getMonth()+1) + '月' + new Date().getDate()+'日',
    notOkList:[],
    okList:[],
    allList:[]
  },
  setInput:function(e) {
    this.setData({
      inputValue:e.detail.value
    })
  },

  addTodo:function() {  //添加任务
    wx.showLoading({
      title: '添加中',
    })
    db.collection('todoList').add({
      data:{
        content:this.data.inputValue,
        status:0,
        createDate:this.data.date,
        complateDate:''
      }
    }).then((res) => {
      this.setData({
        inputValue: ''
      })
      this.getTodoListInfo()
      wx.hideLoading();
    }).catch(() => {
      wx.hideLoading();
    })
  },

  complateTodo:function(event) { //完成任务，通过把改变status
    let todoID=event.target.dataset.todoid
    wx.showLoading({
      title: '加载中',
    })
    db.collection('todoList').doc(todoID).update({
      data:{
        status:1,
        complateDate:this.data.date
      }
    }).then((res) => {
      console.log(res)
      this.getTodoListInfo();
      wx.hideLoading();
    }).catch(() => {
      wx.hideLoading();
    })
  },

  delTodo:function(event) { //删除任务
    let todoID = event.target.dataset.todoid
    wx.showActionSheet({ //出现按钮框
      itemList: ['确定删除','取消删除'],
      success:res => {
        if(res.tapIndex==0){//判断是否选择第一个按钮
          wx.showLoading({
            title: '删除中',
          })
          db.collection('todoList').doc(todoID).remove().then((res) => {
            console.log(res)
            this.getTodoListInfo();
            wx.hideLoading();
          }).catch(() => {
            wx.hideLoading();
          })
        }else{
          return
        }
      }
    })
  },

  getTodoListInfo:function() { //获取数据，每次改变和页面加载都去执行这个函数
    db.collection('todoList').where({
      status:0
    }).get().then((res) => {
      this.setData({
        notOkList:res.data
      })
    })
    db.collection('todoList').where({
      status:1
    }).get().then((res) => {
      this.setData({
        okList:res.data
      })
    })
    db.collection('todoList').get().then((res) => {
      this.setData({
        allList:res.data
      })
    })
  },
    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.getTodoListInfo();
    wx.hideLoading();
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