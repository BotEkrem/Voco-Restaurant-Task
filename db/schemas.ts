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
  userId: { type: mongooseInit.Schema.ObjectId, required: true},
  address: String
});

const restaurantSchema = new mongooseInit.Schema({
  name: String,
  description: String,
  logoExtension: String,
  createdBy: String
});

const categorySchema = new mongooseInit.Schema({
  restaurantId: { type: mongooseInit.Schema.ObjectId, required: true},
  category: String
});

const branchSchema = new mongooseInit.Schema({
  restaurantId: { type: mongooseInit.Schema.ObjectId, required: true},
  name: String,
  addressCity: String,
  addressCounty: String,
  addressDescription: String,
  addressCoordinates:{
    type: [Number],
    index: '2dsphere'
  }
});

const menuSchema = new mongooseInit.Schema({
  restaurantId: { type: mongooseInit.Schema.ObjectId, required: true},
  price: Number,
  description: String,
  bannerImageExtension: String,
});

const orderSchema = new mongooseInit.Schema({
  userId: { type: mongooseInit.Schema.ObjectId, required: true},
  restaurantId: { type: mongooseInit.Schema.ObjectId, required: true},
  addressId: { type: mongooseInit.Schema.ObjectId, required: true},
  menuId: { type: mongooseInit.Schema.ObjectId, required: true},
  date: Date
});

const voteSchema = new mongooseInit.Schema({
  userId: { type: mongooseInit.Schema.ObjectId, required: true},
  restaurantId: { type: mongooseInit.Schema.ObjectId, required: true},
  description: String,
  points: Number,
  date: Date
});

export {
  userSchema,
  addressSchema,
  restaurantSchema,
  categorySchema,
  branchSchema,
  menuSchema,
  orderSchema,
  voteSchema
}