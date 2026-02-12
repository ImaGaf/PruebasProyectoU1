const mongoose = require("mongoose");
require("dotenv").config();

// Usa una BD separada para tests (Barroco_test) para no afectar producción
const TEST_URI = process.env.MONGODB_URI.replace("/Barroco", "/Barroco_test");

const connect = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_URI);
  }
};

const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, closeDatabase, clearDatabase };
