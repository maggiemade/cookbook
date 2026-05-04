"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, X, Upload } from "lucide-react";
import Image from "next/image";

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ photos, onChange, maxPhotos = 5 }: Props) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (photos.length >= maxPhotos) return;
      setUploading(true);
      try {
        const urls: string[] = [];
        for (const file of files.slice(0, maxPhotos - photos.length)) {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (data.url) urls.push(data.url);
        }
        onChange([...photos, ...urls]);
      } finally {
        setUploading(false);
      }
    },
    [photos, onChange, maxPhotos]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: maxPhotos - photos.length,
    disabled: uploading || photos.length >= maxPhotos,
  });

  const remove = (url: string) => onChange(photos.filter((p) => p !== url));

  return (
    <div className="space-y-3">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url) => (
            <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden group">
              <Image src={url} alt="Recipe photo" fill className="object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <div
          {...getRootProps()}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
          style={{
            borderColor: isDragActive ? "var(--rose)" : "var(--border)",
            background: isDragActive ? "var(--rose-light)" : "transparent",
          }}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Uploading...
            </div>
          ) : (
            <>
              <div className="flex gap-2" style={{ color: "var(--text-muted)" }}>
                <Camera size={18} />
                <Upload size={18} />
              </div>
              <span className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                {isDragActive ? "Drop here" : "Tap to add photo or drag & drop"}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
