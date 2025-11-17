import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function PaymentCanceled() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Pago cancelado | Tienda";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Tu pago fue cancelado. Puedes intentar nuevamente.");
  }, []);
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Pago cancelado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>No se realizó ningún cargo. Puedes revisar tu pedido e intentarlo otra vez.</p>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/checkout")}>Volver al checkout</Button>
            <Button variant="secondary" onClick={() => navigate("/carrito")}>Volver al carrito</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
