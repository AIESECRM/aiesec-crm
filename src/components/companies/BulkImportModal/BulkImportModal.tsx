'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  X, Upload, FileSpreadsheet, Download, CheckCircle2,
  AlertCircle, ChevronRight, Loader2, Info, Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './BulkImportModal.css';

// ────────────────────────────────────────────────
// Sabitler
// ────────────────────────────────────────────────
const CHAPTER_OPTIONS = [
  { value: 'ADANA', label: 'Adana' },
  { value: 'ANKARA', label: 'Ankara' },
  { value: 'ANTALYA', label: 'Antalya' },
  { value: 'BURSA', label: 'Bursa' },
  { value: 'DENIZLI', label: 'Denizli' },
  { value: 'DOGU_AKDENIZ', label: 'Doğu Akdeniz' },
  { value: 'ESKISEHIR', label: 'Eskişehir' },
  { value: 'GAZIANTEP', label: 'Gaziantep' },
  { value: 'ISTANBUL', label: 'İstanbul' },
  { value: 'ISTANBUL_ASYA', label: 'İstanbul Asya' },
  { value: 'BATI_ISTANBUL', label: 'Batı İstanbul' },
  { value: 'IZMIR', label: 'İzmir' },
  { value: 'KOCAELI', label: 'Kocaeli' },
  { value: 'KONYA', label: 'Konya' },
  { value: 'KUTAHYA', label: 'Kütahya' },
  { value: 'SAKARYA', label: 'Sakarya' },
  { value: 'TRABZON', label: 'Trabzon' },
];

const COLUMN_MAP: Record<string, string> = {
  name: 'name', 'şirket adı': 'name', 'sirket adi': 'name', şirket: 'name', sirket: 'name',
  company: 'name', 'company name': 'name',
  phone: 'phone', telefon: 'phone', 'tel no': 'phone', tel: 'phone',
  email: 'email', 'e-posta': 'email', eposta: 'email', mail: 'email',
  category: 'category', 'sektör': 'category', sektor: 'category', kategori: 'category',
  sector: 'category', industry: 'category',
  location: 'location', konum: 'location', 'şehir': 'location', sehir: 'location',
  city: 'location', adres: 'location',
  website: 'website', web: 'website', 'web sitesi': 'website', url: 'website',
  linkedin: 'linkedinUrl', linkedinurl: 'linkedinUrl',
  'linkedin url': 'linkedinUrl', 'linkedin adresi': 'linkedinUrl',
  status: 'status', durum: 'status',
  notes: 'notes', notlar: 'notes', not: 'notes', note: 'notes',
  products: 'products', 'ürünler': 'products', urunler: 'products',
  product: 'products', 'ürün': 'products', urun: 'products',
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Şirket Adı', phone: 'Telefon', email: 'E-posta', category: 'Sektör',
  location: 'Konum', website: 'Web Sitesi', linkedinUrl: 'LinkedIn',
  status: 'Durum', notes: 'Notlar', products: 'Ürünler',
};

// ────────────────────────────────────────────────
// Dosya boyutunu okunabilir hale getir
// ────────────────────────────────────────────────
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ────────────────────────────────────────────────
// Dosyadan satırları oku (client tarafında önizleme için)
// ────────────────────────────────────────────────
function parseFileClientSide(file: File): Promise<{ headers: string[]; rows: any[]; mappedFields: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (rows.length === 0) { resolve({ headers: [], rows: [], mappedFields: [] }); return; }
        const headers = Object.keys(rows[0]);
        const mappedFields = Array.from(new Set(
          headers.map(h => COLUMN_MAP[h.toLowerCase().trim()]).filter(Boolean)
        ));
        resolve({ headers, rows, mappedFields });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────
interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
  isNationalRole?: boolean;
}

type Step = 1 | 2 | 3;

