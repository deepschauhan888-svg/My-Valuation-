"use client";

import { LiveCategory, PropertyInput } from "@/lib/types";
import { Trash2 } from "lucide-react";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-navy-400 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gold/40";

export default function PropertyForm({
  value,
  onChange,
  categories,
  isComparable,
  onRemove,
}: {
  value: PropertyInput;
  onChange: (next: PropertyInput) => void;
  categories: LiveCategory[];
  isComparable?: boolean;
  onRemove?: () => void;
}) {
  function set<K extends keyof PropertyInput>(key: K, v: PropertyInput[K]) {
    onChange({ ...value, [key]: v });
  }

  function setAttr(key: string, v: string) {
    onChange({ ...value, attributes: { ...value.attributes, [key]: v } });
  }

  // "loadFactor" and "floor" are derived from area/carpet and floor/totalFloors
  // respectively — they don't get their own input control here.
  const dynamicCategories = categories.filter((c) => c.key !== "loadFactor" && c.key !== "floor" && c.isActive);

  return (
    <div className="card-surface p-6 space-y-5">
      <div className="flex items-center justify-between">
        <input
          value={value.label}
          onChange={(e) => set("label", e.target.value)}
          className="font-display font-semibold text-base bg-transparent focus:outline-none border-b border-transparent focus:border-line dark:focus:border-line-dark"
        />
        {isComparable && onRemove && (
          <button onClick={onRemove} className="text-navy-400 hover:text-discount transition-colors tap-feedback" aria-label="Remove comparable">
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <Field label="Society / Project">
        <input className={inputClass} value={value.society} onChange={(e) => set("society", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Super Built-up Area (sqft)">
          <input
            type="number"
            className={inputClass}
            value={value.superBuiltUpAreaSqft}
            onChange={(e) => set("superBuiltUpAreaSqft", Number(e.target.value))}
          />
        </Field>
        <Field label="Carpet Area (sqft)">
          <input
            type="number"
            className={inputClass}
            value={value.carpetAreaSqft}
            onChange={(e) => set("carpetAreaSqft", Number(e.target.value))}
          />
        </Field>
      </div>

      {isComparable && (
        <Field label="Sale / Asking Price (₹)">
          <input
            type="number"
            className={inputClass}
            value={value.salePrice ?? 0}
            onChange={(e) => set("salePrice", Number(e.target.value))}
          />
        </Field>
      )}

      <Field label="Floor / Total Floors">
        <div className="flex gap-2">
          <input
            type="number"
            className={inputClass}
            value={value.floorNumber}
            onChange={(e) => set("floorNumber", Number(e.target.value))}
          />
          <input
            type="number"
            className={inputClass}
            value={value.totalFloors}
            onChange={(e) => set("totalFloors", Number(e.target.value))}
          />
        </div>
      </Field>

      {/* Every other field below is driven entirely by the city's live rule
          categories — nothing here is hardcoded to a specific factor. */}
      <div className="grid grid-cols-2 gap-4">
        {dynamicCategories.map((cat) => (
          <Field key={cat.id} label={cat.label}>
            {cat.kind === "matrix" ? (
              <select className={inputClass} value={value.attributes[cat.key] ?? ""} onChange={(e) => setAttr(cat.key, e.target.value)}>
                {cat.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : cat.kind === "flat" && cat.valueType === "boolean" ? (
              <label className="flex items-center gap-2 h-10 text-sm">
                <input
                  type="checkbox"
                  checked={value.attributes[cat.key] === "true"}
                  onChange={(e) => setAttr(cat.key, e.target.checked ? "true" : "false")}
                  className="accent-discount"
                />
                Flagged
              </label>
            ) : (
              <input
                type="number"
                className={inputClass}
                value={value.attributes[cat.key] ?? ""}
                onChange={(e) => setAttr(cat.key, e.target.value)}
              />
            )}
          </Field>
        ))}
      </div>
    </div>
  );
}
