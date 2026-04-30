"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface Category {
  id: number;
  name_it: string;
  slug: string;
}

interface Stove {
  id: number;
  nameIt: string;
}

interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
  alt_text: string | null;
}

interface ProductData {
  id?: number;
  name_it: string;
  name_en: string | null;
  name_fr: string | null;
  name_es: string | null;
  category_id: number;
  price: number;
  stock_quantity: number;
  sku: string | null;
  ean13: string | null;
  brand: string | null;
  weight: number | null;
  width: number | null;
  height: number | null;
  depth: number | null;
  description_it: string | null;
  description_en: string | null;
  description_fr: string | null;
  description_es: string | null;
  description_short_it: string | null;
  description_short_en: string | null;
  description_short_fr: string | null;
  description_short_es: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  active: boolean;
}

const emptyProduct: ProductData = {
  name_it: "",
  name_en: null,
  name_fr: null,
  name_es: null,
  category_id: 0,
  price: 0,
  stock_quantity: 0,
  sku: null,
  ean13: null,
  brand: null,
  weight: null,
  width: null,
  height: null,
  depth: null,
  description_it: null,
  description_en: null,
  description_fr: null,
  description_es: null,
  description_short_it: null,
  description_short_en: null,
  description_short_fr: null,
  description_short_es: null,
  image_url: null,
  meta_title: null,
  meta_description: null,
  active: true,
};

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-1.5">
      {children}
    </label>
  );
}

function Input({
  name,
  defaultValue,
  type = "text",
  placeholder,
  required,
  step,
}: {
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      required={required}
      step={step}
      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
    />
  );
}

function Textarea({
  name,
  defaultValue,
  rows = 4,
  placeholder,
}: {
  name: string;
  defaultValue?: string | null;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      name={name}
      defaultValue={defaultValue ?? ""}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all resize-y"
    />
  );
}

