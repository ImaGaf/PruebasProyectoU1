require("dotenv").config();
const express = require("express");
const basicAuth = require('./middlewares/basicAuth');
const connectDB = require("./config/db");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

connectDB();


app.use(cors(corsOptions));         
app.use(express.json());

// Solo usar autenticación básica si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  app.use(basicAuth);
}

app.use("/barroco/categories", require("./routes/categoryRoutes"));
app.use("/barroco/products", require("./routes/productRoutes"));
app.use("/barroco/customers", require("./routes/customerRoutes"));
<<<<<<< HEAD

app.use("/api/cart", require("./routes/shoppingCartRoutes"));



=======
app.use("/barroco/shoppingCart", require('./routes/shoppingCartRoutes'));
>>>>>>> origin/main

app.get("/", (req, res) => {
  res.send("API RESTful de Barroco funcionando correctamente");
});

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

<<<<<<< HEAD
// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Exportar la app para los tests
module.exports = app;

// Solo iniciar el servidor si no estamos en modo test
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}
=======
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
>>>>>>> origin/main
