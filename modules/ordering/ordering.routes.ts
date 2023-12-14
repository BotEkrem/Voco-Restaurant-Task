// GLOBAL IMPORTS
import express, {Request, Response} from "express";

// LOCAL IMPORTS
import models from "../../db/models";

const router = express.Router()
const orderModel = models["orderModel"]
const addressModel = models["addressModel"]
const restaurantModel = models["restaurantModel"]
const menuModel = models["menuModel"]
const voteModel = models["voteModel"]

router.get('/my-orders', async (req: Request, res: Response) => {
  const orderList = await orderModel.find({ userId: req.user?._id })

  res.json(orderList)
})

router.post('/order', async (req: Request, res: Response) => {
  const {
    addressId,
    menuId
  } = req.body;

  const addressCheck = await addressModel.findOne({_id: addressId, userId: req.user?._id})

  if (!addressCheck) {
    return res.status(404).json({
      message: "Given Address not found."
    })
  }

  const menuCheck = await menuModel.findById(menuId)

  if (!menuCheck) {
    return res.status(404).json({
      message: "Given Menu not found."
    })
  }

  const order = orderModel({
    userId: req.user?._id,
    restaurantId: menuCheck.restaurantId,
    addressId,
    menuId,
    date: new Date()
  })

  const orderResult = await order.save()

  res.json(orderResult)
})

router.get('/my-votes', async (req: Request, res: Response) => {
  const voteList = await voteModel.find({ userId: req.user?._id })

  res.json(voteList)
})

router.post('/vote', async (req: Request, res: Response) => {
  const {
    restaurantId,
    description,
    points
  } = req.body;

  const orderCheck = await orderModel.find({ restaurantId, userId: req.user?._id })
  const voteCheck = await voteModel.find({ restaurantId, userId: req.user?._id })

  if (orderCheck.length == voteCheck.length) {
    return res.status(400).json({
      message: "You can not vote more this restaurant until your next ordering."
    })
  }

  const restaurantCheck = await restaurantModel.findById(restaurantId)

  if (!restaurantCheck) {
    return res.status(404).json({
      message: "Given Restaurant not found."
    })
  }

  const vote = voteModel({
    userId: req.user?._id,
    restaurantId,
    description,
    points,
    date: new Date()
  })

  const voteResult = await vote.save()

  res.json(voteResult)
})

router.get('/my-addresses', async (req: Request, res: Response) => {
  const addressList = await addressModel.find({ userId: req.user?._id })

  res.json(addressList)
})

router.post('/create-address', async (req: Request, res: Response) => {
  const {
    address
  } = req.body;

  const _address = addressModel({
    userId: req.user?._id,
    address
  })

  const addressResult = await _address.save()

  res.json(addressResult)
})

router.delete('/delete-address', async (req: Request, res: Response) => {
  const {
    addressId
  } = req.query;

  const addressResult = await addressModel.deleteOne({ _id: addressId })

  res.json(addressResult)
})
export default router;