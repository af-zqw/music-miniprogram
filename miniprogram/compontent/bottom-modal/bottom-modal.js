// compontent/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean
  },
  options:{
    styleIsolation: 'apply-shared',// 配置样式穿透，可以使用全局的样式
    multipleSlots: true  // 多个插槽
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose() {  // 关闭弹窗
      this.setData({
        modalShow: false
      })
    }
  }
})
