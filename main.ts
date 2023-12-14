// GLOBAL IMPORTS
import express, {Express, Request, Response} from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// DB
import "./db/mongoose.init";
import "./db/models";

// MIDDLEWARES
import {jwtSessionMiddleware} from "./middlewares/jwtsession.middleware";

// ROUTES
import authRoutes from "./modules/auth/auth.routes";
import restaurantRoutes from "./modules/restaurant/restaurant.routes";
import orderingRoutes from "./modules/ordering/ordering.routes";

const app: Express = express();
const port = process.env.PORT || 3000;
dotenv.config();

app.use(bodyParser.json())
app.use(jwtSessionMiddleware)

app.use('/auth', authRoutes)
app.use('/restaurant', restaurantRoutes)
app.use('/ordering', orderingRoutes)

app.get("/", (req: Request, res: Response) => {
  res.send("Voco Restaurant");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});