interface ImportResult {
  added: number;
  errors: { row: number; name: string; reason: string }[];
  total: number;
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────
export default function BulkImportModal({ isOpen, onClose, onImported, isNationalRole }: BulkImportModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [chapter, setChapter] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep(1); setFile(null); setDragOver(false); setParseError(null);
    setPreviewRows([]); setPreviewHeaders([]); setMappedFields([]);
    setTotalRows(0); setChapter(''); setImporting(false); setProgress(0); setResult(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = useCallback(async (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      setParseError('Desteklenmeyen dosya formatı. Lütfen .xlsx, .xls veya .csv yükleyin.');
      return;
    }
    setParseError(null);
    setFile(f);
    try {
      const { headers, rows, mappedFields: mf } = await parseFileClientSide(f);
      setPreviewHeaders(headers);
      setPreviewRows(rows.slice(0, 5));
      setMappedFields(mf);
      setTotalRows(rows.length);
    } catch {
      setParseError('Dosya okunamadı. Lütfen geçerli bir Excel veya CSV dosyası yükleyin.');
      setFile(null);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    if (isNationalRole && chapter) formData.append('chapter', chapter);

    setProgress(40);
    try {
      const res = await fetch('/api/companies/bulk-import', { method: 'POST', body: formData });
      setProgress(90);
      const data = await res.json();
      setProgress(100);
      setResult(data);
      setStep(3);
      if (data.added > 0) onImported();
    } catch {
      setResult({ added: 0, errors: [{ row: 0, name: '—', reason: 'Sunucu bağlantı hatası' }], total: totalRows });
      setStep(3);
    }
    setImporting(false);
  };

  const handleTemplateDownload = async () => {
    const res = await fetch('/api/companies/bulk-import');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sirket-sablon.xlsx'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const stepDone = (s: number) => s < step;
  const stepActive = (s: number) => s === step;

  return (
    <div className="bulk-modal__overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="bulk-modal">
        {/* ── Header ── */}
        <div className="bulk-modal__header">
          <div className="bulk-modal__title">
            <FileSpreadsheet size={20} className="bulk-modal__title-icon" />
            Toplu Şirket İçe Aktarma
          </div>
          <button className="bulk-modal__close" onClick={handleClose}><X size={18} /></button>
        </div>

        {/* ── Step Indicator ── */}
        <div className="bulk-modal__steps">
          {[
            { n: 1, label: 'Dosya Seç' },
            { n: 2, label: 'Önizleme' },
            { n: 3, label: 'Sonuç' },
          ].map(({ n, label }, idx) => (
            <React.Fragment key={n}>
              {idx > 0 && (
                <div className={`bulk-modal__step-line ${stepDone(n) ? 'bulk-modal__step-line--done' : ''}`} />
              )}
              <div className={`bulk-modal__step ${stepDone(n) ? 'bulk-modal__step--done' : ''} ${stepActive(n) ? 'bulk-modal__step--active' : ''}`}>
                <div className="bulk-modal__step-dot">
                  {stepDone(n) ? <CheckCircle2 size={14} /> : n}
                </div>
                <span className="bulk-modal__step-label">{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="bulk-modal__body">

          {/* ─── STEP 1: Dosya Seç ─── */}
          {step === 1 && (
            <div>
              <div
                className={`bulk-dropzone ${dragOver ? 'bulk-dropzone--over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="bulk-dropzone__input"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleInputChange}
                />
                {!file ? (
                  <>
                    <div className="bulk-dropzone__icon">
                      <Upload size={36} />
                    </div>
                    <div className="bulk-dropzone__title">Dosyayı buraya sürükleyin</div>
                    <div className="bulk-dropzone__sub">veya bilgisayarınızdan seçin</div>
                    <button
                      className="bulk-dropzone__btn"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      <Upload size={14} /> Dosya Seç
                    </button>
                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary, #9ca3af)' }}>
                      .xlsx · .xls · .csv desteklenir
                    </div>
                  </>
                ) : (
                  <div className="bulk-dropzone__file-info">
                    <FileSpreadsheet size={20} color="#10b981" />
                    <span className="bulk-dropzone__file-name">{file.name}</span>
                    <span className="bulk-dropzone__file-size">{formatSize(file.size)}</span>
                    {totalRows > 0 && (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, flexShrink: 0 }}>
                        {totalRows} satır
                      </span>
                    )}
                    <button
                      className="bulk-dropzone__remove"
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewRows([]); setTotalRows(0); setParseError(null); }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {parseError && (
                <div style={{ marginTop: '10px', padding: '10px 14px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={14} /> {parseError}
                </div>
              )}

              <div className="bulk-template-row">
                <Info size={13} />
                Doğru format için
                <button className="bulk-template-link" onClick={handleTemplateDownload}>
                  <Download size={12} /> örnek şablonu indir
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Önizleme ─── */}
          {step === 2 && (
            <div>
              <div className="bulk-preview__info">
                <Info size={14} />
                <span>
                  <b>{totalRows}</b> şirket bulundu. Aşağıda ilk {Math.min(5, previewRows.length)} satırın önizlemesi gösteriliyor.
                </span>
              </div>

              <div className="bulk-preview__table-wrap">
                <table className="bulk-preview__table">
                  <thead>
                    <tr>
                      {previewHeaders.map((h) => (
                        <th key={h}>
                          {FIELD_LABELS[COLUMN_MAP[h.toLowerCase().trim()]] || h}
                          {COLUMN_MAP[h.toLowerCase().trim()] && (
                            <span style={{ color: '#10b981', marginLeft: '4px', fontSize: '10px' }}>✓</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        {previewHeaders.map((h) => (
                          <td key={h} title={String(row[h])}>
                            {String(row[h]) || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalRows > 5 && (
                  <div className="bulk-preview__more">
                    ... ve {totalRows - 5} satır daha
                  </div>
                )}
              </div>

              <div className="bulk-preview__mapped">
                <div className="bulk-preview__mapped-title">Tanınan Alanlar:</div>
                {mappedFields.length > 0 ? (
                  mappedFields.map((f) => (
                    <span key={f} className="bulk-preview__badge bulk-preview__badge--ok">
                      ✓ {FIELD_LABELS[f] || f}
                    </span>
                  ))
                ) : (
                  <span className="bulk-preview__badge bulk-preview__badge--warn">
                    ⚠ Tanınan alan bulunamadı — sütun başlıklarını kontrol edin
                  </span>
                )}
                {!mappedFields.includes('name') && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: '#fee2e2', borderRadius: '6px', fontSize: '12px', color: '#dc2626' }}>
                    ⚠ <b>name</b> (Şirket Adı) sütunu bulunamadı. Bu alan zorunludur.
                  </div>
                )}
              </div>

              {isNationalRole && (
                <div className="bulk-chapter-row">
                  <label className="bulk-chapter-label">Şube:</label>
                  <select className="bulk-chapter-select" value={chapter} onChange={(e) => setChapter(e.target.value)}>
                    <option value="">Şube seçin (opsiyonel)</option>
                    {CHAPTER_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {importing && (
                <div className="bulk-progress">
                  <div className="bulk-progress__label">İçe aktarılıyor... lütfen bekleyin</div>
                  <div className="bulk-progress__bar">
                    <div className="bulk-progress__fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: Sonuç ─── */}
          {step === 3 && result && (
            <div className="bulk-result">
              <div className={`bulk-result__icon ${result.errors.length === 0 ? 'bulk-result__icon--success' : 'bulk-result__icon--partial'}`}>
                {result.errors.length === 0 ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
              </div>
              <div className="bulk-result__title">
                {result.errors.length === 0 ? 'İçe Aktarma Başarılı!' : 'İçe Aktarma Tamamlandı'}
              </div>
              <div className="bulk-result__sub">
                {result.total} satır işlendi
              </div>

              <div className="bulk-result__stats">
                <div className="bulk-result__stat bulk-result__stat--success">
                  <span className="bulk-result__stat-num">{result.added}</span>
                  <span className="bulk-result__stat-label">Eklenen Şirket</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="bulk-result__stat bulk-result__stat--error">
                    <span className="bulk-result__stat-num">{result.errors.length}</span>
                    <span className="bulk-result__stat-label">Hatalı Satır</span>
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="bulk-result__errors">
                  <div className="bulk-result__errors-title">Hatalı Satırlar:</div>
                  {result.errors.slice(0, 10).map((err, i) => (
                    <div key={i} className="bulk-result__error-row">
                      <span className="bulk-result__error-row-num">Satır {err.row}</span>
                      <span>{err.name !== '—' ? `"${err.name}"` : ''} — {err.reason}</span>
                    </div>
                  ))}
                  {result.errors.length > 10 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic' }}>
                      ... ve {result.errors.length - 10} hata daha
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="bulk-modal__footer">
          {step === 1 && (
            <>
              <button className="bulk-btn bulk-btn--secondary" onClick={handleClose}>İptal</button>
              <button
                className="bulk-btn bulk-btn--primary"
                disabled={!file || totalRows === 0 || !!parseError}
                onClick={() => setStep(2)}
              >
                Devam Et <ChevronRight size={15} />
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button className="bulk-btn bulk-btn--secondary" onClick={() => setStep(1)} disabled={importing}>
                Geri
              </button>
              <button
                className="bulk-btn bulk-btn--primary"
                disabled={importing || !mappedFields.includes('name')}
                onClick={handleImport}
              >
                {importing ? (
                  <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Aktarılıyor...</>
                ) : (
                  <><Upload size={14} /> {totalRows} Şirketi İçe Aktar</>
                )}
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button className="bulk-btn bulk-btn--secondary" onClick={() => { reset(); }}>
                Yeni Dosya Yükle
              </button>
              <button className="bulk-btn bulk-btn--success" onClick={handleClose}>
                <CheckCircle2 size={14} /> Tamam
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
