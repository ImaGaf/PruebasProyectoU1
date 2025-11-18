import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { orderAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const { toast } = useToast();

  const fetchOrders = () => orderAPI.getAll().then(setOrders);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!id) return;
    await orderAPI.delete(id);
    toast({ title: "Pedido eliminado" });
    fetchOrders();
  };

  const handleEdit = (o: any) => {
    setEditId(o.id ?? o._id);
    setEditStatus(o.status ?? "");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    await orderAPI.update(editId, { status: editStatus });
    toast({ title: "Pedido actualizado" });
    setEditId(null);
    fetchOrders();
  };

  return (
    <div>
      <h2 className="font-bold mb-4">CRUD Pedidos</h2>
      <Separator />
      {editId && (
        <form className="mb-6" onSubmit={handleEditSubmit}>
          <h3 className="font-semibold mb-2">Editar Estado</h3>
          <Input
            placeholder="Estado"
            className="mb-2"
            value={editStatus}
            onChange={e => setEditStatus(e.target.value)}
          />
          <Button type="submit">Guardar cambios</Button>
          <Button variant="ghost" type="button" onClick={() => setEditId(null)}>Cancelar</Button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {orders.map((o: any, idx: number) => (
          <Card key={o.id ?? o._id ?? idx}>
            <CardHeader>
              <CardTitle>Pedido #{o.id ?? o._id ?? idx}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Cliente: {o.customerName}</div>
              <div>Total: ${o.total}</div>
              <div>Estado: {o.status}</div>
              <Button size="sm" className="mr-2" onClick={() => handleEdit(o)}>Editar</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(o.id ?? o._id)}>Eliminar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
