const Customer = require("../models/customer");

exports.findAll = () => Customer.find();

exports.findById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw new Error("Customer not found");
  return customer;
};

exports.create = (data) => Customer.create(data);

exports.update = async (id, data) => {
  const updated = await Customer.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error("Customer not found");
  return updated;
};

exports.remove = async (id) => {
  const deleted = await Customer.findByIdAndDelete(id);
  if (!deleted) throw new Error("Customer not found");
  return deleted;
};
