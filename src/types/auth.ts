export interface User {
  id: number
  username: string
  email: string
  avatar: string
  token: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}
