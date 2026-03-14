import type { MockMethod } from 'vite-plugin-mock'

const mocks: MockMethod[] = [
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body
      if (username === 'admin' && password === '123456') {
        return {
          code: 200,
          message: '登录成功',
          data: {
            id: '1',
            username: 'admin',
            nickname: '管理员',
            avatar: 'https://placehold.co/100x100',
            mobile: '13800138000',
            token: 'mock-token-123456',
          },
        }
      }
      return {
        code: 400,
        message: '用户名或密码错误',
        data: null,
      }
    },
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          id: '1',
          username: 'admin',
          nickname: '管理员',
          avatar: 'https://placehold.co/100x100',
          mobile: '13800138000',
        },
      }
    },
  },
]

export default mocks
