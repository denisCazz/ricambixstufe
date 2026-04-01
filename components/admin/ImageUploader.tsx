"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, GripVertical, ImageIcon } from "lucide-react";

interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
  alt_text: string | null;
}

export default function ImageUploader({
  productId,
  initialImages = [],
}: {
  productId?: number;
  initialImages?: ProductImage[];
}) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!productId) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("product_id", productId.toString());

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.image) {
        setImages((prev) => [...prev, data.image]);
      } else {
        alert(data.error || "Errore durante il caricamento");
      }
    },
    [productId]
  );

  async function handleFiles(files: FileList | File[]) {
    if (!productId) {
      alert("Salva prima il prodotto, poi potrai caricare le immagini.");
      return;
    }
    setUploading(true);
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
    setUploading(false);
  }

  async function handleDelete(imageId: number) {
    if (!confirm("Eliminare questa immagine?")) return;
    const res = await fetch("/api/upload/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId }),
    });
    const data = await res.json();
    if (data.success) {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // Assign new sort_order values
    const reordered = updated.map((img, i) => ({ ...img, sort_order: i }));
    setImages(reordered);

    // Persist order via API
    await fetch("/api/upload/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: reordered.map((img) => ({ id: img.id, sort_order: img.sort_order })),
      }),
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOverItem(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      handleReorder(dragIndex, index);
      setDragIndex(index);
    }
  }

  return (
    <div className="space-y-4">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => handleDragOverItem(e, index)}
                onDragEnd={() => setDragIndex(null)}
                className={`relative group rounded-xl border-2 overflow-hidden aspect-square bg-stone-50 dark:bg-stone-900 ${
                  index === 0
                    ? "border-accent ring-2 ring-accent/20"
                    : "border-border"
                } ${dragIndex === index ? "opacity-50" : ""}`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || ""}
                  fill
                  sizes="150px"
                  className="object-contain p-2"
                />

                {/* Main badge */}
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-accent text-white text-[10px] font-bold uppercase">
                    Principale
                  </span>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    title="Elimina"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="p-1.5 rounded-lg bg-white/80 text-stone-700 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/50 hover:bg-accent/5"
        } ${!productId ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Caricamento in corso...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            {images.length === 0 ? (
              <ImageIcon className="w-10 h-10 text-muted/40" />
            ) : (
              <Upload className="w-8 h-8 text-muted/40" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {images.length === 0
                  ? "Trascina le immagini qui"
                  : "Aggiungi altre immagini"}
              </p>
              <p className="text-xs text-muted mt-1">
                JPG, PNG, WebP o GIF — max 5 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {!productId && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Salva prima il prodotto per poter caricare le immagini.
        </p>
      )}
    </div>
  );
}
