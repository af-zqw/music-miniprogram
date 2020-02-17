// compontent/lyric/lyric.js
let lyricHeight = 0 // 一行歌词的高度
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type:Boolean,
      value:false
    },
    lyric: String
  },
  observers: { // 监听器
    lyric(lrc) {
      if (lrc == '暂无歌词/纯音乐') {
        this.setData({
          lrcList: [
            {
              lrc,
              time: 0
            }
          ],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: -1,  // 当前选中歌词的索引
    scrollTop: 0 // scroll-view滚动的高度
  },
  //生命周期函数
  lifetimes: {
    ready() {
      // 在小程序中，所有手机的宽度都是750rpx
      wx.getSystemInfo({  // 获取用户手机信息，里面的宽度单位为px
        success: function(res) {
          // 求成1rpx的大小,换成px,求成一行歌词的高度
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) { // 这个事件为进度条组件播放update事件触发给父组件，再由父组件传递触发,*为一秒触发一次*
      let lrcList = this.data.lrcList
      if(lrcList.length == 0) {
        return
      }
      // 处理播放的时间比最后一句歌词的时间长的情况，让滚动到最后
      if (currentTime > lrcList[lrcList.length - 1].time) {
        if(this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for(let i = 0, len = lrcList.length; i < len; i++) {
        if(currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight  // 滚动的距离
          })
          break // 遍历到最接近的那一条歌词就停止遍历，此时的i也会变化
        }
      }
    },
    _parseLyric(sLyric) { // 处理歌词
      let line = sLyric.split('\n')
      let _lrcList = []
      line.forEach((elem) => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)  // 截取时间
        if (time != null) {
          let lrc = elem.split(time)[1] // 获取歌词
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间转化为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3])/1000
          _lrcList.push({
            time: time2Seconds,
            lrc
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
