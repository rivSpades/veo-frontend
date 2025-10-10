/**
 * Menu Storage Utility
 * Manages menu data in localStorage
 */

const MENUS_KEY = 'veomenu:menus';
const RESTAURANT_KEY = 'veomenu:restaurant';
const QR_SETTINGS_KEY = 'veomenu:qr_settings';

// Default design configuration
const defaultDesign = {
  primaryColor: '#2563eb',
  fontFamily: 'Inter',
  fontSize: 16,
  fontColor: '#1f2937',
  backgroundColor: '#ffffff',
  sectionBackgroundColor: '#f3f4f6',
  subsectionBackgroundColor: '#f9fafb',
  sectionTextColor: '#1f2937',
  subsectionTextColor: '#374151',
  tabActiveBackgroundColor: '#000000',
  tabActiveTextColor: '#ffffff',
  tabInactiveBackgroundColor: '#f3f4f6',
  tabInactiveTextColor: '#6b7280',
  headerStyle: 'gradient',
  headerGradient: 'from-blue-600 to-purple-600',
  headerColor: '#2563eb',
  headerImage: '',
};

const defaultQRDesign = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  size: 400,
  margin: 4,
  errorCorrectionLevel: 'M',
  logoSize: 20,
  cornerStyle: 'square',
  dotStyle: 'square',
};

/**
 * Load JSON from localStorage
 */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Save JSON to localStorage
 */
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('veomenu:storage'));
}

/**
 * Get all menus
 */
export function getMenus() {
  return loadJSON(MENUS_KEY, []);
}

/**
 * Get a single menu by ID
 */
export function getMenu(id) {
  const menus = getMenus();
  return menus.find((m) => m.id === Number(id));
}

/**
 * Save a new menu
 */
export function saveMenu(menu) {
  const menus = getMenus();
  const maxId = menus.reduce((max, m) => Math.max(max, m.id), 0);
  const newMenu = {
    ...menu,
    id: maxId + 1,
    views: 0,
    lastUpdated: new Date().toISOString(),
    design: { ...defaultDesign, ...(menu.design || {}) },
  };
  menus.push(newMenu);
  saveJSON(MENUS_KEY, menus);
  return newMenu;
}

/**
 * Update an existing menu
 */
export function updateMenu(id, updates) {
  const menus = getMenus();
  const index = menus.findIndex((m) => m.id === Number(id));
  if (index === -1) return null;

  menus[index] = {
    ...menus[index],
    ...updates,
    id: menus[index].id, // Preserve ID
    lastUpdated: new Date().toISOString(),
  };

  saveJSON(MENUS_KEY, menus);
  return menus[index];
}

/**
 * Delete a menu
 */
export function deleteMenu(id) {
  const menus = getMenus();
  const filtered = menus.filter((m) => m.id !== Number(id));
  saveJSON(MENUS_KEY, filtered);
  return filtered.length < menus.length;
}

/**
 * Get restaurant settings
 */
export function getRestaurantSettings() {
  return loadJSON(RESTAURANT_KEY, {
    name: 'My Restaurant',
    description: 'Fine dining experience',
    cuisine: 'International',
    address: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    languages: ['en', 'pt', 'es'],
    primaryLanguage: 'en',
    showGoogleRating: false,
    googleUrl: '',
    googleRating: 0,
    googleReviewCount: 0,
    qrDesign: defaultQRDesign,
    showWifiOnMenu: false,
    showHoursOnMenu: false,
    workingHours: [
      { day: 'Monday', open: '09:00', close: '22:00', closed: false },
      { day: 'Tuesday', open: '09:00', close: '22:00', closed: false },
      { day: 'Wednesday', open: '09:00', close: '22:00', closed: false },
      { day: 'Thursday', open: '09:00', close: '22:00', closed: false },
      { day: 'Friday', open: '09:00', close: '23:00', closed: false },
      { day: 'Saturday', open: '10:00', close: '23:00', closed: false },
      { day: 'Sunday', open: '10:00', close: '21:00', closed: true },
    ],
  });
}

/**
 * Update restaurant settings
 */
export function updateRestaurantSettings(settings) {
  const current = getRestaurantSettings();
  const updated = { ...current, ...settings };
  saveJSON(RESTAURANT_KEY, updated);
  return updated;
}

/**
 * Get QR settings
 */
export function getQRSettings() {
  return loadJSON(QR_SETTINGS_KEY, {
    ...defaultQRDesign,
    selectedMenuId: null,
    downloadFormat: 'png',
    selectedSize: 'medium',
  });
}

/**
 * Update QR settings
 */
export function updateQRSettings(settings) {
  const current = getQRSettings();
  const updated = { ...current, ...settings };
  saveJSON(QR_SETTINGS_KEY, updated);
  return updated;
}

/**
 * Get text with translation
 */
export function getTextWithTranslation(obj, field, language, fallbackLanguage = 'en') {
  if (!obj) return '';

  // Try current language
  if (obj.translations && obj.translations[language] && obj.translations[language][field]) {
    return obj.translations[language][field];
  }

  // Try fallback language
  if (obj.translations && obj.translations[fallbackLanguage] && obj.translations[fallbackLanguage][field]) {
    return obj.translations[fallbackLanguage][field];
  }

  // Return original
  return obj[field] || '';
}

/**
 * Seed default menus (for demo purposes)
 */
export function seedDefaultMenus() {
  const existing = getMenus();
  if (existing.length > 0) return existing;

  const sampleMenu = {
    name: 'Sample Menu',
    description: 'A sample menu to get you started',
    languages: ['en', 'pt', 'es'],
    defaultLanguage: 'en',
    enabled: true,
    sections: [
      {
        id: 'appetizers',
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        subSections: [
          {
            id: 'cold-apps',
            name: 'Cold Appetizers',
            description: 'Fresh and light starters',
            icon: 'Salad',
            items: [
              {
                id: 'bruschetta',
                name: 'Bruschetta',
                description: 'Toasted bread with fresh tomatoes and basil',
                price: 8.50,
                tags: ['vegetarian'],
                popular: true,
              },
            ],
          },
        ],
      },
    ],
  };

  return saveMenu(sampleMenu);
}
