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
    const foundUser = await await UserModel.findOne({ email }).select("-__v");
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
      return {
        token,
        user,
      };
    }
  }

  async validate(schema, user) {
    return await schema.validate(user);
  }
}

module.exports = new UserController();
