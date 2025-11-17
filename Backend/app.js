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

app.use(basicAuth);

app.use("/barroco/categories", require("./routes/categoryRoutes"));
app.use("/barroco/products", require("./routes/productRoutes"));
app.use("/barroco/customers", require("./routes/customerRoutes"));
app.use("/barroco/shoppingCart", require('./routes/shoppingCartRoutes'));

app.get("/", (req, res) => {
  res.send("API RESTful de Barroco funcionando correctamente");
});

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
