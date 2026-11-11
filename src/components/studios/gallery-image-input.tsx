"use client";
import * as React from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
export function cleanGalleryImages(images: string[]) {
  const cleaned = images
    .map((url) => url.trim())
    .filter((url) => url !== "");
  return Array.from(new Set(cleaned));
}
export function GalleryImageInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function setRow(index: number, url: string) {
    onChange(value.map((current, i) => (i === index ? url : current)));
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="gallery-image-0">Gallery Images</Label>
      {value.map((url, index) => (
        <div key={index} className="flex gap-2">
          <Input
            id={index === 0 ? "gallery-image-0" : undefined}
            name={`galleryImage-${index}`}
            type="url"
            inputMode="url"
            placeholder={
              index === 0
                ? "https://example.com/studio-cover.jpg"
                : "https://example.com/another-angle.jpg"
            }
            aria-label={`Gallery image ${index + 1}`}
            aria-describedby={index === 0 ? "gallery-hint" : undefined}
            value={url}
            onChange={(e) => setRow(index, e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              if (value.length > 1) {
                onChange(value.filter((_, i) => i !== index));
              }
            }}
            disabled={value.length <= 1}
            aria-label={`Remove gallery image ${index + 1}`}
          >
            <XIcon />
          </Button>
        </div>
      ))}
      <p id="gallery-hint" className="text-xs text-muted-foreground">
        The first image is the cover used across the marketplace.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...value, ""])}
      >
        <PlusIcon />
        Add Image
      </Button>
    </div>
  );
}