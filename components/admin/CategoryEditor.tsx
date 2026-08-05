"use client";

import { useState, useTransition } from "react";
import { saveDraftAction, saveMatrixOptionsAction, publishCategoryAction } from "@/lib/supabase/actions";
import { categoricalMatrix } from "@/lib/valuation-engine";
import { CategoryOption, FlatPayload, MatrixPayload, NumericPayload } from "@/lib/types";
import { formatPercent } from "@/lib/format";
import { Loader2, Save, UploadCloud, Plus, Trash2 } from "lucide-react";

type AnyPayload = NumericPayload | FlatPayload | MatrixPayload;

export default function CategoryEditor({
  category,
  draftPayload,
  publishedInfo,
  initialOptions,
}: {
  category: { id: string; cityId: string; kind: "numeric" | "flat" | "matrix"; label: string; key: string; valueType: "count" | "boolean" | null };
  draftPayload: AnyPayload;
  publishedInfo: { version: number; publishedAt: string } | null;
  initialOptions: CategoryOption[];
}) {
  const [payload, setPayload] = useState<AnyPayload>(draftPayload);
  const [options, setOptions] = useState<CategoryOption[]>(initialOptions);
  const [reason, setReason] = useState("");
  const [editingCell, setEditingCell] = useState<{ subject: string; comparable: string } | null>(null);
  const [cellValue, setCellValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function saveDraft() {
    startTransition(async () => {
      if (category.kind === "matrix") {
        await saveMatrixOptionsAction(category.id, category.cityId, options, reason);
      }
      await saveDraftAction(category.id, category.cityId, payload, reason);
      setMessage("Draft saved.");
      setReason("");
    });
  }

  function publish() {
    startTransition(async () => {
      const version = await publishCategoryAction(category.id, category.cityId);
      setMessage(`Published as v${version}. This is now the live rule for the public site.`);
    });
  }

  function setCell(subject: string, comparable: string, percent: number) {
    const matrixPayload = payload as MatrixPayload;
    const cells = (matrixPayload.cells ?? []).filter((c) => !(c.subject === subject && c.comparable === comparable));
    cells.push({ subject, comparable, percent });
    setPayload({ ...matrixPayload, cells });
  }

  return (
    <div className="space-y-6">
      {category.kind === "numeric" && (
        <NumericEditor payload={payload as NumericPayload} onChange={(p) => setPayload(p)} />
      )}
      {category.kind === "flat" && <FlatEditor payload={payload as FlatPayload} onChange={(p) => setPayload(p)} />}
      {category.kind === "matrix" && (
        <MatrixEditor
          options={options}
          payload={payload as MatrixPayload}
          onOptionsChange={setOptions}
          onPayloadChange={(p) => setPayload(p)}
          editingCell={editingCell}
          setEditingCell={setEditingCell}
          cellValue={cellValue}
          setCellValue={setCellValue}
          onSetCell={setCell}
        />
      )}

      <div className="card-surface p-6">
        <label className="block mb-4">
          <span className="text-xs font-medium text-navy-400 mb-1.5 block">Reason for this change (stored in the audit log)</span>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Tightened floor premium cap after Q3 review"
            className="w-full h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={saveDraft}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-line dark:border-line-dark text-sm font-semibold hover:border-gold hover:text-gold transition-colors tap-feedback disabled:opacity-60"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" strokeWidth={1.5} /> : <Save size={14} strokeWidth={1.5} />}
            Save Draft
          </button>
          <button
            onClick={publish}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink text-sm font-semibold hover:opacity-90 transition-opacity tap-feedback disabled:opacity-60"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" strokeWidth={1.5} /> : <UploadCloud size={14} strokeWidth={1.5} />}
            Publish
          </button>
          <span className="text-xs text-navy-400">
            {publishedInfo ? `Live: v${publishedInfo.version} · published ${new Date(publishedInfo.publishedAt).toLocaleDateString("en-IN")}` : "Not published yet"}
          </span>
        </div>
        {message && <p className="text-xs text-premium mt-3">{message}</p>}
        <p className="text-xs text-navy-400 mt-3">
          Saving a draft does not change what the public site sees. Only Publish makes a version live.
        </p>
      </div>
    </div>
  );
}

function NumericEditor({ payload, onChange }: { payload: NumericPayload; onChange: (p: NumericPayload) => void }) {
  return (
    <div className="card-surface p-6 space-y-4">
      <Row label="Percent per unit of difference">
        <input
          type="number"
          step="0.1"
          value={payload.percentPerUnit}
          onChange={(e) => onChange({ ...payload, percentPerUnit: Number(e.target.value) })}
          className={inputClass}
        />
      </Row>
      <Row label="Maximum adjustment (cap %)">
        <input
          type="number"
          step="0.5"
          value={payload.capPercent}
          onChange={(e) => onChange({ ...payload, capPercent: Number(e.target.value) })}
          className={inputClass}
        />
      </Row>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={payload.enabled} onChange={(e) => onChange({ ...payload, enabled: e.target.checked })} />
        Enabled
      </label>
    </div>
  );
}

