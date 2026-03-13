import { MockMethod } from 'vite-plugin-mock'

// 1. 城市列表
const cities = [
  { id: 1, name: '北京', pinyin: 'beijing', is_hot: 1 },
  { id: 2, name: '上海', pinyin: 'shanghai', is_hot: 1 },
  { id: 3, name: '广州', pinyin: 'guangzhou', is_hot: 1 },
  { id: 4, name: '深圳', pinyin: 'shenzhen', is_hot: 1 },
]

// 2. 轮播图
const banners = [
  {
    id: 1,
    image_url:
      'https://img.alicdn.com/imgextra/i4/O1CN01f8nE8v1Xp7W9mG7u6_!!6000000002974-0-tps-1200-480.jpg',
    project_site_id: 101,
  },
  {
    id: 2,
    image_url:
      'https://img.alicdn.com/imgextra/i2/O1CN01pGzU7u1S8jH8H8nE8_!!6000000002203-0-tps-1200-480.jpg',
    project_site_id: 102,
  },
]

// 3. 分类入口
const categories = [
  {
    id: 1,
    name: '演唱会',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
  {
    id: 2,
    name: '话剧歌剧',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
  {
    id: 3,
    name: '体育',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
  {
    id: 4,
    name: '儿童亲子',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
  {
    id: 5,
    name: '展览休闲',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
  {
    id: 6,
    name: '音乐会',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
  {
    id: 7,
    name: '曲艺杂坛',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
  {
    id: 8,
    name: '舞蹈芭蕾',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
  {
    id: 9,
    name: '二次元',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
  {
    id: 10,
    name: '旅游展览',
    icon_url: 'https://img.alicdn.com/tfs/TB1D7v8rVT7gK0jSZFpXXaTkpXa-128-128.png',
  },
]

// 4. 推荐板块
const recommendBlocks = [
  {
    id: 1,
    category_name: '演唱会',
    projects: [
      {
        id: 101,
        title: '2026 DLC 梦想日',
        city: '北京',
        venue: '北京工人体育场',
        price: 588,
        time: '2026.03.28',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
        is_large: true,
      },
      {
        id: 102,
        title: '吴青峰 2026 终焉「吴青峰 1.0」-北京站',
        city: '北京',
        venue: '星光2号厅',
        price: 299,
        time: '2026.03.21',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 103,
        title: '《2026 开山节》(北京 慢谷)',
        city: '北京',
        venue: '檀谷-慢闪公园',
        price: 9.9,
        time: '2026.03.27-03.29',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 104,
        title: '莫文蔚「月亮下的歌」2.0 演唱会-北京站',
        city: '北京',
        venue: '国家体育馆',
        price: 380,
        time: '2026.03.21',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 105,
        title: '孟慧圆「一场 30000 天的游戏」2026北京站',
        city: '北京',
        venue: '星光2号厅',
        price: 380,
        time: '2026.04.18',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 106,
        title: '黄诗扶「入梦」音乐剧',
        city: '北京',
        venue: '北京展览馆剧场',
        price: 180,
        time: '2026.04.30-05.01',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 107,
        title: '李嘉格 2026 「模样」巡演-北京站',
        city: '北京',
        venue: '疆进酒OMNI SPACE',
        price: 288,
        time: '2026.04.11',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
    ],
  },
  {
    id: 2,
    category_name: '话剧歌剧',
    projects: [
      {
        id: 201,
        title: '话剧九人 民国知识分子戏《春逝》',
        city: '北京',
        venue: '国家大剧院',
        price: 120,
        time: '2026.03.28',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
        is_large: true,
      },
      {
        id: 202,
        title: '中国国家话剧院 话剧《四世同堂》',
        city: '北京',
        venue: '北京艺术中心',
        price: 80,
        time: '2026.04.04',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 203,
        title: '2026 歌剧节：国家大剧院制作 瓦格纳歌剧《齐格弗里德》',
        city: '北京',
        venue: '国家大剧院',
        price: 180,
        time: '2026.04.28-05.04',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 204,
        title: '舞剧《咏春》-决战西北风 舞动经典',
        city: '北京',
        venue: '北京艺术中心',
        price: 80,
        time: '2026.04.17-04.19',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 205,
        title: '话剧《洋麻将》',
        city: '北京',
        venue: '北京国际戏剧中心',
        price: 40,
        time: '2026.03.31-04.18',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 206,
        title: '开心麻花爆笑爆笑贺岁大戏《出马》',
        city: '北京',
        venue: '地坛礼堂剧场',
        price: 80,
        time: '2026.03.13-04.12',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 207,
        title: '老舍经典话剧《骆驼祥子》',
        city: '北京',
        venue: '世纪剧院',
        price: 135,
        time: '2026.06.19-06.20',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
    ],
  },
  {
    id: 3,
    category_name: '体育比赛',
    projects: [
      {
        id: 301,
        title: '2025-2026 赛季 CBA 联赛-北京北汽主场',
        city: '北京',
        venue: '国家体育馆',
        price: 50,
        time: '2026.03.15',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
        is_large: true,
      },
      {
        id: 302,
        title: 'THE COLOR RUN 2026 彩色跑-北京站',
        city: '北京',
        venue: '园博园',
        price: 198,
        time: '2026.05.10',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 303,
        title: '2026 The Color Run - 北京站',
        city: '北京',
        venue: '北京园博园',
        price: 198,
        time: '2026.05.10',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 304,
        title: '天津先行者男篮 2025-2026 CBA 赛季',
        city: '天津',
        venue: '天津财经大学体育馆',
        price: 80,
        time: '2026.03.15',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 305,
        title: '斯诺克世界公开赛-玉山',
        city: '玉山',
        venue: '玉山体育馆',
        price: 100,
        time: '2026.03.16',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 306,
        title: '2026 WTT 中国大满贯-北京站',
        city: '北京',
        venue: '首钢园体育馆',
        price: 200,
        time: '2026.09.26',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
      {
        id: 307,
        title: '中超联赛-北京国安主场',
        city: '北京',
        venue: '北京工人体育场',
        price: 120,
        time: '2026.03.28',
        poster:
          'https://img.alicdn.com/bao/uploaded/i2/2251059038/O1CN01pGzU7u1S8jH8H8nE8_!!2251059038.jpg',
      },
    ],
  },
]

export default [
  {
    url: '/api/cities',
    method: 'get',
    response: () => ({ code: 200, data: cities }),
  },
  {
    url: '/api/banners',
    method: 'get',
    response: () => ({ code: 200, data: banners }),
  },
  {
    url: '/api/categories',
    method: 'get',
    response: () => ({ code: 200, data: categories }),
  },
  {
    url: '/api/recommend/blocks',
    method: 'get',
    response: () => ({ code: 200, data: recommendBlocks }),
  },
] as MockMethod[]
