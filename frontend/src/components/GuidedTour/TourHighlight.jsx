import React from 'react';

const highlightStyle = {
    position: 'relative',
    zIndex: 1003,
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 0 0 4px #dbe4ff, 0 0 0 8px #e7f5ff, 0 8px 24px -4px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.3s ease'
};

export default function TourHighlight({ active, children, style = {} }) {
    return (
        <div style={{ ...(active ? highlightStyle : {}), ...style }}>
            {children}
        </div>
    );
}
