import multer from "multer";
import { allowedExtensions } from "../utilities/allowedExtensions.js";
import CustomError from "../utilities/customError.js";

export const multerCloudFunction = (allowedExtensionsArr) => {

  if (!allowedExtensionsArr) {
    allowedExtensionsArr = allowedExtensions.Image;
  }

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
 
    const isMimeAllowed = allowedExtensionsArr.includes(file.mimetype);

    const isPdfByName =
      file.originalname.toLowerCase().endsWith(".pdf");

    if (isMimeAllowed || isPdfByName) {
      return cb(null, true);
    }

    return cb(
      new CustomError("invalid extension", 400),
      false
    );
  };

  return multer({
    storage,
    fileFilter,
  });
};
