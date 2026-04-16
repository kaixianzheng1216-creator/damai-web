// @ts-expect-error mockjs has no type declarations
import Mock from 'mockjs'

const { Random } = Mock

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const { username, password } = body

      if (username === 'admin' && password === '123456') {
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: Random.string('upper', 32),
            user: {
              id: 1,
              username: 'admin',
              email: 'admin@damai.com',
              avatar: Random.image('200x200', '#FF6600', '#FFF', 'Avatar'),
              token: Random.string('upper', 32),
            },
          },
        }
      }

      return {
        code: 401,
        message: '用户名或密码错误 (admin/123456)',
        data: null,
      }
    },
  },
  {
    url: '/api/auth/register',
    method: 'post',

    response: () => {
      return {
        code: 200,
        message: '注册成功',
        data: {
          token: Random.string('upper', 32),
          user: {
            id: Random.integer(2, 100),
            username: Random.name(),
            email: Random.email(),
            avatar: Random.image('200x200', '#FF6600', '#FFF', 'Avatar'),
            token: Random.string('upper', 32),
          },
        },
      }
    },
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: '退出成功',
        data: null,
      }
    },
  },
  {
    url: '/api/auth/me',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: '获取成功',
        data: {
          id: 1,
          username: 'admin',
          email: 'admin@damai.com',
          avatar: Random.image('200x200', '#FF6600', '#FFF', 'Avatar'),
          token: Random.string('upper', 32),
        },
      }
    },
  },
] as any[]
