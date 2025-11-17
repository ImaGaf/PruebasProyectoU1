import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cartStore } from "@/lib/cart-store";
import { getCurrentUser } from "@/lib/api";
import { upsertCartForCurrentUser, loadCartForCurrentUser } from "@/lib/cart-sync";

export default function Cart() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(cartStore.getItems());

  useEffect(() => {
    const updateCart = () => {
      setCartItems([...cartStore.getItems()]);
    };

    loadCartForCurrentUser()
      .then(() => updateCart())
      .catch(() => updateCart());

    const unsubscribe = cartStore.subscribe(updateCart);
    return unsubscribe;
  }, []);


  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeItem(id);
      return;
    }
    cartStore.updateQuantity(id, newQuantity);
    await upsertCartForCurrentUser();
  };

  const removeItem = async (id: string) => {
    cartStore.removeItem(id);
    await upsertCartForCurrentUser();
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del carrito",
    });
  };

  const subtotal = cartStore.getTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const getProductIcon = (productId: string, name: string) => {
    if (productId.includes('custom-mug') || name.includes('Taza')) return '☕';
    if (productId.includes('custom-plate') || name.includes('Plato')) return '🍽️';
    if (productId.includes('custom-vase') || name.includes('Jarrón')) return '🏺';
    if (productId.includes('custom-bowl') || name.includes('Cuenco')) return '🥣';
    return '🏺';
  };

  const proceedToCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito para continuar",
        variant: "destructive",
      });
      return;
    }

    const user = getCurrentUser();
    if (!user || user?.role !== "customer") {
      toast({
        title: "Requiere inicio de sesión",
        description: "Inicia sesión como cliente para continuar con el pago",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    toast({
      title: "Procesando pedido...",
      description: "Guardando tu carrito y redirigiendo al checkout",
    });

    await upsertCartForCurrentUser().catch(() => { });

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-cornsilk to-warm py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4">
            <Link to="/productos">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Carrito de Compras</h1>
              <p className="text-muted-foreground">
                {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Descubre nuestros productos únicos de cerámica y comienza a personalizar tu hogar
            </p>
            <Link to="/productos">
              <Button className="bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Explorar Productos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Productos en tu carrito</h2>

              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-32 h-32 bg-gradient-to-br from-accent to-warm rounded-lg flex items-center justify-center text-4xl">
                        {getProductIcon(item.productId, item.name)}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-2xl font-bold text-ceramics mb-3">
                          ${item.price.toFixed(2)}
                        </div>

                        {item.customization && (
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">Personalización:</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">Color: {item.customization.color}</Badge>
                              <Badge variant="secondary">Tamaño: {item.customization.size}</Badge>
                              <Badge variant="secondary">Diseño: {item.customization.design}</Badge>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Cantidad:</span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-16 h-8 text-center"
                                min="1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-lg font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>


            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impuestos</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>

                    {shipping === 0 && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        🎉 ¡Envío gratuito en pedidos mayores a $50!
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-ceramics">${total.toFixed(2)}</span>
                  </div>

                  <Button
                    className="w-full bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground"
                    onClick={proceedToCheckout}
                  >
                    Proceder al Pago
                  </Button>

                  <div className="text-center">
                    <Link to="/productos">
                      <Button variant="ghost" className="text-muted-foreground">
                        Continuar Comprando
                      </Button>
                    </Link>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">🔒</span>
                      Pago seguro con encriptación SSL
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">📦</span>
                      Empaque especializado para cerámicas
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">↩️</span>
                      Garantía de devolución de 30 días
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}