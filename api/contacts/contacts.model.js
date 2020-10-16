const { Schema, model } = require("mongoose");

const contactsSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  subscription: {
    type: String,
    default: "free",
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: "",
  },
});

module.exports = model("contacts", contactsSchema);
