const fs = require("fs");
const path = require("path");

// Раскомментируй и запиши значение
const contactsPath = `${path.dirname("./db/contacts.json")}/${path.basename(
  "./db/contacts.json"
)}`;
// TODO: задокументировать каждую функцию
function listContacts() {
  fs.readFile(contactsPath, "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    console.table(data);
  });
}
listContacts();

function getContactById(contactId) {
  // ...твой код
}

function removeContact(contactId) {
  // ...твой код
}

function addContact(name, email, phone) {
  // ...твой код
}
