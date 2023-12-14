import * as schemas from "./schemas";
import mongooseInit from "./mongoose.init";

let models = {} as { [key: string]: any }

Object.keys(schemas).forEach((v, i) => {
    models[v.replace("Schema", "") + "Model"] = mongooseInit.model(v.replace("Schema", ""), (schemas as any)[v])
})

export default models;