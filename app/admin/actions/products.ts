"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    throw new Error("Non autorizzato");
  }
  return user;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const nameIt = formData.get("name_it") as string;
  const slug = slugify(nameIt) || `product-${Date.now()}`;

  const { error } = await supabase.from("products").insert({
    name_it: nameIt,
    name_en: (formData.get("name_en") as string) || null,
    name_fr: (formData.get("name_fr") as string) || null,
    name_es: (formData.get("name_es") as string) || null,
    slug,
    category_id: parseInt(formData.get("category_id") as string),
    price: parseFloat(formData.get("price") as string) || 0,
    wholesale_price: parseFloat(formData.get("wholesale_price") as string) || null,
    stock_quantity: parseInt(formData.get("stock_quantity") as string) || 0,
    sku: (formData.get("sku") as string) || null,
    ean13: (formData.get("ean13") as string) || null,
    brand: (formData.get("brand") as string) || null,
    weight: parseFloat(formData.get("weight") as string) || null,
    width: parseFloat(formData.get("width") as string) || null,
    height: parseFloat(formData.get("height") as string) || null,
    depth: parseFloat(formData.get("depth") as string) || null,
    description_it: (formData.get("description_it") as string) || null,
    description_en: (formData.get("description_en") as string) || null,
    description_short_it: (formData.get("description_short_it") as string) || null,
    description_short_en: (formData.get("description_short_en") as string) || null,
    image_url: (formData.get("image_url") as string) || null,
    meta_title: (formData.get("meta_title") as string) || null,
    meta_description: (formData.get("meta_description") as string) || null,
    active: formData.get("active") === "on",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(id: number, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const nameIt = formData.get("name_it") as string;
  const slug = slugify(nameIt) || `product-${id}`;

  const { error } = await supabase
    .from("products")
    .update({
      name_it: nameIt,
      name_en: (formData.get("name_en") as string) || null,
      name_fr: (formData.get("name_fr") as string) || null,
      name_es: (formData.get("name_es") as string) || null,
      slug,
      category_id: parseInt(formData.get("category_id") as string),
      price: parseFloat(formData.get("price") as string) || 0,
      wholesale_price: parseFloat(formData.get("wholesale_price") as string) || null,
      stock_quantity: parseInt(formData.get("stock_quantity") as string) || 0,
      sku: (formData.get("sku") as string) || null,
      ean13: (formData.get("ean13") as string) || null,
      brand: (formData.get("brand") as string) || null,
      weight: parseFloat(formData.get("weight") as string) || null,
      width: parseFloat(formData.get("width") as string) || null,
      height: parseFloat(formData.get("height") as string) || null,
      depth: parseFloat(formData.get("depth") as string) || null,
      description_it: (formData.get("description_it") as string) || null,
      description_en: (formData.get("description_en") as string) || null,
      description_short_it: (formData.get("description_short_it") as string) || null,
      description_short_en: (formData.get("description_short_en") as string) || null,
      image_url: (formData.get("image_url") as string) || null,
      meta_title: (formData.get("meta_title") as string) || null,
      meta_description: (formData.get("meta_description") as string) || null,
      active: formData.get("active") === "on",
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");
  redirect("/admin/products");
}

export async function toggleProductActive(id: number, active: boolean) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ active })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}
