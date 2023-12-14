import mongooseInit from "./mongoose.init";

const userSchema = new mongooseInit.Schema({
  username: String,
  password: String,
  email: String,
  age: Number,
  gender: String,
  profileImageExtension: String
});

const addressSchema = new mongooseInit.Schema({
  userId: String,
  address: String
});

const restaurantSchema = new mongooseInit.Schema({
  name: String,
  description: String,
  type: String,
  logoExtension: String,
  addressCity: String,
  addressCounty: String,
  addressDescription: String,
  addressLatitude: Number,
  addressLongitude: Number,
  createdBy: String
});

const branchSchema = new mongooseInit.Schema({
  restaurantId: String,
  name: String,
  addressCity: String,
  addressCounty: String,
  addressDescription: String,
  addressLatitude: Number,
  addressLongitude: Number,
});

const menuSchema = new mongooseInit.Schema({
  restaurantId: String,
  price: Number,
  description: String,
  bannerImageExtension: String,
});

const orderSchema = new mongooseInit.Schema({
  userId: String,
  restaurantId: String,
  addressId: String,
  menuId: String,
  date: Date
});

const voteSchema = new mongooseInit.Schema({
  userId: String,
  restaurantId: String,
  description: String,
  points: Number,
  date: Date
});

export {
  userSchema,
  addressSchema,
  restaurantSchema,
  branchSchema,
  menuSchema,
  orderSchema,
  voteSchema
}