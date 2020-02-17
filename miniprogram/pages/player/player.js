// pages/player/player.js
let musiclist = []
// 表示当前播放的歌曲的index
let nowPlayingIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
// 定义全局app，相当于app.js访问里面的方法
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, // 表示当前是否在播放
    isLyricShow:false, // 表示歌词是否显示
    lyric: '', // 歌词
    isSame: false // 表示是否为同一首歌，退出去再点回来
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')  // 应该用同步的获取存储方法，获取完才能执行下一步操作
    this._loadMusicDetail(options.musicId)
  },

  _loadMusicDetail(musicId) {  // 获取具体歌曲信息并播放
    if(musicId == app.getPlayMusicId()) {  // 把重新点进来的id和老id比较
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    if(!this.data.isSame) {
      backgroundAudioManager.stop() // 加载之前先停止音乐
    }
    let music = musiclist[nowPlayingIndex]  // 通过下标到本地存储的歌曲列表获取歌曲

    wx.setNavigationBarTitle({  // 设置顶部栏标题
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl,  // 背景图片
      isPlaying: false
    })
    app.setPlayMusicId(musicId)  // 设置全局音乐播放id
    wx.showLoading({
      title: `${music.name}加载中`
    })
    wx.cloud.callFunction({
      name:'music',
      data: {
        $url: 'musicUrl',
        musicId
      }
    }).then((res) => {
      wx.hideLoading()
      let result = JSON.parse(res.result)
      if (!result.data[0].url) {
        wx.showToast({
          title: '该音乐暂时无法播放',
        })
        return
      }
      if(!this.data.isSame) {
        // 设置后台播放器属性
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name

        // 保存播放历史
        this.savePlayHistory()
      }
      this.setData({
        isPlaying: true
      })

      //加载歌词
      wx.cloud.callFunction({
        name:'music',
        data: {
          $url: 'lyric',
          musicId
        }
      }).then((res) => {
        let lyric = '暂无歌词/纯音乐'
        const lrc = JSON.parse(res.result).lrc
        if(lrc) {
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },
  togglePlaying() {
    if(this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  onPrev() {
    nowPlayingIndex--
    if(nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext() {
    nowPlayingIndex++
    if(nowPlayingIndex == musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onChangeLyricShow() {  // 切换歌词和唱片的显示
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  timeUpdate(event) {  // 往歌词组件传递变量
    // 为组件的选择器，可以用class作为选择器，执行这个组件的update的事件,传递参数
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  onPlay() {  // 由进度条组件传递过来的事件
    this.setData({
      isPlaying: true
    })
  },
  onPause() {
    this.setData({
      isPlaying: false
    })
  },

  // 保存播放历史
  savePlayHistory() {
    // 当前正在播放的歌曲
    const music = musiclist[nowPlayingIndex]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)  // 获取存储在本地的播放历史
    let bHave = false
    for(let i = 0,len = history.length; i < len; i++) {
      if(history[i].id == music.id) {
        bHave = true
        break
      }
    }
    if(!bHave) {
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history,
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