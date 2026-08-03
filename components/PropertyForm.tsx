"use client";

import { PropertyInput, ConstructionStatus, PropertyCondition, Furnishing, Facing, UnitType } from "@/lib/types";
import { Trash2 } from "lucide-react";

const UNIT_TYPES: UnitType[] = ["studio", "1bhk", "2bhk", "3bhk", "4bhk", "villa"];
const STATUSES: ConstructionStatus[] = ["under-construction", "new-launch", "ready-to-move"];
const CONDITIONS: PropertyCondition[] = ["needs-repair", "average", "good", "excellent"];
const FURNISHINGS: Furnishing[] = ["unfurnished", "semi-furnished", "fully-furnished"];
const FACINGS: Facing[] = ["north", "north-east", "east", "west", "south-west", "south", "other"];

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
  isComparable,
  onRemove,
}: {
  value: PropertyInput;
  onChange: (next: PropertyInput) => void;
  isComparable?: boolean;
  onRemove?: () => void;
}) {
  function set<K extends keyof PropertyInput>(key: K, v: PropertyInput[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="card-surface p-6 space-y-5">
      <div className="flex items-center justify-between">
        <input
          value={value.label}
          onChange={(e) => set("label", e.target.value)}
          className="font-display font-semibold text-base bg-transparent focus:outline-none border-b border-transparent focus:border-line dark:focus:border-line-dark"
        />
        {isComparable && onRemove && (
          <button onClick={onRemove} className="text-navy-400 hover:text-discount transition-colors" aria-label="Remove comparable">
            <Trash2 size={16}  strokeWidth={1.5}/>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Society / Project">
          <input className={inputClass} value={value.society} onChange={(e) => set("society", e.target.value)} />
        </Field>
        <Field label="City">
          <select className={inputClass} value={value.city} onChange={(e) => set("city", e.target.value)}>
            {["Mumbai", "Bengaluru", "Delhi_NCR", "Pune", "Hyderabad"].map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
        </Field>
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <Field label="Unit Type">
          <select className={inputClass} value={value.unitType} onChange={(e) => set("unitType", e.target.value as UnitType)}>
            {UNIT_TYPES.map((u) => (
              <option key={u} value={u}>
                {u.toUpperCase()}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Age (years)">
          <input type="number" className={inputClass} value={value.ageYears} onChange={(e) => set("ageYears", Number(e.target.value))} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Construction Status">
          <select
            className={inputClass}
            value={value.constructionStatus}
            onChange={(e) => set("constructionStatus", e.target.value as ConstructionStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("-", " ")}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Condition">
          <select className={inputClass} value={value.condition} onChange={(e) => set("condition", e.target.value as PropertyCondition)}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c.replace("-", " ")}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Furnishing">
          <select className={inputClass} value={value.furnishing} onChange={(e) => set("furnishing", e.target.value as Furnishing)}>
            {FURNISHINGS.map((f) => (
              <option key={f} value={f}>
                {f.replace("-", " ")}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Facing">
          <select className={inputClass} value={value.facing} onChange={(e) => set("facing", e.target.value as Facing)}>
            {FACINGS.map((f) => (
              <option key={f} value={f}>
                {f.replace("-", " ")}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <Field label="Covered Parking / Balconies">
          <div className="flex gap-2">
            <input
              type="number"
              className={inputClass}
              value={value.coveredParkingCount}
              onChange={(e) => set("coveredParkingCount", Number(e.target.value))}
            />
            <input
              type="number"
              className={inputClass}
              value={value.balconyCount}
              onChange={(e) => set("balconyCount", Number(e.target.value))}
            />
          </div>
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.hasLegalIssues}
          onChange={(e) => set("hasLegalIssues", e.target.checked)}
          className="accent-discount"
        />
        Has flagged legal / title issues
      </label>
    </div>
  );
}
