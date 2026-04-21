import React from 'react';
import Modal from './Modal';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Onayla', cancelText = 'İptal', type = 'danger' }: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
            <div style={{ padding: '4px 0 16px 0', color: 'var(--text-secondary)' }}>
                {message}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                    onClick={onClose}
                    style={{ padding: '8px 16px', backgroundColor: 'var(--surface-50)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontWeight: 500 }}
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => { onConfirm(); onClose(); }}
                    style={{ padding: '8px 16px', backgroundColor: type === 'danger' ? 'var(--status-negative)' : 'var(--primary-600)', color: 'white', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontWeight: 500 }}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}
