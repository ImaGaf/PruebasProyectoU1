const errorHandler = require("../middlewares/errorHandler");

describe("errorHandler Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Arrange (common setup)
    req = {};
    res = {
      statusCode: 200,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("debe retornar 500 por defecto cuando statusCode es 200", () => {
    // Arrange
    const err = new Error("Algo salió mal");
    res.statusCode = 200;

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Algo salió mal",
      })
    );
  });

  test("debe respetar el statusCode si ya fue establecido y no es 200", () => {
    // Arrange
    const err = new Error("No encontrado");
    res.statusCode = 404;

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "No encontrado",
      })
    );
  });

  test("debe incluir stack en modo development", () => {
    // Arrange
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const err = new Error("Error dev");

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error dev",
        stack: expect.any(String),
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  test("no debe incluir stack en modo producción", () => {
    // Arrange
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const err = new Error("Error prod");

    // Act
    errorHandler(err, req, res, next);

    // Assert
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });

  test("debe usar mensaje por defecto si el error no tiene mensaje", () => {
    // Arrange
    const err = {};

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error interno del servidor",
      })
    );
  });

  test("debe loguear el error en consola", () => {
    // Arrange
    const err = new Error("Error de consola");

    // Act
    errorHandler(err, req, res, next);

    // Assert
    expect(console.error).toHaveBeenCalled();
  });
});
