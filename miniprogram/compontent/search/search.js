// compontent/search/search.js
let keyword = ''  // 输入的关键字
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  externalClasses: [  // 外部传过的样式名称,组件内部无法修改
    'iconfont',
    'icon-sousuo'
  ],
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event) {
      keyword = event.detail.value
    },
    onSearch() {
      this.triggerEvent('search',{
        keyword
      })
    }
  }
})
