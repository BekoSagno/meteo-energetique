/** Projection lat/lng → coordonnées SVG (Conakry). */
export function projectPoint(lat, lng, bounds, width, height, padding = 28) {
  const latSpan = bounds.maxLat - bounds.minLat || 0.01;
  const lngSpan = bounds.maxLng - bounds.minLng || 0.01;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const x = padding + ((lng - bounds.minLng) / lngSpan) * innerW;
  const y = padding + ((bounds.maxLat - lat) / latSpan) * innerH;

  return { x, y };
}

export function communeRadius(sectorCount, base = 14) {
  return base + Math.min(10, Math.sqrt(sectorCount || 1) * 1.8);
}
