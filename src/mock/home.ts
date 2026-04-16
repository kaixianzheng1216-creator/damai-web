// @ts-expect-error mockjs has no type declarations
import Mock from 'mockjs'

const { Random } = Mock

const generateEvents = (count: number, category: string) => {
  const events = []

  for (let i = 0; i < count; i++) {
    events.push({
      id: Random.integer(1000, 9999),
      title: Random.ctitle(5, 15) + ' ' + category,
      coverUrl: `https://placehold.jp/300x400.png?text=${encodeURIComponent(category + (i + 1))}`,
      venue: Random.city() + '体育中心',
      date: Random.date('yyyy.MM.dd') + ' ' + Random.time('HH:mm'),
      priceStr: `¥${Random.integer(100, 1000)}起`,
      status: Random.pick(['售票中', '缺货登记', '预售']),
      category: category,
    })
  }

  return events
}

export default [
  {
    url: '/api/home/data',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          banners: [
            {
              id: 1,
              imageUrl: 'https://placehold.jp/1200x300.png?text=Banner1',
              linkUrl: '/',
              title: 'Banner 1',
            },
            {
              id: 2,
              imageUrl: 'https://placehold.jp/1200x300.png?text=Banner2',
              linkUrl: '/',
              title: 'Banner 2',
            },
            {
              id: 3,
              imageUrl: 'https://placehold.jp/1200x300.png?text=Banner3',
              linkUrl: '/',
              title: 'Banner 3',
            },
          ],
          categories: [
            { id: 1, name: '演唱会', icon: 'Mic2', linkUrl: '/category/concert' },
            { id: 2, name: '话剧歌剧', icon: 'Drama', linkUrl: '/category/drama' },
            { id: 3, name: '体育', icon: 'Trophy', linkUrl: '/category/sports' },
            { id: 4, name: '儿童亲子', icon: 'Baby', linkUrl: '/category/kids' },
            { id: 5, name: '展览休闲', icon: 'Image', linkUrl: '/category/exhibition' },
            { id: 6, name: '音乐会', icon: 'Music', linkUrl: '/category/music' },
            { id: 7, name: '曲苑杂坛', icon: 'Laugh', linkUrl: '/category/comedy' },
            { id: 8, name: '舞蹈芭蕾', icon: 'Footprints', linkUrl: '/category/dance' },
            { id: 9, name: '二次元', icon: 'Ghost', linkUrl: '/category/anime' },
            { id: 10, name: '旅游展览', icon: 'Tent', linkUrl: '/category/travel' },
          ],
          concerts: generateEvents(6, '演唱会'),
          dramas: generateEvents(6, '话剧歌剧'),
          sports: generateEvents(6, '体育比赛'),
          kids: generateEvents(6, '儿童亲子'),
        },
      }
    },
  },
] as any[]
