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


app.use("/barroco/customers", require("./routes/customerRoutes"));

app.use("/api/cart", require("./routes/shoppingCartRoutes"));




app.get("/", (req, res) => {
  res.send("API RESTful de Barroco funcionando correctamente");
});

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

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