const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "public/images/",
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

const router = Router();

const controller = require("./users.controller");

router.post("/register", controller.registerRoute);

router.post("/login", controller.loginRoute);

router.post("/logout", controller.checkToken, controller.logout);
router.get("/users/current", controller.checkToken, controller.getCurrentUser);

router.patch(
  "/users/avatars",
  controller.checkToken,
  upload.single("avatar"),
  controller.changeAvatarRoute
);

router.get("/verify/:verificationToken", controller.verifyUser);

module.exports = router;
