const UserModel = require("./users.model");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class UserController {
  async register({ email, password }) {
    const checkUser = await UserModel.find({ email });
    if (checkUser.length) {
      return { message: "Email in use" };
    }

    const encryptedPassword = await bcrypt.hash(password, 6);

    const createdUser = await new UserModel({
      email,
      password: encryptedPassword,
    }).save();
    return createdUser;
  }

  async login({ email, password }) {
    const foundUser = await UserModel.findOne({ email }).select("-__v");
    if (!foundUser) {
      return { message: "Email or password is wrong" };
    }
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      const user = {
        email: foundUser.email,
        subscription: foundUser.subscription,
      };
      const token = await jwt.sign(
        JSON.stringify(foundUser),
        process.env.JWT_SECRET
      );
      await UserModel.findByIdAndUpdate(foundUser._id, { token });
      return {
        token,
        user,
      };
    }
  }

  async validate(schema, user) {
    return await schema.validate(user);
  }

  async checkToken(req, res, next) {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const { _id } = decodedToken;
      const user = await UserModel.findById(_id);
      if (!user) throw new Error();
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  }

  async logout(req, res) {
    try {
      const user = await UserModel.findById(req.user._id);
      if (!user) throw new Error();
      await UserModel.findByIdAndUpdate(req.user._id, { token: null });
      return res.status(204).json({ message: "Logged out" });
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  }

  async changeAvatar(req, res) {
    try {
      const user = await UserModel.findByIdAndUpdate(req.user._id, {
        avatarUrl: req.file.path,
      });
      return user;
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  }
}

module.exports = new UserController();
