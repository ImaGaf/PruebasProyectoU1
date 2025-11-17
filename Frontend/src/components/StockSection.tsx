import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { productAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StockSection() {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const { toast } = useToast();

  const fetchProducts = () => productAPI.getAll().then(setProducts);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (p: any) => {
    setEditId(p.id ?? p._id);
    setEditStock(Number(p.stock));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    await productAPI.update(editId, { stock: editStock });
    toast({ title: "Stock actualizado" });
    setEditId(null);
    fetchProducts();
  };

  return (
    <div>
      <h2 className="font-bold mb-4">CRUD Stock</h2>
      <Separator />
      {editId && (
        <form className="mb-6" onSubmit={handleEditSubmit}>
          <h3 className="font-semibold mb-2">Editar Stock</h3>
          <Input
            placeholder="Stock"
            type="number"
            className="mb-2"
            value={editStock}
            onChange={e => setEditStock(Number(e.target.value))}
          />
          <Button type="submit">Guardar cambios</Button>
          <Button variant="ghost" type="button" onClick={() => setEditId(null)}>Cancelar</Button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {products.map((p: any, idx: number) => (
          <Card key={p.id ?? p._id ?? idx}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Stock: {p.stock}</div>
              <Button size="sm" onClick={() => handleEdit(p)}>Editar Stock</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
