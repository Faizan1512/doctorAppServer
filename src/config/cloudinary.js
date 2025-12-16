import { v2 as cloudinary } from "cloudinary";

import { ENV } from "./env.js";

cloudinary.config({
  cloud_name: "deloodqvm",
  api_key: "629646245553611",
  api_secret:"25VD3tGK-Rf2NiuNr6_ODTfGCaE"
});

export default cloudinary;

