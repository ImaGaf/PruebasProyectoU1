import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { paymentAPI } from "@/lib/api";

export default function PaymentSection() {
  const [payments, setPayments] = useState([]);
  useEffect(() => {
    paymentAPI.getAll().then(setPayments);
  }, []);
  
  return (
    <div>
      <h2 className="font-bold mb-4">Pagos</h2>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {payments.map((p: any, idx: number) => (
          <Card key={p.id ?? p._id ?? idx}>
            <CardHeader>
              <CardTitle>Pago #{p.id ?? p._id ?? idx}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Monto: ${p.amount}</div>
              <div>Estado: {p.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
