// GLOBAL IMPORTS
import express, {Request, Response} from "express";
import multer from "multer";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";

// LOCAL IMPORTS
import models from "../../db/models";
import {writeFile} from "../../misc/files";

const router = express.Router()
const upload = multer()
const userModel = models["userModel"]
const addressModel = models["addressModel"]

router.post('/login', async (req: Request, res: Response) => {
  const {
    username,
    password
  } = req.body;

  const foundUser = await userModel.findOne({username})
  if (!foundUser) {
    return res.status(404).json({
      "message": "Username or password is wrong."
    })
  }

  const passwordCheck = await argon2.verify(foundUser?.password, password)

  if (!passwordCheck) {
    return res.status(404).json({
      "message": "Username or password is wrong."
    })
  } else {
    const objectifiedData = foundUser.toObject()
    delete objectifiedData.password

    const token = jwt.sign(objectifiedData, process.env.JWTSECRET as string, { expiresIn: '2d' });

    res.json({
      token,
      timestamp: Date.now()
    })
  }
})

router.post('/register', upload.single('avatar'), async (req: Request, res: Response) => {
  const {
    username,
    password,
    email,
    age,
    gender,
    addresses
  } = req.body;

  const userCheck = await userModel.findOne({username})

  if (userCheck) {
    return res.status(422).json({
      "message": "A user with that username already exists."
    })
  }

  const fileExtension = req.file?.originalname.split(".").pop()

  const user = userModel({
    username,
    password: await argon2.hash(password),
    email,
    age,
    gender,
    profileImageExtension: fileExtension
  })

  await writeFile(user._id + "." + req.file?.originalname.split(".").pop(), "assets/profile_images/", req.file?.buffer as Buffer)

  const userResult = await user.save()

  const addressResult = await addressModel.insertMany(JSON.parse(addresses).map((value: string) => {
    return {
      userId: user._id,
      address: value
    }
  }))

  res.json({
    userResult,
    addresses: addressResult
  })
})

router.get('/me', async (req: Request, res: Response) => {
  res.json(req.user)
})

export default router;