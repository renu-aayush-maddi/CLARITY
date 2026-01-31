import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, Text, Badge, Group, RingProgress, Alert } from '@mantine/core';

// Fix for default marker icons in React Leaflet (though we are using CircleMarkers so might not need this)
import L from 'leaflet';

// --- GEOLOCATION GENERATOR ---
const generateGeo = (id) => {
    if (!id) return { lat: 0, lng: 0, region: "Unknown" };

    // 1. SMART DETECTION: Check for Country Codes in Site ID (e.g., "US-101", "IND_002")
    const upperId = id.toUpperCase();

    // Country center points
    const COUNTRY_MAP = {
        "US": { lat: 39.8, lng: -98.5, region: "North America" },
        "USA": { lat: 39.8, lng: -98.5, region: "North America" },
        "CA": { lat: 56.1, lng: -106.3, region: "North America" },
        "UK": { lat: 55.3, lng: -3.4, region: "Europe" },
        "GB": { lat: 55.3, lng: -3.4, region: "Europe" },
        "DE": { lat: 51.1, lng: 10.4, region: "Europe" },
        "FR": { lat: 46.2, lng: 2.2, region: "Europe" },
        "ES": { lat: 40.4, lng: -3.7, region: "Europe" },
        "IT": { lat: 41.8, lng: 12.5, region: "Europe" },
        "IN": { lat: 20.5, lng: 78.9, region: "Asia Pacific" },
        "CN": { lat: 35.8, lng: 104.1, region: "Asia Pacific" },
        "JP": { lat: 36.2, lng: 138.2, region: "Asia Pacific" },
        "AU": { lat: -25.2, lng: 133.7, region: "Asia Pacific" },
        "BR": { lat: -14.2, lng: -51.9, region: "Latin America" },
        "MX": { lat: 23.6, lng: -102.5, region: "Latin America" },
        "AR": { lat: -38.4, lng: -63.6, region: "Latin America" },
        "ZA": { lat: -30.5, lng: 22.9, region: "Africa" }
    };

    for (const [code, geo] of Object.entries(COUNTRY_MAP)) {
        // Simple heuristic: if ID starts with country code or contains it as a segment (e.g. SITE_US_01)
        if (upperId.startsWith(code) || upperId.includes(`_${code}`) || upperId.includes(`-${code}`)) {
            // Add slight random jitter so sites in same country don't overlap perfectly
            return {
                lat: geo.lat + (Math.random() * 2 - 1),
                lng: geo.lng + (Math.random() * 2 - 1),
                region: geo.region
            };
        }
    }

    // 2. FALLBACK: Deterministic Hash for non-standard IDs (e.g. "Site 101")
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Define 4 major clusters (NA, EU, APAC, LATAM)
    const clusters = [
        { name: "North America", lat: 39.8, lng: -98.5, spread: 15 },
        { name: "Europe", lat: 48.0, lng: 12.0, spread: 10 },
        { name: "APAC", lat: 35.0, lng: 105.0, spread: 20 },
        { name: "South America", lat: -14.2, lng: -51.9, spread: 12 }
    ];

    const cluster = clusters[Math.abs(hash) % clusters.length];

    // Add randomness within spread
    const lat = cluster.lat + (Math.sin(hash) * cluster.spread);
    const lng = cluster.lng + (Math.cos(hash) * cluster.spread);

    return { lat, lng, region: cluster.name };
};

export default function StudyWorldMap({ sites }) {

    // Enhance sites with Geolocation if missing
    const geoSites = useMemo(() => {
        if (!sites) return [];
        return sites.map(site => {
            const geo = generateGeo(site.site); // Assuming 'site' is the ID key from your risky_sites list
            return { ...site, ...geo };
        });
    }, [sites]);

    return (
        <Card shadow="sm" radius="md" withBorder style={{ height: '400px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #eee', background: 'white', zIndex: 10 }}>
                <Group justify="space-between" mb="xs">
                    <div>
                        <Text fw={700} size="lg">Global Site Performance</Text>
                        <Text c="dimmed" size="xs">Geographic distribution of Risky Sites (Red) vs Healthy (Green)</Text>
                    </div>
                </Group>
                <Alert variant="light" color="blue" title="Prototype Feature: Simulated Geolocation">
                    <Text size="xs">
                        Site locations are currently <strong>simulated based on Site IDs</strong> for demonstration.
                        In production, this would use real latitude/longitude from your CTMS.
                    </Text>
                </Alert>
            </div>

            <div style={{ flex: 1, width: '100%', height: '100%' }}>
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    {/* DARK THEME TILES for Premium Look */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {geoSites.map((site, idx) => {
                        const isRisky = site.dqi_score < 85;
                        // DQI < 85 = Risk (Red), else Green. 
                        // Note: If site objects come from 'top_risky_sites', they are likely already risky, so we might scale color by severity.

                        const color = site.dqi_score < 70 ? '#ff4d4d' : (site.dqi_score < 85 ? '#ffa94d' : '#40c057');
                        const radius = site.dqi_score < 70 ? 10 : 6;

                        return (
                            <CircleMarker
                                key={idx}
                                center={[site.lat, site.lng]}
                                pathOptions={{
                                    color: color,
                                    fillColor: color,
                                    fillOpacity: 0.7,
                                    weight: 1
                                }}
                                radius={radius}
                            >
                                <Popup>
                                    <div style={{ minWidth: '150px' }}>
                                        <Text fw={700} size="sm">{site.site}</Text>
                                        <Text size="xs" c="dimmed" mb="xs">{site.region}</Text>

                                        <Group justify="space-between" mb="xs">
                                            <Badge color={site.dqi_score < 80 ? "red" : "green"}>
                                                DQI: {site.dqi_score ?? 'N/A'}
                                            </Badge>
                                        </Group>

                                        <RingProgress
                                            size={80}
                                            thickness={8}
                                            roundCaps
                                            sections={[{ value: site.dqi_score, color: color }]}
                                            label={
                                                <Text c={color} fw={700} ta="center" size="xs">
                                                    {site.dqi_score}%
                                                </Text>
                                            }
                                        />

                                        {site.primary_issue && (
                                            <Text size="xs" mt="sm">
                                                <strong>Primary Issue:</strong> {site.primary_issue}
                                            </Text>
                                        )}

                                        <Text size="xs" c="dimmed" mt={5}>
                                            Lat/Lng: {site.lat.toFixed(1)}, {site.lng.toFixed(1)}
                                        </Text>
                                    </div>
                                </Popup>
                                <Tooltip>{site.site}</Tooltip>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>
        </Card>
    );
}
