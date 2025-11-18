import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { productAPI } from "@/lib/api";

export default function FilterSection() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  useEffect(() => {
    productAPI.getAll().then(setProducts);
  }, []);
  const filtered = products.filter((p: any) => p.name?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <h2 className="font-bold mb-4">Filtrar Productos</h2>
      <Separator />
      <Input
        placeholder="Buscar por nombre..."
        className="mt-4 mb-4"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {filtered.map((p: any, idx: number) => (
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
