import { Router } from "express";
import { 
    uploadAndGenerateProvenance,
    confirmAndRegisterImage,
    getAllImages,
    getImageByHash,
    prepareMetadataUpdate,
    confirmImageBurn,
    confirmImageTransfer,
    confirmMetadataUpdate,
    searchImages
} from "../Controllers/image.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { uploadMemory } from "../Middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllImages);
router.route("/search").get(searchImages);
router.route("/:hash").get(getImageByHash);
router.use(verifyJWT);
router.route("/drafts").post(
    uploadMemory.single("image"), 
    uploadAndGenerateProvenance
);
router.route("/").post(confirmAndRegisterImage);
router.route("/:hash/metadata/draft").post(prepareMetadataUpdate);
router.route("/:hash/metadata/confirm").patch(confirmMetadataUpdate);
router.route("/:hash/transfer").patch(confirmImageTransfer);
router.route("/:hash/burn").patch(confirmImageBurn);


export default router;