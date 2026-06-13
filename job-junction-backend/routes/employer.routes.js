const router = require("express").Router();
const Controller = require("../controllers/employer.controller");
const { verifyAccessToken } = require("../helpers/jwt.helper");
const { attachUser, authorize } = require("../middlewares/auth.middleware");
const upload = require("../helpers/multer.helper");

// Public
router.get("/:userId", Controller.getProfileById);

// Protected
router.use(verifyAccessToken, attachUser, authorize("employer"));
router.get("/me/profile",  Controller.getMyProfile);
router.post("/me/profile", upload.fields([{ name: "company_logo", maxCount: 1 }]), Controller.upsertProfile);
router.put("/me/profile",  upload.fields([{ name: "company_logo", maxCount: 1 }]), Controller.upsertProfile);

module.exports = router;
