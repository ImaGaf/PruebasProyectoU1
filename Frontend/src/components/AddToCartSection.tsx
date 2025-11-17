import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cartAPI, productAPI } from "@/lib/api";

export default function AddToCartSection() {
  const [products, setProducts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    productAPI.getAll().then(setProducts);
  }, []);

  const handleAddToCart = async (product: any) => {
    if (!product.id && !product._id) {
      toast({
        title: "Error",
        description: "El producto no tiene un ID válido",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      product: [
        {
          idProduct: product.id ?? product._id,  
          quantity: 1, 
          price: product.price,  
        },
      ],
      total: product.price,  
      customer: "CUST001", 
    };

    try {
      await cartAPI.create(productData);
      toast({ title: "Producto agregado al carrito" });
    } catch (err) {
      toast({
        title: "Error al agregar",
        description: `Hubo un problema: ${String(err)}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2 className="font-bold mb-4">Agregar Productos al Carrito</h2>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {products.map((p: any, idx: number) => (
          <Card key={p.id ?? p._id ?? idx}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Precio: ${p.price}</div>
              <Button onClick={() => handleAddToCart(p)}>Agregar al carrito</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
