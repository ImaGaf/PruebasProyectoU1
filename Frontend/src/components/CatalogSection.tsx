import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { productAPI } from "@/lib/api";

export default function CatalogSection() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    productAPI.getAll().then(setProducts);
  }, []);

  return (
    <div>
      <h2 className="font-bold mb-4">Catálogo de Productos</h2>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {products.map((p: any, idx: number) => (
          <Card key={p.id ?? p._id ?? idx}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Precio: ${p.price}</div>
              <div>Stock: {p.stock}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
