"use client";

import { useEffect, useState } from "react";

export function TagListField({
  label,
  value,
  onCommit,
  placeholder,
}: {
  label: string;
  value: string[];
  onCommit: (items: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value.join(", "));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setText(value.join(", "));
  }, [value, isEditing]);

  return (
    <label className="profile-field">
      <span>{label}</span>
      <input
        value={text}
        placeholder={placeholder}
        onChange={(event) => {
          setIsEditing(true);
          setText(event.target.value);
        }}
        onBlur={() => {
          const items = text.split(",").map((item) => item.trim()).filter(Boolean);
          onCommit(items);
          setText(items.join(", "));
          setIsEditing(false);
        }}
      />
    </label>
  );
}
