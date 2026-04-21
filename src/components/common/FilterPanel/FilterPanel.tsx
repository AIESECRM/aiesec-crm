'use client';

import React, { useState } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { CompanyFilter } from '@/types';
import './FilterPanel.css';

interface FilterPanelProps {
  onClose: () => void;
  onApply: (filters: CompanyFilter) => void;
  onReset: () => void;
  initialFilters?: CompanyFilter;
}

const statusOptions = [
  { value: '', label: 'Tümü' },
  { value: 'POSITIVE', label: 'Pozitif' },
  { value: 'NEGATIVE', label: 'Negatif' },
  { value: 'NO_ANSWER', label: 'Cevap Yok' },
  { value: 'CALL_AGAIN', label: 'Tekrar Ara' },
  { value: 'MEETING_PLANNED', label: 'Toplantı Planlandı' },
];

const chapterOptions = [
  { value: '', label: 'Tüm Şubeler' },
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

export default function FilterPanel({ 
  onClose, 
  onApply, 
  onReset,
  initialFilters = {} 
}: FilterPanelProps) {
  const [filters, setFilters] = useState<CompanyFilter>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <h3 className="filter-panel__title">Filtrele</h3>
        <button className="filter-panel__close" onClick={onClose}>
          <X className="filter-panel__close-icon" />
        </button>
      </div>

      <div className="filter-panel__group">
        <label className="filter-panel__label">Durum</label>
        <select
          className="filter-panel__select"
          value={filters.status || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, status: (e.target.value || undefined) as any }))}
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-panel__group">
        <label className="filter-panel__label">Şube</label>
        <select
          className="filter-panel__select"
          value={filters.chapter || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, chapter: e.target.value || undefined }))}
        >
          {chapterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-panel__actions">
        <button className="filter-panel__btn filter-panel__btn--primary" onClick={handleApply}>
          <Filter className="filter-panel__btn-icon" />
          Filtrele
        </button>
        <button className="filter-panel__btn filter-panel__btn--secondary" onClick={handleReset}>
          <RotateCcw className="filter-panel__btn-icon" />
          Temizle
        </button>
      </div>
    </div>
  );
}