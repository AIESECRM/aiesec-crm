'use client';

import React from 'react';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            style={{
                padding: '12px 24px',
                backgroundColor: '#1E40AF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
            }}
        >
            Sözleşmeyi Yazdır
        </button>
    );
}
