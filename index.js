const argv = require("yargs").argv;

const contacts = require("./contacts");

// TODO: рефакторить
function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case "list":
      contacts.listContacts().then((c) => console.log(c));
      break;

    case "get":
      contacts.getContactById(id).then((c) => console.log(c));
      break;

    case "add":
      contacts.addContact(name, email, phone).then(console.log("added"));
      break;

    case "remove":
      contacts.removeContact(id).then(console.log("removed"));
      break;

    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}

invokeAction(argv);
