"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ICar } from "@/interfaces";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { addCar, updateCarById } from "@/server-actions/cars";
import { uploadFile } from "@/server-actions/uploads";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Car name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  company: z.string().min(1, {
    message: "Please select a company.",
  }),
  variant: z.string().min(1, {
    message: "Please enter a variant.",
  }),
  rent_per_day: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Rent per day must be a positive number.",
    }),
  status: z.string().min(1, {
    message: "Please select a status.",
  }),
});

interface CarFormProps {
  formType: "add" | "edit";
  openCarFormDialog: boolean;
  setOpenCarFormDialog: (open: boolean) => void;
  initialData?: Partial<ICar>;
  onSuccess?: () => Promise<void>;
}

function CardForm({
  formType,
  openCarFormDialog,
  setOpenCarFormDialog,
  initialData,
  onSuccess,
}: CarFormProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [existingImages, setExistingImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      company: initialData?.company || "",
      variant: initialData?.variant || "",
      rent_per_day: initialData?.rent_per_day?.toString() || "",
      status: initialData?.status || "active",
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);

      // Create preview URLs for each file
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  // Load existing images when dialog opens for edit
  React.useEffect(() => {
    if (openCarFormDialog && formType === "edit" && initialData?.images) {
      setExistingImages(
        Array.isArray(initialData.images) ? initialData.images : [],
      );
      setSelectedFiles([]);
      setImagePreviews([]);
    } else if (openCarFormDialog && formType === "add") {
      setExistingImages([]);
      setSelectedFiles([]);
      setImagePreviews([]);
    }
  }, [openCarFormDialog, formType, initialData]);

  const removeImage = (index: number) => {
    // Clean up the object URL
    URL.revokeObjectURL(imagePreviews[index]);

    // Remove image from arrays
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    // Remove existing image from array
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      if (formType === "add") {
        // Upload images to Supabase storage
        const imageUrls: string[] = [];

        if (selectedFiles.length > 0) {
          for (const file of selectedFiles) {
            const uploadResponse: any = await uploadFile(file);
            if (uploadResponse.success) {
              imageUrls.push(uploadResponse.url);
            } else {
              toast.error(`Failed to upload image: ${file.name}`);
              setLoading(false);
              return;
            }
          }
        }

        // Add car with image URLs
        const response = await addCar({
          name: values.name,
          description: values.description,
          company: values.company,
          variant: values.variant,
          rent_per_day: Number(values.rent_per_day),
          status: values.status,
          images: imageUrls,
        });

        if (response.success) {
          toast.success(response.message);
          form.reset();
          // Clean up preview URLs
          imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
          setSelectedFiles([]);
          setImagePreviews([]);
          setOpenCarFormDialog(false);
          if (onSuccess) {
            await onSuccess();
          }
        } else {
          toast.error(response.message);
        }
      } else if (formType === "edit" && initialData?.id) {
        // Handle edit - use existing images or upload new ones
        let imageUrls = existingImages;

        if (selectedFiles.length > 0) {
          const newImageUrls: string[] = [];
          for (const file of selectedFiles) {
            const uploadResponse: any = await uploadFile(file);
            if (uploadResponse.success) {
              newImageUrls.push(uploadResponse.url);
            } else {
              toast.error(`Failed to upload image: ${file.name}`);
              setLoading(false);
              return;
            }
          }
          // Combine existing images with new uploaded images
          imageUrls = [...existingImages, ...newImageUrls];
        }

        // Update car
        const response = await updateCarById(initialData.id, {
          name: values.name,
          description: values.description,
          company: values.company,
          variant: values.variant,
          rent_per_day: Number(values.rent_per_day),
          status: values.status,
          images: imageUrls,
        });

        if (response.success) {
          toast.success(response.message);
          form.reset();
          // Clean up preview URLs
          imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
          setSelectedFiles([]);
          setImagePreviews([]);
          setOpenCarFormDialog(false);
          if (onSuccess) {
            await onSuccess();
          }
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      toast.error(
        `Failed to ${formType === "add" ? "add" : "update"} car. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={openCarFormDialog} onOpenChange={setOpenCarFormDialog}>
      <DialogContent className="sm:max-w-300 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {formType === "add" ? "Add New Car" : "Edit Car"}
          </DialogTitle>
          <DialogDescription>
            {formType === "add"
              ? "Fill the form below to add a new car."
              : "Update the details of the car below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Width - Car Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Toyota Camry"
                      {...field}
                      className="bg-gray-50 border border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full Width - Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter car description..."
                      {...field}
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multi-column grid layout - 4 fields per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Company */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="select">
                    <FormLabel>Company</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border border-gray-300">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="toyota">Toyota</SelectItem>
                        <SelectItem value="honda">Honda</SelectItem>
                        <SelectItem value="bmw">BMW</SelectItem>
                        <SelectItem value="mercedes">Mercedes</SelectItem>
                        <SelectItem value="audi">Audi</SelectItem>
                        <SelectItem value="hyundai">Hyundai</SelectItem>
                         <SelectItem value="kia">Kia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Variant */}
              <FormField
                control={form.control}
                name="variant"
                render={({ field }) => (
                  <FormItem className="select">
                    <FormLabel>Variant</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border border-gray-300">
                          <SelectValue placeholder="Select variant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rent Per Day */}
              <FormField
                control={form.control}
                name="rent_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent Per Day (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 50"
                        {...field}
                        className="bg-gray-50 border border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="select">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border border-gray-300">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images Upload */}
            <FormItem>
              <FormLabel>Car Images</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="bg-gray-50 border border-gray-300"
                />
              </FormControl>

              {/* Existing Images (Edit Mode) */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Existing images ({existingImages.length}):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                      >
                        <img
                          src={image}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-32 object-cover group-hover:opacity-60 transition-opacity duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Trash2 className="w-6 h-6 text-red-500 hover:text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Selected Images */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    New images ({imagePreviews.length}):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover group-hover:opacity-60 transition-opacity duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Trash2 className="w-6 h-6 text-red-500 hover:text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FormItem>

            {/* Dialog Footer with Buttons */}
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenCarFormDialog(false);
                  form.reset();
                  // Clean up preview URLs
                  imagePreviews.forEach((preview) =>
                    URL.revokeObjectURL(preview),
                  );
                  setSelectedFiles([]);
                  setImagePreviews([]);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </div>
                ) : formType === "add" ? (
                  "Add Car"
                ) : (
                  "Update Car"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CardForm;
