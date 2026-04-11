import { Router } from "express";
import { uploadAndGenerateProvenance, getImageByHash, getAllImages, getMyImages, verifyImageOnChain} from "../Controllers/image.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";


const router = Router();

router.route("/").post(
    verifyJWT,
    upload.single("image"),
    uploadAndGenerateProvenance
);
router.route("/").get(getAllImages)
router.route("/me").get(verifyJWT, getMyImages)
router.route("/:hash").get(getImageByHash)
router.route("/verify").post(upload.single('image'), verifyImageOnChain)

export default router;