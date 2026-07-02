const router = require("express").Router();
const Controller = require("../controllers/job.controller");
const { verifyAccessToken } = require("../helpers/jwt.helper");
const { attachUser, authorize } = require("../middlewares/auth.middleware");

// Public
router.get("/",    Controller.getAll);
router.get("/:id", Controller.getById);

// Protected - employer only
router.use(verifyAccessToken, attachUser, authorize("employer"));
router.post("/",           Controller.create);
router.get("/me/my-jobs",  Controller.getMyJobs);
router.put("/:id",         Controller.update);
router.delete("/:id",      Controller.delete);
router.post("/:id/repost", Controller.repost);


module.exports = router;
