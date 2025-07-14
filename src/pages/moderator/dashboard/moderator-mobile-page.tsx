import { ProductVariantCombobox } from "@/components/feature-specific/company-products/product-variant-combobox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useUser from "@/hooks/use-user";
import { InventoryItem } from "@/models/data/inventory.model";
import { getInventoryByVariant } from "@/services/inventory-service";
import { getAllProductsWithVariantsByCompany } from "@/services/product-service";
import { useQuery } from "@tanstack/react-query";
import { Smartphone } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

export default function ModeratorMobilePage() {
  const { user, company } = useUser();
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>();

  // Get all products with variants for the company
  const { data: productsData } = useQuery({
    queryKey: ["products", company?.ID],
    queryFn: () => getAllProductsWithVariantsByCompany(company?.ID ?? 0),
    enabled: !!company,
  });

  // Get inventory items for the selected variant
  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
    queryKey: ["inventory-by-variant", selectedVariantId],
    queryFn: () => getInventoryByVariant(selectedVariantId!),
    enabled: !!selectedVariantId,
  });

  // Flatten all variants from all products
  const allVariants = productsData?.data?.flatMap(product => 
    product.product_variants || []
  ) || [];

  if (!user || !company) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <Helmet>
        <title>Mobile Scanner - {company.company_name}</title>
      </Helmet>
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Smartphone className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Mobile Scanner</h1>
          <p className="text-gray-600">{company.company_name}</p>
        </div>
      </div>

      {/* Product Variant Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Product Variant</CardTitle>
          <CardDescription>
            Choose a product variant to view its inventory across all locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductVariantCombobox
            variants={allVariants}
            value={selectedVariantId}
            onChange={setSelectedVariantId}
            placeholder="Search for a product variant by QR code..."
          />
        </CardContent>
      </Card>

      {/* Inventory Results */}
      {selectedVariantId && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Inventory Locations</h2>
          
          {isLoadingInventory ? (
            <div className="text-center py-8">Loading inventory...</div>
          ) : !inventoryData?.data?.length ? (
            <div className="text-center py-8 text-gray-500">
              No inventory found for this variant
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inventoryData.data.map((item: InventoryItem) => (
                <Card key={item.ID} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {item.inventory?.name || "Inventory Item"}
                    </CardTitle>
                    <CardDescription>
                      {item.name || "Product"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className={`text-lg font-bold ${
                        item.quantity > 0 
                          ? item.quantity > 10 
                            ? "text-green-600" 
                            : "text-yellow-600"
                          : "text-red-600"
                      }`}>
                        {item.quantity}
                      </span>
                    </div>
                    {item.product_variant && (
                      <div className="mt-2 text-sm text-gray-500">
                        {item.product_variant.color && (
                          <span className="mr-2">Color: {item.product_variant.color}</span>
                        )}
                        {item.product_variant.size && (
                          <span>Size: {item.product_variant.size}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 