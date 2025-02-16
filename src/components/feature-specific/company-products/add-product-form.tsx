import { RootState } from "@/app/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  CreateProductSchema,
  createProductSchema,
  productDefaultValues,
} from "@/schemas/product";
import { createProduct } from "@/services/product-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export default function () {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const company = useSelector((state: RootState) => state.company.company);
  const { toast } = useToast();
  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      company_id: company?.ID ?? 0,
      ...productDefaultValues,
    },
  });

  const createProductHandler = async (data: CreateProductSchema) => {
    setLoading(true);
    try {
      const response = await createProduct(data);
      if (response.data) {
        toast({
          title: "Product Created",
          description: "Product was created successfully!",
        });
        setIsOpen(false);
      }
      form.reset(productDefaultValues);
    } catch (e: any) {
      // toast({
      //   title: "Error Creating Product",
      //   description: e,
      //   variant: "destructive",
      // });
      console.log(e);
    } finally {
      setLoading(false);
      location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Define your company's product.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <FormField
              name="first_price"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="franchise_price"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Franchise Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="price"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="sizes"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sizes</FormLabel>
                <FormControl className="w-full">
                  <Input
                    {...field}
                    value={field.value?.join(", ") || ""}
                    placeholder="Sizes"
                    onChange={(e) => {
                      const input = e.target.value;
                      const inputList = input
                        .split(",")
                        .map((size) =>
                          Number.isNaN(Number(size.trim()))
                            ? null
                            : Number(size.trim())
                        );
                      const uniqueSizes = Array.from(new Set(inputList));
                      field.onChange(uniqueSizes);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {(form.getValues("sizes") as [])?.map((size, index) => (
                    <Badge key={index} className="mr-1">
                      {(size as number).toString()}
                    </Badge>
                  ))}
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="colors"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colors</FormLabel>
                <FormControl className="w-full">
                  <Input
                    {...field}
                    placeholder="Colors"
                    value={field.value?.join(", ") || ""}
                    onChange={(e) => {
                      const inputList = e.target.value
                        .split(",")
                        .map((color) => color.trim());
                      const uniqueSizes = Array.from(new Set(inputList));
                      return field.onChange(uniqueSizes);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {(form.getValues("colors") as string[])?.map(
                    (color, index) => (
                      <Badge key={index} className="mr-1">
                        {color}
                      </Badge>
                    )
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
          <Button
            disabled={loading}
            onClick={form.handleSubmit(createProductHandler)}
          >
            {loading ? (
              <>
                <Loader2 />
                Saving...
              </>
            ) : (
              <>
                <Check />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
