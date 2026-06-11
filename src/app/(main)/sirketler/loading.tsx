import React from 'react';
import { Building2, LayoutList, Columns, Plus } from 'lucide-react';
import './page.css';

export default function Loading() {
  return (
    <div className="companies-page">
      <div className="companies-page__main">
        {/* HEADER SKELETON */}
        <div className="companies-page__header">
          <div className="companies-page__title">
            <Building2 className="companies-page__title-icon" style={{ opacity: 0.5 }} />
            <h1 className="companies-page__title-text" style={{ color: 'transparent', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '200px', height: '28px' }}>Yükleniyor</h1>
          </div>
          <div className="companies-page__actions">
            <div className="view-toggle" style={{ opacity: 0.5, pointerEvents: 'none' }}>
              <button className="view-toggle__btn view-toggle__btn--active"><LayoutList size={15} /> Liste</button>
              <button className="view-toggle__btn"><Columns size={15} /> Kanban</button>
            </div>
            <button className="companies-page__add-btn" style={{ opacity: 0.5, pointerEvents: 'none', background: 'var(--bg-secondary, #f3f4f6)', color: 'var(--text-primary, #374151)' }}>
              Toplu İçe Aktar
            </button>
            <button className="companies-page__add-btn" style={{ opacity: 0.5, pointerEvents: 'none' }}>
              <Plus className="companies-page__add-btn-icon" /> Yeni Şirket Ekle
            </button>
          </div>
        </div>

        {/* TABS SKELETON */}
        <div className="product-tabs" style={{ opacity: 0.5 }}>
          <div className="product-tab" style={{ backgroundColor: '#e5e7eb', width: '60px', height: '32px', border: 'none' }}></div>
          <div className="product-tab" style={{ backgroundColor: '#e5e7eb', width: '60px', height: '32px', border: 'none' }}></div>
          <div className="product-tab" style={{ backgroundColor: '#e5e7eb', width: '60px', height: '32px', border: 'none' }}></div>
          <div className="product-tab" style={{ backgroundColor: '#e5e7eb', width: '60px', height: '32px', border: 'none' }}></div>
          <select className="companies-page__status-select" disabled style={{ backgroundColor: '#e5e7eb', color: 'transparent' }}>
            <option>Yükleniyor...</option>
          </select>
        </div>

        {/* SPINNER */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', color: '#6b7280', gap: '16px' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" style={{ borderBottomColor: '#037ef3', borderRadius: '50%', width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#037ef3', animation: 'spin 1s linear infinite' }}></div>
          <span>Veriler getiriliyor...</span>
        </div>
      </div>
    </div>
  );
}
