import {NextFunction, Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {User} from "../types/express";

export const whiteListedEndpoints = [
  "/auth/login",
  "/auth/register"
]

export async function jwtSessionMiddleware(req: Request, res: Response, next: NextFunction) {
  if (whiteListedEndpoints.includes(req.path)) {
    return next()
  }

  const authArray = req.headers.authorization?.split(" ") as any[] || [""]

  if (authArray[0] !== "Bearer" || authArray[3]) {
    return res.status(401).json({
      "message": "Unauthorized"
    })
  } else {
    const decodedData = await jwtVerification(req.headers.authorization?.split(" ")[1] as string).catch((e) => {
      res.status(401).json({
        "message": "Unauthorized"
      })
    })


    req.user = decodedData as User
    next()
  }
}

export async function jwtVerification(jwtHash: string): Promise<jwt.JwtPayload> {
  return new Promise((resolve, reject) => {
    try {
      const data = jwt.verify(jwtHash, process.env.JWTSECRET as string) as jwt.JwtPayload
      if (data.iat && data.exp && data._id && data.username && data.email) {
        resolve(data)
      } else {
        reject("NotValid")
      }
    } catch (err) {
      reject(err)
    }
  })
}