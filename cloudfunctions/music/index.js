// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')  //引入中间件

const rp = require('request-promise')

const BASE_URL = 'http://musicapi.xiecheng.live'

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})  // 返回的东西都在ctx.body上

  // 获取歌单列表
  app.router('playlist', async (ctx, next) => {  // 定义playlist路由
    ctx.body = await cloud.database()  // 获取数据库
      .collection('playlist')  // 获取集合
      .skip(event.start)  // 表示从哪一条取，event为小程序调用云函数的参数对象
      .limit(event.count)  // 表示取多少
      .orderBy('createTime', 'desc')  // 排序
      .get()
      .then((res) => {
        return res
      })
  })

  // 获取歌单总数
  app.router('palylistCount', async (ctx, next) => {
    ctx.body = await cloud.database()
      .collection('playlist').count()
  })

  // 获取歌曲列表
  app.router('musiclist', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
    .then((res) => {
      return JSON.parse(res)
    })
  })
  // 获取歌曲播放url
  app.router('musicUrl', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`).then((res) => {
      return res
    })
  })
  // 获取歌曲歌词
  app.router('lyric',async(ctx,next) => {
    ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`).then((res) => {
      return res
    })
  })

  app.router('test1',async(ctx,next) => {
    ctx.body = await rp(`http://api.juheapi.com/japi/toh?key=8eee7be246c9a765fac09342715ea0e3&v=1.0&month=11&day=1`).then((res) => {
      return res
    })
  })

  app.router('test2',async(ctx,next) => {
    ctx.body = await rp('http://api.avatardata.cn/Cook/List?key=46a8adbc3beb4cdaabc2517aa04d75d1&page=2&rows=20').then((res) => {
      return res
    })
  })

  return app.serve()
}