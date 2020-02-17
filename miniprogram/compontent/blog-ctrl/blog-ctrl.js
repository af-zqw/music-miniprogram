// compontent/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()  //获取数据库对象
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  // 组件无法使用最外面的全局样式，需要通过父组件传递过来
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    loginShow: false, // 微信授权弹出是否显示
    modalShow: false, // 控制底部评论弹出是否显示
    content: ''  // 输入的内容
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      // 先判断用户是否授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modalShow: true
                })
              }
            })
          } else {
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },
    onLoginsuccess(event) {  // 授权成功
      userInfo = event.detail
      this.setData({
        loginShow: false
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },
    onLoginfail() {  // 授权失败
      wx.showModal({
        title: '授权用户才能评价',
        content: '',
      })
    },
    onSend(event) {  // 发送评论
      console.log(event)
      let formId = event.detail.formId
      // 通过form的提交事件的event对象可以直接拿到输入框的内容
      let content = event.detail.value.content
      if (content.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask: true
      })
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res) => {
        //推送模板消息
        wx.cloud.callFunction({
          name: 'sendMessage',
          data: {
            content,
            formId,
            blogId: this.properties.blogId
          }
        }).then((res) => {
          console.log(res)
        })

        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow: false,
          content: ''
        })

        // 父元素刷新评论页面
        this.triggerEvent('refreshCommentList')
      })
    }
  }
})
