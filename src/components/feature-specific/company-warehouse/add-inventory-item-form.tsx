import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link } from "react-router";

interface Props {
    disabled: boolean;
}
export default function ({disabled} : Props) {
  const [open, setOpen] = useState(false);
  // const [loading, setLoading] = useState(false);

  const company = useSelector((state: RootState) => state.company.company);
  const form = useForm();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus />
          Add Inventory Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Add new Inventory Item</DialogHeader>
        <DialogDescription>
          <Form {...form}>
            {company ? (
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {company.products?.map((product) => (
                          <SelectItem value={product.ID.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      You can manage your products from {" "}
                      <Link to="/examples/forms" className="underline hover:text-white">Products Dashboard</Link>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <></>
            )}
            {
                form.getValues("product") && company ? <FormField
                control={form.control}
                name="product_variant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Variant</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product variant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {company.products?.find(product => product.ID == parseInt(form.getValues("product")))?.variants.map((v) => (
                          <SelectItem value={v.ID.toString()}>
                            {v.color} - {v.size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      You can manage your products from {" "}
                      <Link to="/examples/forms" className="underline hover:text-white">Products Dashboard</Link>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> : <></>
            }
          </Form>
        </DialogDescription>
        <DialogFooter>
          <Button variant={"outline"}>Cancel</Button>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
