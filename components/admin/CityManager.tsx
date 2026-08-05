"use client";

import { useState, useTransition } from "react";
import { renameCityAction, toggleCityActiveAction, deleteCityAction } from "@/lib/supabase/actions";
import { CityRow } from "@/lib/supabase/queries";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function CityManager({ cities }: { cities: CityRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function startEdit(city: CityRow) {
    setEditingId(city.id);
    setEditValue(city.name);
  }

  function saveEdit(cityId: string) {
    startTransition(async () => {
      await renameCityAction(cityId, editValue);
      setEditingId(null);
    });
  }

  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-navy-400 border-b border-line dark:border-line-dark">
            <th className="p-4 font-medium">City</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.id} className="border-b border-line dark:border-line-dark last:border-0">
              <td className="p-4">
                {editingId === city.id ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-9 px-2 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm"
                    autoFocus
                  />
                ) : (
                  <span className="font-medium">{city.name}</span>
                )}
                <span className="text-xs text-navy-400 ml-2 font-mono">/{city.slug}</span>
              </td>
              <td className="p-4">
                <button
                  onClick={() => startTransition(() => toggleCityActiveAction(city.id, !city.isActive))}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full tap-feedback ${
                    city.isActive ? "bg-premium/10 text-premium" : "bg-navy-50 dark:bg-white/5 text-navy-400"
                  }`}
                >
                  {city.isActive ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-2">
                  {editingId === city.id ? (
                    <>
                      <button onClick={() => saveEdit(city.id)} className="p-1.5 text-premium tap-feedback" aria-label="Save">
                        <Check size={15} strokeWidth={1.5} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-navy-400 tap-feedback" aria-label="Cancel">
                        <X size={15} strokeWidth={1.5} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(city)} className="p-1.5 text-navy-400 hover:text-ink dark:hover:text-paper tap-feedback" aria-label="Rename">
                        <Pencil size={15} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${city.name}? This removes all its rule categories.`)) {
                            startTransition(() => deleteCityAction(city.id));
                          }
                        }}
                        className="p-1.5 text-navy-400 hover:text-discount tap-feedback"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
