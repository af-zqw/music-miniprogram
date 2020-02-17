// compontent/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {  // props
    playlist: {
      type: Object
    }
  },
  observers: {  // 监听器
    ['playlist.playCount'](count) {  // 监听对象的属性
      this.setData({
        _count: this._tranNumber(count, 2)
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _count: 0  // 处理后的播放数量
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _tranNumber(num,point) {  // 第二个参数为保留几位小数
      let numStr = num.toString().split('.')[0]  // 拿到整数部分,舍弃小数部分
      if(numStr.length < 6) {  // 小于十万直接返回
        return numStr
      }else if(numStr.length >=6 && numStr.length <=8){  // 转化为万单位
        let decimal = numStr.substring(numStr.length - 4,numStr.length - 4 + point)
        return parseFloat(parseInt(num/10000) + '.' + decimal) + '万'
      }else if(numStr.length > 8) {
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'
      }
    },
    goToMusicList() {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
      })
    }
  }
})
