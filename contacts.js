const { promises: fsPromises } = require("fs");
const path = require("path");

// Раскомментируй и запиши значение
const contactsPath = path.join(__dirname, "./db/contacts.json");
// TODO: задокументировать каждую функцию
async function listContacts() {
  const dataJson = await fsPromises.readFile(contactsPath, "utf-8");
  const data = JSON.parse(dataJson);
  return data;
}

// try {
//   listContacts().then((data) => console.log(typeof data));
// } catch (err) {
//   console.error(err);
// }

async function getContactById(contactId) {
  const data = await listContacts();
  const contact = data.find((el) => el.id == contactId);
  return contact;
}

async function removeContact(contactId) {
  const data = await listContacts();
  const el = data.find((el) => el.id == contactId);
  if (!el) {
    return "not found";
  }
  const newContacts = data.filter((el) => el.id !== contactId);
  await fsPromises.writeFile(contactsPath, JSON.stringify(newContacts));
}

async function addContact(name, email, phone) {
  const data = await listContacts();
  const newId = data[data.length - 1].id + 1;
  const newContact = {
    id: newId,
    name,
    email,
    phone,
  };
  data[data.length] = newContact;
  fsPromises.writeFile(contactsPath, JSON.stringify(data));
  return newContact;
}

async function updateContact(id, update) {
  const data = await listContacts();
  let ans;
  data.forEach((el, inx) => {
    if (el.id == id) {
      data[inx] = { ...el, ...update };
      ans = data[inx];
    }
  });
  await fsPromises.writeFile(contactsPath, JSON.stringify(data));
  return ans;
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
