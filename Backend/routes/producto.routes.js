const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");


router.get("/productsAvailable", productController.getAvailable);
router.get("/productsDiscounted", productController.getCustomDiscounted);
router.post("/products/:idProduct/purchase", productController.purchase);

router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);


module.exports = router;