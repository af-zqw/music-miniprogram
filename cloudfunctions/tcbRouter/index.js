// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')  // 中间件

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})

  app.use(async(ctx, next) => {  // 全局中间件
    ctx.data = {}
    ctx.data.openId = event.userInfo.openId
    await next()
  })

  app.router('music', async(ctx,next) => {  // 调用音乐的路由
    ctx.data.musicName = "数鸭子"
    await next()
  },async (ctx, next) => {
    ctx.data.musicType = "儿歌",
    ctx.body = {
      data: ctx.data
    }
  })

  app.router('movie', async (ctx, next) => {  // 调用音乐的路由
    ctx.data.musicName = "千与千寻"
    await next()
  }, async (ctx, next) => {
    ctx.data.movieType = "动漫",
      ctx.body = {
        data: ctx.data
      }
  })

  return app.serve()
}