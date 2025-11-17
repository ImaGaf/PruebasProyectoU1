import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Pago exitoso | Tienda";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Tu pago fue procesado correctamente.");
  }, []);
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>¡Gracias por tu compra!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Tu pago fue realizado con éxito. Te enviamos un correo con los detalles.</p>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/")}>Seguir comprando</Button>
            <Button variant="secondary" onClick={() => navigate("/carrito")}>Ver carrito</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
