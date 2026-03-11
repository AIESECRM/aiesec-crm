import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={onClose}></div>
            <div style={{ position: 'relative', backgroundColor: 'var(--background)', borderRadius: 'var(--border-radius)', width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
                {title && (
                    <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '24px', lineHeight: 1 }}>&times;</span>
                        </button>
                    </div>
                )}
                <div style={{ padding: 'var(--spacing-lg)' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