function FlatEditor({ payload, onChange }: { payload: FlatPayload; onChange: (p: FlatPayload) => void }) {
  return (
    <div className="card-surface p-6 space-y-4">
      <Row label="Flat percent">
        <input type="number" step="0.1" value={payload.percent} onChange={(e) => onChange({ ...payload, percent: Number(e.target.value) })} className={inputClass} />
      </Row>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={payload.enabled} onChange={(e) => onChange({ ...payload, enabled: e.target.checked })} />
        Enabled
      </label>
    </div>
  );
}

function MatrixEditor({
  options,
  payload,
  onOptionsChange,
  onPayloadChange,
  editingCell,
  setEditingCell,
  cellValue,
  setCellValue,
  onSetCell,
}: {
  options: CategoryOption[];
  payload: MatrixPayload;
  onOptionsChange: (o: CategoryOption[]) => void;
  onPayloadChange: (p: MatrixPayload) => void;
  editingCell: { subject: string; comparable: string } | null;
  setEditingCell: (c: { subject: string; comparable: string } | null) => void;
  cellValue: string;
  setCellValue: (v: string) => void;
  onSetCell: (subject: string, comparable: string, percent: number) => void;
}) {
  const cells = categoricalMatrix(options, payload);

  return (
    <div className="space-y-6">
      <div className="card-surface p-6 space-y-4">
        <Row label="Default percent per rank step (used unless a cell is overridden)">
          <input type="number" step="0.1" value={payload.percentPerRankStep} onChange={(e) => onPayloadChange({ ...payload, percentPerRankStep: Number(e.target.value) })} className={inputClass} />
        </Row>
        <Row label="Maximum adjustment (cap %)">
          <input type="number" step="0.5" value={payload.capPercent} onChange={(e) => onPayloadChange({ ...payload, capPercent: Number(e.target.value) })} className={inputClass} />
        </Row>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={payload.enabled} onChange={(e) => onPayloadChange({ ...payload, enabled: e.target.checked })} />
          Enabled
        </label>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-display font-semibold text-sm mb-1">Options</h3>
        <p className="text-xs text-navy-400 mb-4">Rank = desirability. Higher rank wins the comparison.</p>
        <div className="space-y-2 mb-3">
          {options.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={o.value}
                onChange={(e) => onOptionsChange(options.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                className={inputClass}
                placeholder="value"
              />
              <input
                value={o.label}
                onChange={(e) => onOptionsChange(options.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                className={inputClass}
                placeholder="Label"
              />
              <input
                type="number"
                value={o.rank}
                onChange={(e) => onOptionsChange(options.map((x, idx) => (idx === i ? { ...x, rank: Number(e.target.value) } : x)))}
                className={inputClass + " w-20"}
              />
              <button onClick={() => onOptionsChange(options.filter((_, idx) => idx !== i))} className="text-navy-400 hover:text-discount tap-feedback shrink-0">
                <Trash2 size={15} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => onOptionsChange([...options, { value: "", label: "", rank: options.length + 1 }])} className="text-xs font-medium text-gold tap-feedback">
          <Plus size={12} className="inline mr-1" strokeWidth={1.5} /> Add option
        </button>
      </div>

      <div className="card-surface p-6 overflow-x-auto">
        <h3 className="font-display font-semibold text-sm mb-1">Comparison matrix</h3>
        <p className="text-xs text-navy-400 mb-4">Click any cell to override it directly. Otherwise it&apos;s derived from the rank step above.</p>
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-navy-400 font-medium">Subject ↓ / Comparable →</th>
              {options.map((o) => (
                <th key={o.value} className="p-2 text-center text-navy-400 font-medium">
                  {o.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {options.map((s) => (
              <tr key={s.value} className="border-t border-line dark:border-line-dark">
                <td className="p-2 font-medium">{s.label}</td>
                {options.map((c) => {
                  const cell = cells.find((x) => x.subject === s.value && x.comparable === c.value);
                  const isEditing = editingCell?.subject === s.value && editingCell?.comparable === c.value;
                  const hasOverride = (payload.cells ?? []).some((ov) => ov.subject === s.value && ov.comparable === c.value);
                  return (
                    <td key={c.value} className="p-1 text-center">
                      {isEditing ? (
                        <input
                          autoFocus
                          type="number"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => {
                            onSetCell(s.value, c.value, Number(cellValue) || 0);
                            setEditingCell(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              onSetCell(s.value, c.value, Number(cellValue) || 0);
                              setEditingCell(null);
                            }
                          }}
                          className="w-16 h-8 px-1 text-center rounded border border-gold bg-transparent text-xs"
                        />
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCell({ subject: s.value, comparable: c.value });
                            setCellValue(String(cell?.percent ?? 0));
                          }}
                          className={`w-16 h-8 rounded ledger-figure text-xs transition-colors duration-300 hover:bg-navy-50 dark:hover:bg-white/5 tap-feedback ${
                            (cell?.percent ?? 0) > 0 ? "text-premium" : (cell?.percent ?? 0) < 0 ? "text-discount" : "text-navy-400"
                          } ${hasOverride ? "underline decoration-dotted" : ""}`}
                          title={hasOverride ? "Manually overridden" : "Derived from rank step"}
                        >
                          {formatPercent(cell?.percent ?? 0)}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <div className="w-32">{children}</div>
    </div>
  );
}

const inputClass = "w-full h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gold/40";
