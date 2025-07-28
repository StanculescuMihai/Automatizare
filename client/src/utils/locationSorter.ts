interface LocationItem {
  location: string;
  [key: string]: any;
}

interface LocationHierarchy {
  building?: string;
  floor?: string;
  room?: string;
  section?: string;
}

/**
 * Parsează o locație în componente ierarhice
 * Format așteptat: "Clădire A / Etaj 2 / Sala 201" sau "Clădire B / Subsol / Depozit"
 */
export function parseLocation(location: string): LocationHierarchy {
  if (!location) return {};
  
  const parts = location.split('/').map(part => part.trim());
  
  return {
    building: parts[0] || '',
    floor: parts[1] || '',
    room: parts[2] || '',
    section: parts[3] || '',
  };
}

/**
 * Compară două locații pentru sortare ierarhică
 */
export function compareLocations(a: string, b: string): number {
  const locationA = parseLocation(a);
  const locationB = parseLocation(b);
  
  // Compară clădirea
  if (locationA.building !== locationB.building) {
    return (locationA.building || '').localeCompare(locationB.building || '', 'ro-RO');
  }
  
  // Compară etajul (cu tratare specială pentru numere)
  if (locationA.floor !== locationB.floor) {
    const floorA = locationA.floor || '';
    const floorB = locationB.floor || '';
    
    // Încearcă să extragă numerele din etaj
    const numA = extractFloorNumber(floorA);
    const numB = extractFloorNumber(floorB);
    
    if (numA !== null && numB !== null) {
      return numA - numB;
    }
    
    return floorA.localeCompare(floorB, 'ro-RO');
  }
  
  // Compară camera/sala
  if (locationA.room !== locationB.room) {
    const roomA = locationA.room || '';
    const roomB = locationB.room || '';
    
    // Încearcă să extragă numerele din cameră
    const numA = extractRoomNumber(roomA);
    const numB = extractRoomNumber(roomB);
    
    if (numA !== null && numB !== null) {
      return numA - numB;
    }
    
    return roomA.localeCompare(roomB, 'ro-RO');
  }
  
  // Compară secțiunea
  return (locationA.section || '').localeCompare(locationB.section || '', 'ro-RO');
}

/**
 * Extrage numărul etajului din string
 */
function extractFloorNumber(floor: string): number | null {
  // Tratează cazuri speciale
  if (floor.toLowerCase().includes('subsol') || floor.toLowerCase().includes('basement')) {
    return -1;
  }
  if (floor.toLowerCase().includes('parter') || floor.toLowerCase().includes('ground')) {
    return 0;
  }
  
  // Extrage primul număr din string
  const match = floor.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Extrage numărul camerei din string
 */
function extractRoomNumber(room: string): number | null {
  // Extrage primul număr din string
  const match = room.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Sortează o listă de elemente după locație
 */
export function sortByLocation<T extends LocationItem>(
  items: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = [...items].sort((a, b) => {
    const comparison = compareLocations(a.location, b.location);
    return order === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}

/**
 * Grupează elementele după clădire
 */
export function groupByBuilding<T extends LocationItem>(items: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  
  items.forEach(item => {
    const { building } = parseLocation(item.location);
    const key = building || 'Necunoscut';
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });
  
  // Sortează fiecare grup
  Object.keys(groups).forEach(key => {
    groups[key] = sortByLocation(groups[key]);
  });
  
  return groups;
}

/**
 * Grupează elementele după etaj
 */
export function groupByFloor<T extends LocationItem>(items: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  
  items.forEach(item => {
    const { building, floor } = parseLocation(item.location);
    const key = building && floor ? `${building} - ${floor}` : 'Necunoscut';
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });
  
  // Sortează fiecare grup
  Object.keys(groups).forEach(key => {
    groups[key] = sortByLocation(groups[key]);
  });
  
  return groups;
}

/**
 * Validează formatul unei locații
 */
export function validateLocationFormat(location: string): {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  if (!location || location.trim() === '') {
    errors.push('Locația nu poate fi goală');
    return { isValid: false, errors };
  }
  
  const parts = location.split('/').map(part => part.trim());
  
  if (parts.length < 2) {
    errors.push('Locația trebuie să conțină cel puțin clădirea și etajul/zona');
    suggestions.push('Format recomandat: "Clădire A / Etaj 1" sau "Clădire B / Subsol"');
  }
  
  if (parts.some(part => part === '')) {
    errors.push('Toate părțile locației trebuie să fie completate');
    suggestions.push('Evitați separatorii consecutivi: "Clădire A // Etaj 1"');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

/**
 * Normalizează formatul unei locații
 */
export function normalizeLocation(location: string): string {
  if (!location) return '';
  
  return location
    .split('/')
    .map(part => part.trim())
    .filter(part => part !== '')
    .join(' / ');
}

export default {
  parseLocation,
  compareLocations,
  sortByLocation,
  groupByBuilding,
  groupByFloor,
  validateLocationFormat,
  normalizeLocation,
};