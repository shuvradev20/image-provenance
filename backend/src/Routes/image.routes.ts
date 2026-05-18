import { Router } from "express";
import { 
    uploadAndGenerateProvenance,
    confirmAndRegisterImage,
    getAllImages,
    getMyImages,
    getImageByHash 
} from "../Controllers/image.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { uploadMemory } from "../Middlewares/multer.middleware.js";

const router = Router();

router.route("/drafts").post(
    verifyJWT,
    uploadMemory.single("image"), 
    uploadAndGenerateProvenance
);
router.route("/").post(
    verifyJWT,
    confirmAndRegisterImage
);
router.route("/").get(getAllImages);
router.route("/me").get(verifyJWT, getMyImages);
router.route("/:hash").get(getImageByHash);

export default router;