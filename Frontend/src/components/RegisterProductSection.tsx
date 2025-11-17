import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { productAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RegisterProductSection() {
  const [form, setForm] = useState({
    idProduct: "",  
    name: "",
    price: "",
    stock: "",
    description: "",
    categoryId: "",
    url: "",
  });
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    idProduct: "",
    name: "",
    price: "",
    stock: "",
    description: "",
    categoryId: "",
    url: "",
  });
  const { toast } = useToast();

  const fetchProducts = () => productAPI.getAll().then(setProducts);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.stock || !form.url) {
      toast({ title: "Faltan campos obligatorios", variant: "destructive" });
      return;
    }
    const productData = {
      idProduct: form.idProduct, 
      name: form.name,
      price: parseFloat(form.price), 
      stock: parseInt(form.stock), 
      description: form.description || "", 
      categoryId: form.categoryId || null, 
      url: form.url, 
    };

    console.log("Datos a enviar para registrar producto:", productData);

    try {
      await productAPI.create(productData); 
      toast({ title: "Producto registrado" });
      setForm({ idProduct: "", name: "", price: "", stock: "", description: "", categoryId: "", url: "" }); 
      fetchProducts(); 
    } catch (err: any) {
      console.error("Error al registrar producto:", err);
      toast({ title: "Error al registrar", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p.id ?? p._id);
    setEditForm({
      idProduct: p.idProduct ?? "",
      name: p.name,
      price: p.price,
      stock: p.stock,
      description: p.description ?? "",
      categoryId: p.categoryId ?? "",
      url: p.url ?? "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    const updatedProduct = {
      idProduct: editForm.idProduct, 
      name: editForm.name,
      price: parseFloat(editForm.price),
      stock: parseInt(editForm.stock),
      description: editForm.description,
      categoryId: editForm.categoryId,
      url: editForm.url,
    };

    try {
      await productAPI.update(editId, updatedProduct); 
      toast({ title: "Producto actualizado" });
      setEditId(null);
      fetchProducts(); 
    } catch (err: any) {
      console.error("Error al actualizar el producto:", err);
      toast({ title: "Error al actualizar", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productAPI.delete(id);
      toast({ title: "Producto eliminado" });
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Error al eliminar", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <h2 className="font-bold mb-4">Registrar/Editar Producto</h2>
      <Separator />
      <form className="mt-4 mb-6" onSubmit={handleSubmit}>
        <Input
          placeholder="ID Producto (opcional)"
          className="mb-2"
          value={form.idProduct}
          onChange={(e) => setForm({ ...form, idProduct: e.target.value })}
        />
        <Input
          placeholder="Nombre"
          className="mb-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Precio"
          type="number"
          className="mb-2"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <Input
          placeholder="Stock"
          type="number"
          className="mb-2"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <Input
          placeholder="Descripción"
          className="mb-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          placeholder="ID Categoría"
          className="mb-2"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        />
        <Input
          placeholder="URL de la imagen"
          className="mb-2"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <Button type="submit">Registrar</Button>
      </form>

      {editId && (
        <form className="mb-6" onSubmit={handleEditSubmit}>
          <h3 className="font-semibold mb-2">Editar Producto</h3>
          <Input
            placeholder="ID Producto (opcional)"
            className="mb-2"
            value={editForm.idProduct}
            onChange={(e) => setEditForm({ ...editForm, idProduct: e.target.value })}
          />
          <Input
            placeholder="Nombre"
            className="mb-2"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            placeholder="Precio"
            type="number"
            className="mb-2"
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
          />
          <Input
            placeholder="Stock"
            type="number"
            className="mb-2"
            value={editForm.stock}
            onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
          />
          <Input
            placeholder="Descripción"
            className="mb-2"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <Input
            placeholder="ID Categoría"
            className="mb-2"
            value={editForm.categoryId}
            onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
          />
          <Input
            placeholder="URL de la imagen"
            className="mb-2"
            value={editForm.url}
            onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
          />
          <Button type="submit">Guardar cambios</Button>
          <Button variant="ghost" type="button" onClick={() => setEditId(null)}>
            Cancelar
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {products.map((p: any, idx: number) => (
          <Card key={p.id ?? p._id ?? idx}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Precio: ${p.price}</div>
              <div>Stock: {p.stock}</div>
              <div>
                URL:{" "}
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  Ver imagen
                </a>
              </div>
              <Button size="sm" className="mr-2" onClick={() => handleEdit(p)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id ?? p._id)}>
                Eliminar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
