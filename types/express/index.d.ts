declare module 'express-serve-static-core' {
  interface Request {
    user?: User
  }
}

export interface User {
  _id: string,
  username: string,
  email: string,
  age: number,
  gender: string,
  profileImageExtension: string,
  __v: number,
  iat: number,
  exp: number
}