"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  NumberInput,
  Textarea,
  TextInput,
  LoadingOverlay,
  Box,
  Group,
  Text,
  SimpleGrid,
  Image,
  FileInput,
  ColorInput,
  Code,
  Select,
  MultiSelect,
} from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import JoditEditor from "jodit-react";
import {
  createProduct,
  getParentsandCategories,
  getSingleProductById,
} from "@/lib/database/actions/vendor/products/products.actions";
import { getSubCategoriesByCategoryParent } from "@/lib/database/actions/vendor/subCategories/subcategories.actions";
import { getVendorCookiesandFetchVendor } from "@/lib/database/actions/vendor/vendor.actions";
import { MdDelete } from "react-icons/md";
import { IoAdd } from "react-icons/io5";

interface FormValues {
  name: string;
  description: string;
  brand: string;
  sku: string;
  discount: number;
  imageFiles: File[];
  longDescription: string;
  color: {
    color: string;
    image: File | null;
  };
  parent: string;
  category: string;
  subCategories: string[];
  sizes: { size: string; qty: string; price: string }[];
  benefits: { name: string }[];
  ingredients: { name: string }[];
  questions: { question: string; answer: string }[];
  shippingFee: string;
  details: { name: string; value: string }[];
}
const CreateProductPage = () => {
  const [images, setImages] = useState<string[]>([]);
  const [colorImagePreview, setColorImagePreview] = useState<string []>([]);
  const [parents, setParents] = useState<{ _id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [subs, setSubs] = useState<any>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const editor = useRef(null);

  useEffect(() => {
    try {
      const fetchVendorDetails = async () => {
        try {
          await getVendorCookiesandFetchVendor().then((res) => {
            if (res?.success) {
              setVendor(res?.vendor);
              setLoading(false);
            }
          });
        } catch (error: any) {
          console.log(error);
        }
      };
      fetchVendorDetails();
    } catch (error: any) {
      console.log(error);
    }
  }, []);
  // initialize mantine form

  const form = useForm<FormValues>({
    initialValues: {
      name: "",
      description: "",
      brand: "",
      sku: "",
      discount: 0,
      imageFiles: [],
      longDescription: "",
      color: {
        color: "",
        image: null,
      },
      parent: "",
      category: "",
      subCategories: [],
      sizes: [{ size: "", qty: "", price: "" }],
      benefits: [{ name: "" }],
      ingredients: [{ name: "" }],
      questions: [{ question: "", answer: "" }],
      shippingFee: "",
      details: [{ name: "", value: "" }],
    },
    validate: {
      name: hasLength({ min: 10, max: 100 }, "Must be at least 10 characters."),
      description: hasLength(
        { min: 10, max: 100 },
        "Must be at least 10 characters."
      ),

      imageFiles: (value) =>
        value.length === 0 ? "You must upload at least one image." : null,
      color: {
        color: (value: string) =>
          value === "" ? "You must select a color" : null,
        image: (value: File | null) =>
          value === null ? "You must upload an image for the color." : null,
      },
    },
  });
  const handleImageChange = useCallback(
    (files: File[]) => {
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setImages(previewUrls);
      form.setFieldValue("imageFiles", files);
    },
    [form]
  );
  const handleColorImageChange = useCallback(
    (file: File | null) => {
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        form.setFieldValue("color.image", file);
        setColorImagePreview([previewUrl]);
      }
    },
    [form]
  );
  // handle Submit function:
// Replace your current handleSubmit with this:
const handleSubmit = async (values: FormValues) => {
  if (!vendor) return alert("Vendor not loaded");
  setLoading(true);

  try {
    // Upload product images
    const uploadedImages = [];
    for (const file of values.imageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "website");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      uploadedImages.push({ url: data.secure_url, public_id: data.public_id });
    }

    // Upload color image
    let colorUrl = "";
    if (values.color.image) {
      const colorFormData = new FormData();
      colorFormData.append("file", values.color.image);
      colorFormData.append("upload_preset", "website");

      const colorRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: colorFormData }
      );
      const colorData = await colorRes.json();
      colorUrl = colorData.secure_url;
    }

    // Submit to backend
    const productDetails = {
      ...values,
      images: uploadedImages,
      color: { color: values.color.color, image: colorUrl },
    };

    const res = await createProduct(
      vendor._id,
      productDetails.sku,
      productDetails.color,
      productDetails.images,
      productDetails.sizes,
      productDetails.discount,
      productDetails.name,
      productDetails.description,
      productDetails.longDescription,
      productDetails.brand,
      productDetails.details,
      productDetails.questions,
      productDetails.category,
      productDetails.subCategories,
      productDetails.benefits,
      productDetails.ingredients,
      productDetails.parent
    );

    if (res.success) alert(res.message || "Product created successfully");
    else alert(res.message || "Error creating product");
  } catch (err) {
    console.error(err);
    alert("Error uploading product");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getParentsandCategories()
          .then((res) => {
            if (res?.success) {
              setParents(res?.parents || []);
              setCategories(res?.categories || []);
            }
          })
          .catch((err) => alert(err));
      } catch (error) {
        alert(error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const getSubs = async () => {
      try {
        await getSubCategoriesByCategoryParent(
          form.values.category.length > 1
            ? form.values.category
            : form.values.category[0]
        )
          .then((res) => {
            if (res?.success) {
              setSubs(res?.results);
            }
          })
          .catch((err) => alert(err));
      } catch (error) {
        alert(error);
      }
    };

    if (form.values.category !== "") {
      getSubs();
    }
  }, [form.values.category]);

  // Functions to handle dynamic addition of fields
  const addSize = () =>
    form.insertListItem("sizes", { size: "", qty: "", price: "" });
  const addBenefit = () => form.insertListItem("benefits", { name: "" });
  const addDetail = () =>
    form.insertListItem("details", { name: "", value: "" });

  useEffect(() => {
    const fetchParentData = async () => {
      if (form.values.parent) {
        try {
          const data = await getSingleProductById(form.values.parent, 0, 0);
          form.setValues({
            ...form.values,
            name: data.name,
            description: data.description,
            brand: data.brand,
            category: data.category,
            subCategories: data.subCategories,
            questions: data.questions,
            details: data.details,
            benefits: data.benefits,
            ingredients: data.ingredients,
          });
        } catch (error) {
          console.error("Error fetching parent data:", error);
        }
      }
    };

    fetchParentData();
  }, [form.values.parent]);
  return (
  <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-md">
    <h1 className="text-2xl font-bold mb-6">Create a Product</h1>

    <Box pos="relative">
      {loading && (
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
      )}

      <form
        onSubmit={form.onSubmit((values: any) => handleSubmit(values))}
        className="space-y-10"
      >
        {/* General Info */}
        <section>
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput {...form.getInputProps("name")} label="Name" required />
            <TextInput {...form.getInputProps("brand")} label="Brand" />
            <TextInput {...form.getInputProps("sku")} label="SKU" required />
            <NumberInput
              {...form.getInputProps("discount")}
              label="Discount"
              required
            />
          </div>

          <Textarea
            {...form.getInputProps("description")}
            label="Short Description"
            placeholder="Enter product description..."
            minRows={3}
            className="mt-4"
            required
          />
        </section>

        {/* Color */}
        <section>
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Color</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorInput
              {...form.getInputProps("color.color")}
              label="Select Color"
              description="Pick a color for the product"
              required
            />
            <FileInput
              label="Color Image"
              placeholder="Choose file"
              accept="image/*"
              onChange={(file) => handleColorImageChange(file as File)}
              required
            />
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parents.length > 0 && (
              <Select
                {...form.getInputProps("parent")}
                label="Parent"
                placeholder="Select a parent"
                data={parents.map((p) => ({ value: p._id, label: p.name }))}
              />
            )}

            {categories.length > 0 && (
              <Select
                {...form.getInputProps("category")}
                label="Category"
                placeholder="Select a category"
                data={categories.map((c) => ({ value: c._id, label: c.name }))}
                required
              />
            )}
          </div>

          <MultiSelect
            {...form.getInputProps("subCategories")}
            label="Sub Categories"
            placeholder="Pick subcategories"
            data={subs.map((s: any) => ({ value: s._id, label: s.name }))}
            className="mt-4"
            required
          />
        </section>

        {/* Sizes */}
        <section>
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Sizes</h2>
          <div className="space-y-3">
            {form.values.sizes.map((item, index) => (
              <Group key={index} grow>
                <TextInput
                  placeholder="Size"
                  {...form.getInputProps(`sizes.${index}.size`)}
                  required
                />
                <NumberInput
                  placeholder="Quantity"
                  {...form.getInputProps(`sizes.${index}.qty`)}
                  required
                />
                <NumberInput
                  placeholder="Price"
                  {...form.getInputProps(`sizes.${index}.price`)}
                  required
                />
                <Button
                  variant="light"
                  onClick={addSize}
                  className="shrink-0"
                >
                  <IoAdd size={20} />
                </Button>
                <Button
                  color="red"
                  variant="light"
                  onClick={() => form.removeListItem("sizes", index)}
                  className="shrink-0"
                >
                  <MdDelete size={20} />
                </Button>
              </Group>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section>
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Benefits</h2>
          <div className="space-y-3">
            {form.values.benefits.map((item, index) => (
              <Group key={index} grow>
                <TextInput
                  placeholder="Benefit"
                  {...form.getInputProps(`benefits.${index}.name`)}
                  required
                />
                <Button variant="light" onClick={addBenefit}>
                  <IoAdd size={20} />
                </Button>
                <Button
                  color="red"
                  variant="light"
                  onClick={() => form.removeListItem("benefits", index)}
                >
                  <MdDelete size={20} />
                </Button>
              </Group>
            ))}
          </div>
        </section>

        {/* Details */}
        <section>
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Details</h2>
          <div className="space-y-3">
            {form.values.details.map((item, index) => (
              <Group key={index} grow>
                <TextInput
                  placeholder="Name"
                  {...form.getInputProps(`details.${index}.name`)}
                  required
                />
                <TextInput
                  placeholder="Value"
                  {...form.getInputProps(`details.${index}.value`)}
                  required
                />
                <Button variant="light" onClick={addDetail}>
                  <IoAdd size={20} />
                </Button>
                <Button
                  color="red"
                  variant="light"
                  onClick={() => form.removeListItem("details", index)}
                >
                  <MdDelete size={20} />
                </Button>
              </Group>
            ))}
          </div>
        </section>

        {/* Long Description */}
        <section>
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            Long Description
          </h2>
          <JoditEditor
            ref={editor}
            value={form.values.longDescription}
            onBlur={(newContent) =>
              form.setFieldValue("longDescription", newContent)
            }
          />
        </section>

        {/* Media */}
        <section>
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Media</h2>
          <FileInput
            label="Upload product images"
            placeholder="Choose files"
            multiple
            accept="image/*"
            onChange={(files) => handleImageChange(files as File[])}
            required
          />

          <SimpleGrid cols={4} spacing="md" mt="md">
          {images.map((image, index) => (
            <Box key={index}>
              <Image src={image} alt={`Uploaded image ${index + 1}`} radius="md" fit="cover" />
            </Box>
          ))}
          {colorImagePreview && (
            <Box>
              <Image src={colorImagePreview} alt="Color Image" radius="md" fit="cover" />
            </Box>
          )}
        </SimpleGrid>

        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" color="blue" className="px-6">
            {loading ? "Loading..." : "Submit"}
          </Button>
        </div>
      </form>
    </Box>
  </div>
);

};

export default CreateProductPage;
