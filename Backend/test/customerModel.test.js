const dbHandler = require("./dbHandler");
const bcrypt = require("bcryptjs");
const Customer = require("../models/customer");

describe("Customer Model (BD real)", () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  beforeEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  test("debe tener los campos requeridos en el schema", () => {
    // Arrange & Act
    const schema = Customer.schema.obj;

    // Assert
    expect(schema.firstName.required).toBe(true);
    expect(schema.lastName.required).toBe(true);
    expect(schema.email.required).toBe(true);
    expect(schema.password.required).toBe(true);
    expect(schema.phone.required).toBe(true);
    expect(schema.billingAddress.required).toBe(true);
  });

  test("el campo role debe tener valor por defecto 'customer'", () => {
    // Arrange & Act
    const schema = Customer.schema.obj;

    // Assert
    expect(schema.role.default).toBe("customer");
  });

  test("shippingAddress no debe ser requerido", () => {
    // Arrange & Act
    const schema = Customer.schema.obj;

    // Assert
    expect(schema.shippingAddress.required).toBeUndefined();
  });

  test("debe hashear la contraseña al guardar en la BD", async () => {
    // Arrange
    const plainPassword = "miPassword123";
    const customerData = {
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@test.com",
      password: plainPassword,
      phone: "1234567890",
      billingAddress: "Calle 123",
    };

    // Act - guardar en la BD real (el pre-save hook se ejecuta automáticamente)
    const saved = await Customer.create(customerData);

    // Assert
    expect(saved.password).not.toBe(plainPassword);
    const isMatch = await bcrypt.compare(plainPassword, saved.password);
    expect(isMatch).toBe(true);
  });

  test("no debe re-hashear la contraseña si no fue modificada", async () => {
    // Arrange
    const created = await Customer.create({
      firstName: "Ana",
      lastName: "García",
      email: "ana@test.com",
      password: "original123",
      phone: "0987654321",
      billingAddress: "Calle 456",
    });
    const hashedPassword = created.password;

    // Act - actualizar otro campo sin tocar password
    created.firstName = "Ana Actualizada";
    await created.save();

    // Assert - la contraseña no cambió
    const found = await Customer.findById(created._id);
    expect(found.password).toBe(hashedPassword);
  });

  test("comparePassword debe retornar true para contraseña correcta", async () => {
    // Arrange
    const plainPassword = "testPassword123";
    const customer = await Customer.create({
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      password: plainPassword,
      phone: "5555555555",
      billingAddress: "Calle 789",
    });

    // Act
    const result = await customer.comparePassword(plainPassword);

    // Assert
    expect(result).toBe(true);
  });

  test("comparePassword debe retornar false para contraseña incorrecta", async () => {
    // Arrange
    const customer = await Customer.create({
      firstName: "Test2",
      lastName: "User2",
      email: "test2@test.com",
      password: "correctPassword",
      phone: "4444444444",
      billingAddress: "Calle 101",
    });

    // Act
    const result = await customer.comparePassword("wrongPassword");

    // Assert
    expect(result).toBe(false);
  });

  test("la colección debe ser 'customers'", () => {
    // Assert
    expect(Customer.collection.collectionName).toBe("customers");
  });

  test("debe fallar si falta un campo requerido", async () => {
    // Arrange
    const invalidData = { firstName: "Solo nombre" };

    // Act & Assert
    await expect(Customer.create(invalidData)).rejects.toThrow();
  });

  test("el campo role se asigna como 'customer' por defecto al crear", async () => {
    // Arrange
    const customerData = {
      firstName: "Nuevo",
      lastName: "Cliente",
      email: "nuevo@test.com",
      password: "pass123",
      phone: "3333333333",
      billingAddress: "Calle Default",
    };

    // Act
    const saved = await Customer.create(customerData);

    // Assert
    expect(saved.role).toBe("customer");
  });
});
