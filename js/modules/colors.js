// colors.js - Color generation utilities

const feedColorCache = new Map();
const usedHueAngles = [];
const categoryColorCache = new Map();

function hashStringToInt(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hueDistance(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function reserveHue(preferred) {
  let hue = ((preferred % 360) + 360) % 360;
  const goldenAngle = 137.508;
  const tolerance = 12;
  let iterations = 0;
  while (iterations < 360) {
    const isUnique = usedHueAngles.every(existing => hueDistance(existing, hue) > tolerance);
    if (isUnique) {
      usedHueAngles.push(hue);
      return hue;
    }
    hue = (hue + goldenAngle) % 360;
    iterations++;
  }
  usedHueAngles.push(hue);
  return hue;
}

// Common helper function to generate HSL color string
export function generateHslColor(hue, saturation, lightness) {
  const roundedHue = Math.round(hue * 100) / 100;
  return `hsl(${roundedHue}, ${saturation}%, ${lightness}%)`;
}

// Common helper function to calculate hue from a string hash
export function calculateHueFromString(str, multiplier = 1) {
  const hash = hashStringToInt(str);
  return ((hash * multiplier) % 360 + 360) % 360;
}

export function getFeedColors(url) {
  if (feedColorCache.has(url)) return feedColorCache.get(url);
  const baseHue = reserveHue(hashStringToInt(url));
  const colors = {
    primary: generateHslColor(baseHue, 68, 52),
    soft: generateHslColor(baseHue, 85, 88),
    badgeText: generateHslColor(baseHue, 55, 28)
  };
  feedColorCache.set(url, colors);
  return colors;
}

export function getCategoryColors(name) {
  const key = name || 'Feeds';
  if (categoryColorCache.has(key)) return categoryColorCache.get(key);
  const hue = calculateHueFromString(key, 7);
  const colors = {
    border: generateHslColor(hue, 32, 46),
    fill: generateHslColor(hue, 28, 92),
    text: generateHslColor(hue, 40, 28)
  };
  categoryColorCache.set(key, colors);
  return colors;
}
