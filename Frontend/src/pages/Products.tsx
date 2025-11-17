import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Search, Filter, ShoppingCart, Heart } from "lucide-react";
import { productAPI, categoryAPI, getCurrentUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cartStore } from "@/lib/cart-store";
import { ensureCartExists, upsertCartForCurrentUser } from "@/lib/cart-sync";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productAPI.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryAPI.getAll,
  });

  const productList = Array.isArray(products) ? products : [];
  const categoryList = Array.isArray(categories) ? categories : [];

  const filteredProducts = productList
    .filter((product: any) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

  const addToCart = async (product: any) => {
    const user = getCurrentUser();
    
    if (!user || user.role !== "customer") {
      toast({
        title: "Error",
        description: "Debes iniciar sesión como cliente para agregar productos al carrito",
        variant: "destructive",
      });
      return;
    }

    const productId = product.idProduct || `temp-${Date.now()}`;
    setIsAddingToCart(productId);

    try {
      console.log("Agregando producto al carrito:", product);
      const cartId = await ensureCartExists();
      
      if (!cartId) {
        throw new Error("No se pudo crear o encontrar carrito");
      }

      console.log("Carrito asegurado con ID:", cartId);


      const cartItem = {
        id: `${productId}-${Date.now()}`,
        productId: productId,
        name: product.name || "Producto",
        price: product.price || 29.99,
        quantity: 1,
      };
      
      cartStore.addItem(cartItem);
      console.log("Producto agregado al store local:", cartItem);
      
      await upsertCartForCurrentUser();
      console.log("Carrito sincronizado con backend");

      sessionStorage.setItem("cart", JSON.stringify(cartStore.getItems()));

      toast({
        title: "Producto agregado",
        description: `${product.name} se ha añadido al carrito`,
      });
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    
      const items = cartStore.getItems();
      const itemToRemove = items.find(item => 
        item.productId === productId && 
        item.id.includes(`${productId}-`)
      );
      if (itemToRemove) {
        cartStore.removeItem(itemToRemove.id);
      }
      
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(null);
    }
  };

  const addToWishlist = (product: any) => {
    toast({
      title: "Agregado a favoritos",
      description: `${product.name} se ha añadido a tu lista de deseos`,
    });
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-cornsilk to-warm py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Catálogo de Productos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora nuestra colección completa de cerámicas artesanales. Cada
              pieza es única y está hecha con amor y dedicación.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categoryList.map((category: any) => (
                  <SelectItem key={category.categoryID} value={category.idCategory}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nombre A-Z</SelectItem>
                <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="border-ceramics text-ceramics hover:bg-ceramics hover:text-ceramics-foreground"
            >
              <Filter className="h-4 w-4 mr-2" />
              Más Filtros
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground">
            Mostrando {filteredProducts.length} productos
            {searchTerm && ` para "${searchTerm}"`}
            {selectedCategory !== "all" && ` en "${categoryList.find(cat => cat.idCategory === selectedCategory)?.name || selectedCategory}"`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product: any, index: number) => {
            const productId = product.idProduct || `temp-${index}`;
            const isLoading = isAddingToCart === productId;
            
            return (
              <Card
                key={productId}
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-b from-card to-card/50 border-0 shadow-lg overflow-hidden"
              >
                <CardHeader className="p-0">
                  <div className="aspect-[4/3] rounded-t-lg relative overflow-hidden">
                    <img
                      src={product.url || "https://via.placeholder.com/400x300?text=Sin+Imagen"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=Sin+Imagen";
                      }}
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <Badge className="bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground shadow-lg">
                        Artesanal
                      </Badge>
                      {product.customizationAvailable && (
                        <Badge
                          variant="secondary"
                          className="bg-white/90 text-foreground shadow-lg"
                        >
                          Personalizable
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-foreground shadow-lg backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(product);
                      }}
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center text-white/90">
                        <div className="flex text-yellow-300">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm ml-2">(4.9)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-3 line-clamp-2 text-foreground font-semibold">
                    {product.name || `Producto Artesanal ${index + 1}`}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                    {product.description ||
                      "Hermosa pieza de cerámica hecha a mano con técnicas tradicionales. Cada producto es único y especial, creado con amor y dedicación por nuestros artesanos."}
                  </CardDescription>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-ceramics">
                        ${product.price || "29.99"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Precio por unidad
                      </span>
                    </div>
                    <Badge
                      variant={
                        product.stock > 10
                          ? "default"
                          : product.stock > 0
                            ? "secondary"
                            : "destructive"
                      }
                      className="px-3 py-1"
                    >
                      {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-4 p-2 bg-muted/50 rounded-lg">
                    <span className="font-medium">Categoría:</span>{" "}
                    {categoryList.find(
                      (cat) => cat.idCategory === product.category
                    )?.name || "Cerámica General"}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex gap-3">
                  <Button
                    className="flex-1 bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={product.stock === 0 || isLoading}
                    onClick={() => addToCart(product)}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-ceramics-foreground border-t-transparent"></div>
                        Agregando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Agregar al Carrito
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-ceramics text-ceramics hover:bg-ceramics hover:text-ceramics-foreground"
                  >
                    <span className="text-lg">👁️</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
            <p className="text-muted-foreground">Intenta ajustar tus filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}