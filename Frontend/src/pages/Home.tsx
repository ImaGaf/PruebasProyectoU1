import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Truck, Shield, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productAPI, statsAPI } from "@/lib/api";

export default function Home() {

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: productAPI.getAll,
  });

  const featuredProducts = Array.isArray(products) ? products.slice(0, 6) : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cornsilk via-warm to-accent py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              ✨ Cerámicas Artesanales Personalizadas
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Crea Piezas <span className="text-ceramics">Únicas</span> de Cerámica
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Descubre nuestra colección de cerámicas artesanales hechas a mano.
              Personaliza cada pieza según tu estilo y convierte tu hogar en un espacio especial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/productos">
                <Button size="lg" className="bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground">
                  Explorar Catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-muted-foreground">
                Cada pieza es cuidadosamente elaborada con materiales de primera calidad
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hecho con Amor</h3>
              <p className="text-muted-foreground">
                Artesanos expertos crean cada pieza con pasión y dedicación
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Envío Seguro</h3>
              <p className="text-muted-foreground">
                Empaque especializado para que tu cerámica llegue perfecta
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Productos Destacados
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestras piezas más populares, cada una con su propia personalidad y encanto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product: any, index: number) => (
              <Card key={product.idProduct || index} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-accent to-warm rounded-t-lg relative overflow-hidden">
                    {product.url ? (
                      <img
                        src={product.url || "https://via.placeholder.com/400x300?text=Sin+Imagen"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400x300?text=Sin+Imagen";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-ceramics/20 flex items-center justify-center">
                        <span className="text-4xl">🏺</span>
                      </div>
                    )}

                    <Badge className="absolute top-3 left-3 bg-primary">Artesanal</Badge>

                    {product.customizationAvailable && (
                      <Badge variant="secondary" className="absolute top-3 right-3">
                        Personalizable
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">(4.9)</span>
                  </div>
                  <CardTitle className="text-lg mb-2">{product.name || `Producto ${index + 1}`}</CardTitle>
                  <CardDescription className="text-sm mb-3">
                    {product.description || "Hermosa pieza de cerámica hecha a mano con técnicas tradicionales"}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-ceramics">
                      ${product.price || "29.99"}
                    </span>
                    <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                      {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground">
                    Ver Detalles
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/productos">
              <Button variant="outline" size="lg" className="border-ceramics text-ceramics hover:bg-ceramics hover:text-ceramics-foreground">
                Ver Todos los Productos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Customization CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-ceramics/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              ¿Tienes una Idea Especial?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Trabajamos contigo para crear piezas únicas que reflejen tu personalidad.
              Desde colores hasta formas, cada detalle puede ser personalizado.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card rounded-lg p-6">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold mb-2">Elige tu Color</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona de nuestra amplia paleta de colores
                </p>
              </div>
              <div className="bg-card rounded-lg p-6">
                <div className="text-3xl mb-3">📏</div>
                <h3 className="font-semibold mb-2">Define el Tamaño</h3>
                <p className="text-sm text-muted-foreground">
                  Ajusta las dimensiones según tus necesidades
                </p>
              </div>
              <div className="bg-card rounded-lg p-6">
                <div className="text-3xl mb-3">✨</div>
                <h3 className="font-semibold mb-2">Añade Detalles</h3>
                <p className="text-sm text-muted-foreground">
                  Incorpora diseños y patrones únicos
                </p>
              </div>
            </div>
            <Link to="/personalizar">
              <Button size="lg" className="bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground">
                Comenzar Personalización
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}