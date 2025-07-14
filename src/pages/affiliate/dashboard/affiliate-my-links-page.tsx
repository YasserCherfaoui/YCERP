import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import useAffiliate from "@/hooks/use-affiliate";
import { useToast } from "@/hooks/use-toast";
import { AffiliateProp, Product } from "@/models/data/product.model";
import { getAffiliateProducts } from "@/services/affiliate-service";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Copy, Loader2, Palette } from "lucide-react";

export default function AffiliateMyLinksPage() {
  const { affiliate } = useAffiliate();
  const { toast } = useToast();

  const {
    data: productsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["affiliate-products"],
    queryFn: getAffiliateProducts,
    enabled: !!affiliate,
  });

  const handleCopyLink = async (affiliateProp: AffiliateProp) => {
    if (!affiliate?.slug) {
      toast({
        title: "Error",
        description: "Affiliate slug not found",
        variant: "destructive",
      });
      return;
    }

    const linkWithRef = `${affiliateProp.product_link}?ref=${affiliate.slug}`;

    try {
      await navigator.clipboard.writeText(linkWithRef);
      toast({
        title: "Link Copied!",
        description: "Product link has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyWebsiteLink = async () => {
    if (!affiliate?.slug) {
      toast({
        title: "Error",
        description: "Affiliate slug not found",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(websiteReferralUrl);
      toast({
        title: "Referral Link Copied!",
        description: "Website referral link has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleOpenCreatives = (affiliateProp: AffiliateProp) => {
    if (affiliateProp.creatives_link) {
      window.open(affiliateProp.creatives_link, "_blank");
    } else {
      toast({
        title: "No Creatives",
        description: "No creatives available for this product",
        variant: "destructive",
      });
    }
  };

  // Extract all affiliate props from products
  const affiliateProps: AffiliateProp[] = [];
  productsData?.data?.forEach((product: Product) => {
    if (product.affiliate_props) {
      affiliateProps.push(...product.affiliate_props);
    }
  });

  // Get company name from affiliate data
  const companyName = affiliate?.company?.company_name || "Our";
  const websiteReferralUrl = affiliate?.slug
    ? `${affiliate.company?.woo_company?.woo_url}?ref=${affiliate.slug}`
    : "";

  if (isLoading) {
    return (
      <div className="affiliate-theme min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-lg font-medium">
                Loading your products...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="affiliate-theme min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <span className="text-lg font-medium">
                {error instanceof Error
                  ? error.message
                  : "Failed to load products"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-theme min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Links & Products
          </h1>
          <p className="text-gray-600">
            Browse and share your affiliate products. Copy links and access
            creative materials.
          </p>
        </div>

        {/* Website Referral Link Section */}
        <div className="mb-8">
          <Card className="rounded-2xl shadow-md border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Share your referral link to {companyName} Store
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={websiteReferralUrl}
                  readOnly
                  className="flex-1 bg-gray-50 font-mono text-sm"
                  placeholder="Loading referral link..."
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebsiteLink}
                  disabled={!websiteReferralUrl}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Share this link to earn commissions on all purchases made
                through it.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        {affiliateProps.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Palette className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Products Available
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You don't have any affiliate products assigned yet. Contact your
              affiliate manager to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {affiliateProps.map((affiliateProp) => (
              <ProductCard
                key={affiliateProp.ID}
                affiliateProp={affiliateProp}
                onCopyLink={handleCopyLink}
                onOpenCreatives={handleOpenCreatives}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProductCardProps {
  affiliateProp: AffiliateProp;
  onCopyLink: (affiliateProp: AffiliateProp) => void;
  onOpenCreatives: (affiliateProp: AffiliateProp) => void;
}

function ProductCard({
  affiliateProp,
  onCopyLink,
  onOpenCreatives,
}: ProductCardProps) {
  const product = affiliateProp.product;
  const productImages = affiliateProp.images || [];

  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-md border hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Image Carousel */}
        <div className="rounded-xl overflow-hidden">
          {productImages.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {productImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square">
                      <img
                        src={image.image_url}
                        alt={`${product?.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.jpg"; // Fallback image
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {productImages.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Palette className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No Image</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Name */}
        <CardTitle className="text-xl font-semibold mt-4 text-center px-4">
          {affiliateProp.name || product?.name || "Unnamed Product"}
        </CardTitle>

        {/* Commission Badge */}
        <div className="text-center mt-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {new Intl.NumberFormat("en-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(affiliateProp.commission)}{" "}
            Commission
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center px-4 py-2">
        <Button
          variant="outline"
          onClick={() => onOpenCreatives(affiliateProp)}
          className="gap-2 flex-1 mr-2"
        >
          <Palette className="h-4 w-4" />
          Creatives
        </Button>

        <Button
          variant="ghost"
          onClick={() => onCopyLink(affiliateProp)}
          className="gap-2 flex-1 ml-2"
        >
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>
      </CardFooter>
    </Card>
  );
}
