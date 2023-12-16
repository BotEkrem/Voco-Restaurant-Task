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
const voteModel = models["voteModel"]

router.get('/2', async (req: Request, res: Response) => {
  const {
    search,
    longitude,
    latitude
  } = req.query

  const aggsList: any[] = []

  if (latitude && longitude) {
    aggsList.push({
      $geoNear: {
        near: {type: 'Point', coordinates: [Number(longitude), Number(latitude)]},
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

  aggsList.push({
    $limit: 5
  })

  const data = await branchModel.aggregate(aggsList)

  res.json(data)
})

router.post('/3', upload.array('photos', 12), async (req: Request, res: Response) => {
  const {
    restaurantId,
    menus
  } = req.body;

  const menuArray = JSON.parse(menus)
  const filesCheck = (req.files || [] as any)

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

  if (menuArray.length !== filesCheck.length) {
    return res.status(422).json({
      "message": "Please send files according to the menu count."
    })
  }

  let menuModels = []
  let i = 0

  for await (const menu of menuArray) {
    const menuObj = menuModel({
      restaurantId,
      price: menu.price,
      description: menu.description,
      bannerImageExtension: filesCheck[i].originalname.split(".").pop(),
    })

    await writeFile(menuObj._id + "." + filesCheck[i].originalname.split(".").pop(), "assets/menu_banners/", filesCheck[i].buffer as Buffer)

    menuModels.push(menuObj)
    i++
  }

  const menuResult = await menuModel.insertMany(menuModels)

  res.json(menuResult)
})

router.get('/4', async (req: Request, res: Response) => {
  const {
    gender,
    pageIndex,
  } = req.query

  const aggsList: any[] = [
    {
      $lookup:   {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: "$user"
    },
    {
      $sort:   {
        "user.age": -1
      }
    }
  ]

  if (gender) {
    const regex = new RegExp(gender as string, 'i')
    aggsList.push({
      $match:   {
        "user.gender": {$regex: regex}
      }
    })
  }

  if (pageIndex) {
    aggsList.push(
      {
        $skip: Number(pageIndex) * 20
      },
      {
        $limit: 20
      })
  }

  const data = await voteModel.aggregate(aggsList)

  res.json(data)
})

router.get('/5', async (req: Request, res: Response) => {
  const data = await restaurantModel.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "restaurantId",
        as: "categories"
      }
    },
    {
      $lookup: {
        from: "votes",
        localField: "_id",
        foreignField: "restaurantId",
        as: "votes"
      }
    },
    {
      $addFields: {
        "voteAvg": {
          $avg: "$votes.points"
        },
      }
    },
    {
      $match: {
        "description": {$regex: /.*fast.*/i},
        "voteAvg": {$gte: 4},
        $or: [ {"categories.category": "Fast Food"}, {"categories.category": "Ev Yemekleri"} ]
      }
    },
    {
      $project: {
        name: 1,
        categories: 1,
        description: 1
      }
    }
  ])

  res.json(data)
})

router.get('/6', async (req: Request, res: Response) => {
  const {
    pageIndex,
    pageSize
  } = req.query

  const data = await restaurantModel.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "restaurantId",
        as: "categories"
      }
    },
    {
      $lookup: {
        from: "votes",
        localField: "_id",
        foreignField: "restaurantId",
        as: "votes"
      }
    },
    {
      $addFields: {
        "voteAvg": {
          $avg: "$votes.points"
        },
      }
    },
    {
      $sort: {
        voteAvg: -1
      }
    },
    {
      $skip: Number(pageIndex) * Number(pageSize)
    },
    {
      $limit: Number(pageSize)
    }
  ])

  res.json(data)
})

export default router;