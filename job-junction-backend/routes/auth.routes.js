const router = require("express").Router();
const Controller = require("../controllers/auth.controller");
const { verifyAccessToken } = require("../helpers/jwt.helper");

router.post("/signup",          Controller.signUp);
router.post("/login",           Controller.login);
router.post("/refresh-token",   Controller.refreshToken);
router.get("/profile",          verifyAccessToken, Controller.profile);
router.put("/change-password",  verifyAccessToken, Controller.changePassword);

module.exports = router;
