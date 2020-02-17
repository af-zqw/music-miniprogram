// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const rp = require('request-promise')  // 引入插件

const URL = 'http://musicapi.xiecheng.live/personalized'

const db = cloud.database()  //拿到数据库对象

const playlistCollection = db.collection('playlist')  //拿到playlilst表(集合)

const MAX_LIMIT = 100 // 表示每次取一百条

// 云函数入口函数
exports.main = async (event, context) => {
  // const list = await playlistCollection.get()  // 从playlilst表获取数据，为了去重,真正的数据在获取到的对象中的.data中
  const countResult = await playlistCollection.count()  // 获取表数据总数的对象
  const total = countResult.total  // 获取总数
  //获取的次数:
  const bactchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for(let i = 0; i < bactchTimes; i++) {
    //skip表示从哪条数据开始取，limit表示取多少条
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  let list = {
    data: []
  }
  if(tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {  // reduce为叠加，每次两个参数计算后作为下一次计算的参数
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  const playlist = await rp(URL).then((res) => {  // 从接口拿到数据
    return JSON.parse(res).result  //转为对象才能点属性
  })

  const newData = []  //不重复的数据
  for(let i = 0, len1 = playlist.length; i < len1; i++) {   // 去重
    let flag = true
    for(let j = 0, len2 = list.data.length; j < len2; j++) {
      if(playlist[i].id === list.data[j].id) {
         flag = false
         break
      }
    }
    if (flag) {
      newData.push(playlist[i])
    }
  }

  for (let i = 0, len = newData.length; i < len; i++) {
    await playlistCollection.add({  //await,等每一条记录插入完成后才进行下一次循环
      data: {
        ...newData[i],  // 拓展运算符，然后键值对一样简写,把newData[i]的每一个属性赋值给playlist表的每一条记录
        createTime: db.serverDate()  // 获取服务器上的时间
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.log('插入失败')
    })
  }
  return newData.length
}