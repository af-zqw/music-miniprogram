// compontent/progress-bar/progress-bar.js
let movableAreaWidth = 0  // 整个滑动区域的宽度
let movableViewWidth = 0  // 滑块的宽度
const backgroundAudioManager = wx.getBackgroundAudioManager() // 获取背景音乐管理器
let currentSec = -1  // 当前的秒数
let duration = 0 //表示很当前歌曲的总时长,以秒为单位
let isMoving = false //表示当前进度条是否在拖拽
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',  //当前播放了多少
      totalTime: '00:00'  // 歌曲总时长
    },
    movableDis: 0, //滑块在轴移动的距离
    progress: 0  // 进度条进行了多少
  },
  //生命周期函数
  lifetimes: {
    ready() {  // dom渲染完成
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      } 
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {  // 滑块移动
      if(event.detail.source == 'touch') {  // 表示拖动时产生
      // 不用setData，属于临时存储
        this.data.progress = event.detail.x / (movableAreaWidth-movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchEnd() { // 滑块停止移动
      // 跳转到百分之多少
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      const currentTimeFmt = this._dateFormat(Math.floor(duration * this.data.progress / 100))  // 设置当前播放时间
      this.setData({
        progress:this.data.progress,
        movableDis:this.data.movableDis,
        ['showTime.currentTime']:currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      isMoving = false
    },
    _getMovableDis() {  // 获取宽度
      const query = this.createSelectorQuery() // 声明选择器对象
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },
    _bindBGMEvent() {  // 背景音乐管理器的处理事件
      backgroundAudioManager.onPlay(() => {  // 播放
        console.log('play')
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(() => {  // 停止
        console.log('stop')
      })
      backgroundAudioManager.onPause(() => {  // 暂停
        console.log('pause')
        this.triggerEvent('musicPause')
      })
      backgroundAudioManager.onWaiting(() => {  // 音频加载中
        console.log('waiting')
      })
      backgroundAudioManager.onCanplay(() => {  // 音乐可以播放,类似于初始化
        console.log('onCanplay')
        if(typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          },1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {  // 音乐播放进度发生变化,会不断执行
        if(!isMoving) {  // 拖拽时不执行下来的操作
          const currentTime = backgroundAudioManager.currentTime  // 当前播放了多少，单位秒
          const currentTimeFmt = this._dateFormat(currentTime) // 格式化时间
          const duration = backgroundAudioManager.duration  // 获取歌曲总时长

          if (currentTime.toString().split('.')[0] != currentSec) {  // 每一秒才去setData一次，优化性能
            this.setData({
              // 设置滑块滑动
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              // 设置进度条的百分比数
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = currentTime.toString().split('.')[0]
            // 联动歌词，传递变量
            this.triggerEvent('timeUpdate',{
              currentTime  // 传递当前播放了多少了秒
            })
          }
        }
      })
      backgroundAudioManager.onEnded(() => {  // 播放完成
        this.triggerEvent('musicEnd')  // 向父组件触发事件
      })
      backgroundAudioManager.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
        wx.showToast({
          title: '错误:' + res.errMsg,
        })
      })
    },
    _setTime() {  // 获取歌曲总时长，单位秒
      duration = backgroundAudioManager.duration
      const durationFmt = this._dateFormat(duration)
      this.setData({
        // 单独给对象的属性赋值
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _dateFormat(sec) {  // 格式化时间
      const min = Math.floor(sec/60)
      const second = Math.floor(sec%60)
      return {
        'min':this._parse0(min),
        'sec': this._parse0(second)
      }
    },
    _parse0(sec) {  // 补零
      return sec < 10 ? '0' + sec : sec
    }
  }
})
