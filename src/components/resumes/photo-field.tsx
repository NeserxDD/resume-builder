"use client";

import { useRef } from "react";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function PhotoField({
  photoUrl,
  onSelect,
  onClear,
}: {
  photoUrl?: string;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="editor-sub-block photo-upload-block">
      <p className="editor-sub-label">Profile photo (optional)</p>
      <div className="photo-upload-row">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="photo-thumbnail" src={photoUrl} alt="" />
        ) : null}
        <label className="button-primary photo-upload-button">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (!ACCEPTED.includes(file.type)) {
                window.alert("Please choose a JPEG, PNG, or WebP image.");
                event.target.value = "";
                return;
              }
              if (file.size > MAX_BYTES) {
                window.alert("Photos must be smaller than 2 MB.");
                event.target.value = "";
                return;
              }
              onSelect(file);
            }}
          />
          {photoUrl ? "Change photo" : "Choose photo…"}
        </label>
        {photoUrl ? (
          <button className="outline-action" type="button" onClick={() => { if (inputRef.current) inputRef.current.value = ""; onClear(); }}>
            Remove
          </button>
        ) : null}
      </div>
      <p className="profile-help">This template supports a photo. It is used for this session only and is never saved to your account or included in saved data.</p>
    </div>
  );
}
