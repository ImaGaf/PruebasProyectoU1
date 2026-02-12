const basicAuth = require("../middlewares/basicAuth");

describe("basicAuth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Arrange (common setup)
    process.env.BASIC_USER = "admin";
    process.env.BASIC_PASS = "secret";

    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("debe llamar next() si las credenciales son correctas", () => {
    // Arrange
    const credentials = Buffer.from("admin:secret").toString("base64");
    req.headers.authorization = `Basic ${credentials}`;

    // Act
    basicAuth(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("debe retornar 401 si no hay header Authorization", () => {
    // Arrange (req.headers.authorization no está definido)

    // Act
    basicAuth(req, res, next);

    // Assert
    expect(res.setHeader).toHaveBeenCalledWith("WWW-Authenticate", 'Basic realm="Restricted Area"');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Authentication required.");
    expect(next).not.toHaveBeenCalled();
  });

  test("debe retornar 401 si las credenciales son incorrectas", () => {
    // Arrange
    const credentials = Buffer.from("wrong:wrong").toString("base64");
    req.headers.authorization = `Basic ${credentials}`;

    // Act
    basicAuth(req, res, next);

    // Assert
    expect(res.setHeader).toHaveBeenCalledWith("WWW-Authenticate", 'Basic realm="Restricted Area"');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Authentication failed.");
    expect(next).not.toHaveBeenCalled();
  });

  test("debe retornar 401 si el usuario es correcto pero la contraseña no", () => {
    // Arrange
    const credentials = Buffer.from("admin:wrongpass").toString("base64");
    req.headers.authorization = `Basic ${credentials}`;

    // Act
    basicAuth(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Authentication failed.");
    expect(next).not.toHaveBeenCalled();
  });

  test("debe retornar 401 si la contraseña es correcta pero el usuario no", () => {
    // Arrange
    const credentials = Buffer.from("wronguser:secret").toString("base64");
    req.headers.authorization = `Basic ${credentials}`;

    // Act
    basicAuth(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
