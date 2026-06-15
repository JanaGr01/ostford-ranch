"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type GalleryImage = {
  id: string;
  horse_id: string;
  image_url: string;
  image_path: string;
  caption: string | null;
  created_at: string | null;
};

type HorseGalleryProps = {
  horseId: string;
};

export default function HorseGallery({ horseId }: HorseGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadGalleryImages() {
      const { data, error } = await supabase
        .from("horse_gallery_images")
        .select("id, horse_id, image_url, image_path, caption, created_at")
        .eq("horse_id", horseId)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setImages(data || []);
      setIsLoading(false);
    }

    loadGalleryImages();
  }, [horseId]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Please choose an image first.");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    const fileExtension = selectedFile.name.split(".").pop() || "jpg";
    const filePath = `gallery/${horseId}/${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("horse-images")
      .upload(filePath, selectedFile);

    if (uploadError) {
      setErrorMessage(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("horse-images")
      .getPublicUrl(filePath);

    const { data: insertedImage, error: insertError } = await supabase
      .from("horse_gallery_images")
      .insert({
        horse_id: horseId,
        image_url: publicUrlData.publicUrl,
        image_path: filePath,
        caption: caption.trim() || null,
      })
      .select("id, horse_id, image_url, image_path, caption, created_at")
      .single();

    if (insertError) {
      setErrorMessage(insertError.message);
      setIsUploading(false);
      return;
    }

    setImages((currentImages) =>
      insertedImage ? [insertedImage, ...currentImages] : currentImages
    );

    setSelectedFile(null);
    setCaption("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsUploading(false);
  }

  async function handleDelete(image: GalleryImage) {
    const confirmed = confirm("Are you sure you want to delete this image?");

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    const { error: storageError } = await supabase.storage
      .from("horse-images")
      .remove([image.image_path]);

    if (storageError) {
      setErrorMessage(storageError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from("horse_gallery_images")
      .delete()
      .eq("id", image.id);

    if (deleteError) {
      setErrorMessage(deleteError.message);
      return;
    }

    setImages((currentImages) =>
      currentImages.filter((currentImage) => currentImage.id !== image.id)
    );
  }

  return (
    <section className="rounded-3xl bg-[#FFFAF2] p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-semibold">Gallery</h2>
          <p className="mt-2 text-sm text-[#7A6A5A]">
            Add extra photos for this horse.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleUpload}
        className="mb-8 rounded-2xl border border-[#E5D6C4] bg-white p-5"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] || null)
              }
              className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Caption</span>
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              placeholder="Optional caption"
            />
          </label>

          <button
            type="submit"
            disabled={isUploading}
            className="rounded-full bg-[#5B3A29] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3f281c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Add Image"}
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-[#7A6A5A]">Loading gallery...</p>
      ) : images.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-3xl border border-[#E5D6C4] bg-white"
            >
              <img
                src={image.image_url}
                alt={image.caption || "Horse gallery image"}
                className="h-56 w-full object-cover"
              />

              <div className="p-4">
                {image.caption ? (
                  <p className="text-sm text-[#4A3A2D]">{image.caption}</p>
                ) : (
                  <p className="text-sm italic text-[#9A8B7A]">No caption</p>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(image)}
                  className="mt-4 rounded-full px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Delete Image
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D9C7B2] p-8 text-center text-sm text-[#7A6A5A]">
          No gallery images yet.
        </div>
      )}
    </section>
  );
}