import React from 'react';
import { Overlay } from '@mantine/core';

export default function TourOverlay({ tourActive, tourStep }) {
    if (!tourActive) return null;

    return (
        <>
            {/* Visual Blur Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: tourStep >= 5 ? 'rgba(0,0,0,0.24)' : 'rgba(0, 0, 0, 0.4)',
                backdropFilter: tourStep < 5 ? 'blur(3px)' : 'none',
                zIndex: 1000,
                pointerEvents: 'none'
            }} />

            {/* Global Overlay for Tour Blur Effect */}
            <Overlay fixed color="#000" backgroundOpacity={tourStep < 5 ? 0.6 : 0.2} zIndex={1000} />
        </>
    );
}
