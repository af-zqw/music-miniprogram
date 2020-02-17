// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const  TcbRouter = require('tcb-router')
const db = cloud.database()
const blogCollection = db.collection('blog')

const MAX_LIMIT = 100 // 云函数查询数据库一次最多能查询一百条
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  // 获取博客列表
  app.router('list', async (ctx, next) => {
    const keyword = event.keyword
    let w = {}
    if(keyword.trim() != '') {  // 定义搜索规则
      w = {
        content: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      }
    }

    let blogList = await blogCollection.where(w)
    .skip(event.start)
    .limit(event.count)
    .orderBy('createTime','desc')
    .get().then((res) => {
      return res.data
    })
    ctx.body = blogList 
  })
  // 博客详情
  app.router('detail',async(ctx,next) => {
    let blogId = event.blogId
    // 获取博客内容，详情
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })
    // 查询相应评论
    const countReslut = await blogCollection.count() // 获取集合总数对象
    const total = countReslut.total  // 获取真正number集合总数
    let commentList = {
      data: []
    }
    if(total > 0) {
      // 计算查询的次数
      const batchTimes = Math.ceil(total/MAX_LIMIT)
      const tasks = []  // 存放promise对象
      for(let i = 0; i < batchTimes; i++) {
        let promise = db.collection('blog-comment')
                      .skip(i * MAX_LIMIT)
                      .limit(MAX_LIMIT)
                      .where({
                        blogId
                      })
                      .orderBy('createTime','desc')
                      .get()
        tasks.push(promise)
      }
      if(tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc,cur) => {
          return {
            data: acc.data.content(cur.data)
          }
        })
      }
    }
    ctx.body = {
      commentList,
      detail
    }
  })

  // 获取自己发布的博客
  const wxContext = cloud.getWXContext()  // 获取微信上上文
  app.router('getListByOpenid',async(ctx,next) => {
    ctx.body = await blogCollection.where({
      _openid:wxContext.OPENID
    }).skip(event.start)
      .limit(event.count)
      .orderBy('createTime','desc')
      .get()
      .then((res) => {
        return res.data
      })
  })

  return app.serve()
}