// compontent/musiclist/musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1  // 表示当前点击选中的歌曲id
  },
  pageLifetimes:{  // 组件在页面中的生命周期
    show() {  // 组件在页面中展示的时候调用
      this.setData({
        playingId: parseInt(app.getPlayMusicId())  // 在player组件已经定义了全局播放了id
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event) {  // event参数带有自定义的data-数据
      const musicid = event.currentTarget.dataset.musicid
      const index = event.currentTarget.dataset.index
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${index}`,
      })
    }
  }
})
