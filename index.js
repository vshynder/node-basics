const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const morgan = require("morgan");
const cors = require("cors");

const contactRouter = require("./api/contacts/contacts.router");
const userRouter = require("./api/users/users.router");

class Server {
  constructor() {
    this.server = express();
    this.PORT = process.env.PORT || 3000;
    this.CONNECT_DB_STRING = process.env.DB_CONNECTION_STRING || "";
  }

  async init() {
    this.initMidlewares();
    this.initRoutes();
    await this.connectToDb();
    this.startListening();
  }

  initMidlewares() {
    this.server.use(morgan("dev"));
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(this.handleErrors);
    this.server.use(express.static("public"));
  }

  initRoutes() {
    this.server.use("/api/contacts", contactRouter);
    this.server.use("/auth", userRouter);
  }

  async connectToDb() {
    mongoose
      .connect(this.CONNECT_DB_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      })
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((error) => {
        console.log(error);
        process.exit(1);
      });
  }

  startListening() {
    this.server.listen(this.PORT, () => {
      console.log(`Server started on port ${this.PORT}`);
    });
  }

  handleErrors(error, req, res, next) {
    if (error) {
      res.status(error.status);
      res.json({ message: error.message });
    }
  }
}

module.exports = new Server();