export default function ProductForm({
  product,
  categories,
  stoves = [],
  selectedStoveIds = [],
  action,
  submitLabel,
  productImages = [],
}: {
  product?: ProductData;
  categories: Category[];
  stoves?: Stove[];
  selectedStoveIds?: number[];
  action: (prevState: { error?: string } | null, formData: FormData) => Promise<{ error?: string } | null>;
  submitLabel: string;
  productImages?: ProductImage[];
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const p = product || emptyProduct;

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Names */}
      <section className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Nome prodotto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name_it">Nome (IT) *</Label>
            <Input name="name_it" defaultValue={p.name_it} required placeholder="Nome del prodotto" />
          </div>
          <div>
            <Label htmlFor="name_en">Nome (EN)</Label>
            <Input name="name_en" defaultValue={p.name_en} placeholder="Product name" />
          </div>
          <div>
            <Label htmlFor="name_fr">Nome (FR)</Label>
            <Input name="name_fr" defaultValue={p.name_fr} placeholder="Nom du produit" />
          </div>
          <div>
            <Label htmlFor="name_es">Nome (ES)</Label>
            <Input name="name_es" defaultValue={p.name_es} placeholder="Nombre del producto" />
          </div>
        </div>
      </section>

      {/* Category, Price, Stock */}
      <section className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Dettagli</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category_id">Categoria *</Label>
            <select
              name="category_id"
              defaultValue={p.category_id || ""}
              required
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            >
              <option value="" disabled>Seleziona...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name_it}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="price">Prezzo (€) *</Label>
            <Input name="price" type="number" step="0.01" defaultValue={p.price} required />
          </div>
          <div>
            <Label htmlFor="stock_quantity">Quantità in stock *</Label>
            <Input name="stock_quantity" type="number" defaultValue={p.stock_quantity} required />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input name="sku" defaultValue={p.sku} placeholder="Codice SKU" />
          </div>
          <div>
            <Label htmlFor="ean13">EAN13</Label>
            <Input name="ean13" defaultValue={p.ean13} placeholder="Codice a barre" />
          </div>
          <div>
            <Label htmlFor="brand">Marca</Label>
            <Input name="brand" defaultValue={p.brand} placeholder="Es. EBM, Cadel..." />
          </div>
        </div>
      </section>

      {/* Dimensions */}
      <section className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Dimensioni e peso</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input name="weight" type="number" step="0.01" defaultValue={p.weight} />
          </div>
          <div>
            <Label htmlFor="width">Largh. (cm)</Label>
            <Input name="width" type="number" step="0.01" defaultValue={p.width} />
          </div>
          <div>
            <Label htmlFor="height">Alt. (cm)</Label>
            <Input name="height" type="number" step="0.01" defaultValue={p.height} />
          </div>
          <div>
            <Label htmlFor="depth">Prof. (cm)</Label>
            <Input name="depth" type="number" step="0.01" defaultValue={p.depth} />
          </div>
        </div>
      </section>

      {/* Descriptions */}
      <section className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Descrizioni</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="description_short_it">Descrizione breve (IT)</Label>
            <Textarea name="description_short_it" defaultValue={p.description_short_it} rows={2} placeholder="Breve descrizione per anteprime" />
          </div>
          <div>
            <Label htmlFor="description_it">Descrizione completa (IT)</Label>
            <Textarea name="description_it" defaultValue={p.description_it} rows={5} placeholder="Descrizione dettagliata del prodotto" />
          </div>
          <div>
            <Label htmlFor="description_short_en">Short description (EN)</Label>
            <Textarea name="description_short_en" defaultValue={p.description_short_en} rows={2} placeholder="Short description for previews" />
          </div>
          <div>
            <Label htmlFor="description_en">Full description (EN)</Label>
            <Textarea name="description_en" defaultValue={p.description_en} rows={5} placeholder="Detailed product description" />
          </div>
          <div>
            <Label htmlFor="description_short_fr">Description courte (FR)</Label>
            <Textarea name="description_short_fr" defaultValue={p.description_short_fr} rows={2} placeholder="Courte description pour les aperçus" />
          </div>
          <div>
            <Label htmlFor="description_fr">Description complète (FR)</Label>
            <Textarea name="description_fr" defaultValue={p.description_fr} rows={5} placeholder="Description détaillée du produit" />
          </div>
          <div>
            <Label htmlFor="description_short_es">Descripción corta (ES)</Label>
            <Textarea name="description_short_es" defaultValue={p.description_short_es} rows={2} placeholder="Descripción corta para vistas previas" />
          </div>
          <div>
            <Label htmlFor="description_es">Descripción completa (ES)</Label>
            <Textarea name="description_es" defaultValue={p.description_es} rows={5} placeholder="Descripción detallada del producto" />
          </div>
        </div>
      </section>

      {/* Compatible Stoves */}
      {stoves.length > 0 && (
        <section className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-foreground mb-1">Compatibile con</h2>
          <p className="text-sm text-muted mb-4">Seleziona le stufe compatibili con questo prodotto</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {stoves.map((s) => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-background transition-colors">
                <input
                  type="checkbox"
                  name="compatible_stove_ids"
                  value={s.id}
                  defaultChecked={selectedStoveIds.includes(s.id)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20"
                />
                <span className="text-sm text-foreground">{s.nameIt}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Images */}
      <section className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Immagini</h2>
        <ImageUploader
          productId={product?.id}
          categoryId={p.category_id || undefined}
          categories={categories.map((c) => ({ id: c.id, name_it: c.name_it, slug: c.slug }))}
          initialImages={productImages}
        />
      </section>

      {/* SEO */}
      <section className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">SEO</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="meta_title">Meta title</Label>
            <Input name="meta_title" defaultValue={p.meta_title} />
          </div>
          <div>
            <Label htmlFor="meta_description">Meta description</Label>
            <Input name="meta_description" defaultValue={p.meta_description} />
          </div>
        </div>
      </section>

      {/* Active toggle + Submit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            defaultChecked={p.active}
            className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20"
          />
          <span className="text-sm font-medium text-foreground">Prodotto attivo (visibile nel catalogo)</span>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none shrink-0"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Salvataggio..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
