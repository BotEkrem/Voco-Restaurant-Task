// GLOBAL IMPORTS
import express, {Request, Response} from "express";
import multer from "multer";

// LOCAL IMPORTS
import models from "../../db/models";
import {writeFile} from "../../misc/files";

const router = express.Router()
const upload = multer()
const restaurantModel = models["restaurantModel"]
const branchModel = models["branchModel"]
const menuModel = models["menuModel"]
const categoryModel = models["categoryModel"]

router.get('/list', async (req: Request, res: Response) => {
  const {
    search,
    longitude,
    latitude
  } = req.query

  const aggsList: any[] = []

  if (latitude && longitude) {
    aggsList.push({
      $geoNear: {
        near: { type: 'Point', coordinates: [ Number(longitude), Number(latitude) ] },
        distanceField: 'addressCoordinates',
        spherical: false,
      }
    })
  }

  aggsList.push(
    {
      $lookup: {
        from: "restaurants",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restaurant"
      }
    },
    {
      $unwind: "$restaurant"
    }
  )

  if (search) {
    const regex = new RegExp(search as string, 'i')
    aggsList.push({
      $match: {$or: [{name: {$regex: regex}}, {"restaurant.name": {$regex: regex}}, {"restaurant.description": {$regex: regex}}]}
    })
  }

  const data = await branchModel.aggregate(aggsList)

  res.json(data)
})

router.get('/my-restaurants', async (req: Request, res: Response) => {
  const restaurantList = await restaurantModel.find({createdBy: req.user?._id})

  res.json(restaurantList)
})

router.post('/create', upload.single('logo'), async (req: Request, res: Response) => {
  const {
    name,
    description,
    categories
  } = req.body;

  const restaurantCheck = await restaurantModel.findOne({name})

  if (restaurantCheck) {
    return res.status(422).json({
      "message": "A restaurant with that name already exists."
    })
  }

  const restaurant = restaurantModel({
    name,
    description,
    logoExtension: req.file?.originalname.split(".").pop(),
    createdBy: req.user?._id
  })

  await writeFile(restaurant._id + "." + req.file?.originalname.split(".").pop(), "assets/restaurant_images/", req.file?.buffer as Buffer)

  const restaurantResult = await restaurant.save()

  const categoryResult = await categoryModel.insertMany(JSON.parse(categories).map((value: string) => {
    return {
      restaurantId: restaurant._id,
      category: value
    }
  }))

  res.json({
    restaurantResult,
    categories: categoryResult
  })
})

router.get('/list-branch', async (req: Request, res: Response) => {
  const {
    restaurantId
  } = req.query;

  const branchList = await branchModel.find({restaurantId})

  res.json(branchList)
})

router.post('/create-branch', async (req: Request, res: Response) => {
  const {
    restaurantId,
    name,
    addressCity,
    addressCounty,
    addressDescription,
    addressLatitude,
    addressLongitude
  } = req.body;

  const branchCheck = await branchModel.findOne({name: name})

  if (branchCheck) {
    return res.status(422).json({
      "message": "A branch with that name already exists."
    })
  }

  const restaurantCheck = await restaurantModel.findById(restaurantId)

  if (!restaurantCheck) {
    return res.status(422).json({
      "message": "A restaurant with that ID not exists."
    })
  }

  if (req.user?._id !== restaurantCheck.createdBy) {
    return res.status(422).json({
      "message": "It's not one of your restaurants."
    })
  }

  const branch = branchModel({
    restaurantId,
    name,
    addressCity,
    addressCounty,
    addressDescription,
    addressCoordinates: [addressLongitude, addressLatitude]
  })

  const branchResult = await branch.save()

  res.json(branchResult)
})

router.get('/list-menu', async (req: Request, res: Response) => {
  const {
    restaurantId
  } = req.query;

  const menuList = await menuModel.find({restaurantId})

  res.json(menuList)
})

router.post('/create-menu', upload.single('banner'), async (req: Request, res: Response) => {
  const {
    restaurantId,
    price,
    description
  } = req.body;

  const restaurantCheck = await restaurantModel.findById(restaurantId)

  if (!restaurantCheck) {
    return res.status(422).json({
      "message": "A restaurant with that ID not exists."
    })
  }

  if (req.user?._id !== restaurantCheck.createdBy) {
    return res.status(422).json({
      "message": "It's not one of your restaurants."
    })
  }

  const menu = menuModel({
    restaurantId,
    price,
    description,
    bannerImageExtension: req.file?.originalname.split(".").pop(),
  })

  await writeFile(menu._id + "." + req.file?.originalname.split(".").pop(), "assets/menu_banners/", req.file?.buffer as Buffer)

  const menuResult = await menu.save()

  res.json(menuResult)
})

router.delete('/restaurant', async (req: Request, res: Response) => {
  const {
    restaurantId
  } = req.query;

  const restaurantDelete = await restaurantModel.deleteOne({_id: restaurantId})
  const branchDelete = await branchModel.deleteMany({restaurantId})
  const menuDelete = await menuModel.deleteMany({restaurantId})
  const categoryDelete = await categoryModel.deleteMany({restaurantId})

  res.json(restaurantDelete)
})

router.delete('/branch', async (req: Request, res: Response) => {
  const {
    branchId
  } = req.query;

  const branchDelete = await branchModel.deleteOne({_id: branchId})

  res.json(branchDelete)
})

router.delete('/menu', async (req: Request, res: Response) => {
  const {
    menuId
  } = req.query;

  const menuDelete = await menuModel.deleteOne({_id: menuId})

  res.json(menuDelete)
})

export default router;