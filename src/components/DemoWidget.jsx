import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Wifi,
  Check,
  Copy,
  Star,
  ExternalLink,
  Leaf,
  Flame,
  GlassWater,
  Utensils,
  Coffee,
  Wine,
  Cake,
  Pizza,
  Soup,
  Salad,
  Fish,
  Beef,
  IceCream,
  Cookie,
  ChefHat,
  Heart,
  Sparkles,
  Crown,
  Rocket,
  Clock,
} from 'lucide-react';
import { Badge } from './ui/Badge';

/**
 * DemoWidget - Interactive menu demo widget for iPhone mockup
 * Can use demo data or accept custom restaurant/menu data
 */
export function DemoWidget({
  restaurant: customRestaurant,
  menu: customMenu,
  currentView: externalCurrentView,
  setCurrentView: externalSetCurrentView,
  selectedSectionId: externalSelectedSectionId,
  setSelectedSectionId: externalSetSelectedSectionId,
  selectedItemId: externalSelectedItemId,
  setSelectedItemId: externalSetSelectedItemId,
  activeSubSectionId: externalActiveSubSectionId,
  setActiveSubSectionId: externalSetActiveSubSectionId,
} = {}) {
  const [internalCurrentView, setInternalCurrentView] = useState('main');
  const [internalSelectedSectionId, setInternalSelectedSectionId] = useState(null);
  const [internalSelectedItemId, setInternalSelectedItemId] = useState(null);
  const [internalActiveSubSectionId, setInternalActiveSubSectionId] = useState('starters');
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [wifiCopied, setWifiCopied] = useState(false);

  // Language options for display
  const languageOptions = {
    pt: { name: 'Português', flag: '🇵🇹' },
    en: { name: 'English', flag: '🇬🇧' },
    es: { name: 'Español', flag: '🇪🇸' },
    fr: { name: 'Français', flag: '🇫🇷' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    it: { name: 'Italiano', flag: '🇮🇹' },
  };

  // Translation dictionaries for tags and allergens
  const tagTranslations = {
    vegetarian: {
      pt: 'Vegetariano',
      en: 'Vegetarian',
      es: 'Vegetariano',
      fr: 'Végétarien',
      de: 'Vegetarisch',
      it: 'Vegetariano',
    },
    'gluten-free': {
      pt: 'Sem Glúten',
      en: 'Gluten Free',
      es: 'Sin Gluten',
      fr: 'Sans Gluten',
      de: 'Glutenfrei',
      it: 'Senza Glutine',
    },
    spicy: {
      pt: 'Picante',
      en: 'Spicy',
      es: 'Picante',
      fr: 'Épicé',
      de: 'Scharf',
      it: 'Piccante',
    },
  };

  const allergenTranslations = {
    gluten: {
      pt: 'Contém Glúten',
      en: 'Contains Gluten',
      es: 'Contiene Gluten',
      fr: 'Contient du Gluten',
      de: 'Enthält Gluten',
      it: 'Contiene Glutine',
    },
    dairy: {
      pt: 'Contém Lacticínios',
      en: 'Contains Dairy',
      es: 'Contiene Lácteos',
      fr: 'Contient des Produits Laitiers',
      de: 'Enthält Milchprodukte',
      it: 'Contiene Latticini',
    },
    fish: {
      pt: 'Contém Peixe',
      en: 'Contains Fish',
      es: 'Contiene Pescado',
      fr: 'Contient du Poisson',
      de: 'Enthält Fisch',
      it: 'Contiene Pesce',
    },
    soy: {
      pt: 'Contém Soja',
      en: 'Contains Soy',
      es: 'Contiene Soja',
      fr: 'Contient du Soja',
      de: 'Enthält Soja',
      it: 'Contiene Soia',
    },
    sesame: {
      pt: 'Contém Sésamo',
      en: 'Contains Sesame',
      es: 'Contiene Sésamo',
      fr: 'Contient du Sésame',
      de: 'Enthält Sesam',
      it: 'Contiene Sesamo',
    },
    eggs: {
      pt: 'Contém Ovos',
      en: 'Contains Eggs',
      es: 'Contiene Huevos',
      fr: 'Contient des Œufs',
      de: 'Enthält Eier',
      it: 'Contiene Uova',
    },
    nuts: {
      pt: 'Contém Frutos Secos',
      en: 'Contains Nuts',
      es: 'Contiene Frutos Secos',
      fr: 'Contient des Fruits à Coque',
      de: 'Enthält Nüsse',
      it: 'Contiene Frutta Secca',
    },
    shellfish: {
      pt: 'Contém Marisco',
      en: 'Contains Shellfish',
      es: 'Contiene Mariscos',
      fr: 'Contient des Crustacés',
      de: 'Enthält Schalentiere',
      it: 'Contiene Crostacei',
    },
  };

  const uiTranslations = {
    allergenInformation: {
      pt: 'Informação de Alergénios',
      en: 'Allergen Information',
      es: 'Información de Alérgenos',
      fr: 'Information sur les Allergènes',
      de: 'Allergeninformationen',
      it: 'Informazioni sugli Allergeni',
    },
    info: {
      pt: 'Informações',
      en: 'Info',
      es: 'Información',
      fr: 'Info',
      de: 'Info',
      it: 'Info',
    },
    googleReviews: {
      pt: 'Avaliações do Google',
      en: 'Google Reviews',
      es: 'Reseñas de Google',
      fr: 'Avis Google',
      de: 'Google Bewertungen',
      it: 'Recensioni Google',
    },
    reviews: {
      pt: 'avaliações',
      en: 'reviews',
      es: 'reseñas',
      fr: 'avis',
      de: 'Bewertungen',
      it: 'recensioni',
    },
    from: {
      pt: 'De',
      en: 'From',
      es: 'De',
      fr: 'De',
      de: 'Von',
      it: 'Da',
    },
    to: {
      pt: 'até',
      en: 'to',
      es: 'a',
      fr: 'à',
      de: 'bis',
      it: 'a',
    },
    openingHours: {
      pt: 'Horário de Funcionamento',
      en: 'Opening Hours',
      es: 'Horario de Apertura',
      fr: 'Heures d\'Ouverture',
      de: 'Öffnungszeiten',
      it: 'Orari di Apertura',
    },
    closed: {
      pt: 'Fechado',
      en: 'Closed',
      es: 'Cerrado',
      fr: 'Fermé',
      de: 'Geschlossen',
      it: 'Chiuso',
    },
    description: {
      pt: 'Descrição',
      en: 'Description',
      es: 'Descripción',
      fr: 'Description',
      de: 'Beschreibung',
      it: 'Descrizione',
    },
  };

  // Use external state if provided, otherwise use internal state
  const currentView = externalCurrentView !== undefined ? externalCurrentView : internalCurrentView;
  const setCurrentView = externalSetCurrentView || setInternalCurrentView;
  const selectedSectionId = externalSelectedSectionId !== undefined ? externalSelectedSectionId : internalSelectedSectionId;
  const setSelectedSectionId = externalSetSelectedSectionId || setInternalSelectedSectionId;
  const selectedItemId = externalSelectedItemId !== undefined ? externalSelectedItemId : internalSelectedItemId;
  const setSelectedItemId = externalSetSelectedItemId || setInternalSelectedItemId;
  const activeSubSectionId = externalActiveSubSectionId !== undefined ? externalActiveSubSectionId : internalActiveSubSectionId;
  const setActiveSubSectionId = externalSetActiveSubSectionId || setInternalActiveSubSectionId;

  const defaultRestaurant = {
    name: 'Alpine Meadow',
    description: 'Modern European cuisine with a cozy atmosphere',
    address: '123 Mountain View, Alpine Valley',
    phone: '+1 555 123 4567',
    wifiName: 'AlpineMeadow_Guest',
    wifiPassword: 'alpine2024',
    showWifiOnMenu: true,
    showGoogleRating: true,
    googleUrl: 'https://google.com',
    googleRating: 4.8,
    googleReviewCount: 247,
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop',
  };

  const defaultMenu = {
    id: 1,
    name: 'Alpine Meadow Menu',
    languages: ['en', 'pt'],
    sections: [
      {
        id: 'starters-mains',
        name: 'Starters & Mains',
        subSections: [
          {
            id: 'starters',
            name: 'Starters',
            items: [
              {
                id: 'truffle-arancini',
                name: 'Truffle Arancini',
                description: 'Crispy risotto balls with truffle oil and parmesan cheese',
                fullDescription:
                  'Hand-rolled risotto balls made with Arborio rice, slowly cooked and mixed with aged parmesan cheese. Each ball is carefully breaded and fried to golden perfection, then drizzled with premium truffle oil from Umbria.',
                price: 14.0,
                image:
                  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
                popular: true,
                allergens: ['gluten', 'dairy'],
                tags: ['vegetarian'],
                sortOrder: 0,
              },
              {
                id: 'burrata',
                name: 'Burrata Caprese',
                description: 'Fresh burrata with heirloom tomatoes and basil from our garden',
                price: 16.0,
                image:
                  'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop',
                allergens: ['dairy'],
                tags: ['vegetarian', 'gluten-free'],
                sortOrder: 1,
              },
              {
                id: 'tuna-tartare',
                name: 'Yellowfin Tuna Tartare',
                description: 'Sashimi-grade tuna with avocado, citrus, and sesame oil',
                price: 18.0,
                image:
                  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
                popular: true,
                allergens: ['fish', 'sesame', 'soy'],
                tags: ['gluten-free'],
                sortOrder: 2,
              },
            ],
          },
          {
            id: 'mains',
            name: 'Mains',
            items: [
              {
                id: 'ribeye',
                name: 'Dry-Aged Ribeye',
                description: '28-day aged ribeye steak with roasted seasonal vegetables',
                price: 42.0,
                tags: ['gluten-free'],
                sortOrder: 0,
              },
              {
                id: 'salmon',
                name: 'Pan-Seared Salmon',
                description: 'Atlantic salmon with herb butter and quinoa pilaf',
                price: 32.0,
                allergens: ['fish', 'dairy'],
                tags: ['gluten-free'],
                sortOrder: 1,
              },
            ],
          },
        ],
      },
      {
        id: 'desserts',
        name: 'Desserts',
        subSections: [
          {
            id: 'sweet',
            name: 'Sweet Endings',
            items: [
              {
                id: 'tiramisu',
                name: 'Classic Tiramisu',
                description: 'Traditional Italian dessert with espresso and mascarpone',
                price: 12.0,
                allergens: ['dairy', 'eggs', 'gluten'],
                sortOrder: 0,
              },
            ],
          },
        ],
      },
    ],
  };

  // Use custom data if provided, otherwise use demo data
  const demoRestaurant = customRestaurant || defaultRestaurant;
  const demoMenu = customMenu || defaultMenu;

  // Look up section and item from menu by ID
  const selectedSection = selectedSectionId
    ? demoMenu.sections?.find((s) => s.id === selectedSectionId)
    : null;

  const selectedItem = selectedItemId
    ? demoMenu.sections
        ?.flatMap((s) => s.subSections || [])
        .flatMap((sub) => sub.items || [])
        .find((item) => item.id === selectedItemId)
    : null;

  const handleSectionClick = (section) => {
    setSelectedSectionId(section.id);
    setActiveSubSectionId(section.subSections?.[0]?.id);
    setCurrentView('section');
  };

  const handleItemClick = (item) => {
    setSelectedItemId(item.id);
    setCurrentView('item');
  };

  const handleBackClick = () => {
    if (currentView === 'item') {
      setCurrentView('section');
    } else if (currentView === 'section') {
      setCurrentView('main');
    }
  };

  const copyWifiPassword = () => {
    navigator.clipboard.writeText(demoRestaurant.wifiPassword);
    setWifiCopied(true);
    // Reset copied state immediately (user will see the check icon briefly)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setWifiCopied(false);
      });
    });
  };

  // Get design settings from menu or use beautiful defaults (exact match to landing page)
  const design = demoMenu.design || {
    backgroundColor: '#FFFFFF',
    fontColor: '#1F2937',
    fontFamily: 'Inter',
    fontSize: 14,
    sectionBackgroundColor: '#F9FAFB',
    sectionTextColor: '#111827',
    sectionBorderColor: '#E5E7EB',
    subsectionBackgroundColor: '#F3F4F6',
    subsectionTextColor: '#6B7280',
    tabActiveBackgroundColor: '#111827',
    tabActiveTextColor: '#FFFFFF',
    tabInactiveBackgroundColor: '#F9FAFB',
    tabInactiveTextColor: '#111827',
  };

  // Helper function to get translated text
  const getTranslation = (path, defaultValue) => {
    if (selectedLanguage === 'pt') return defaultValue;
    const translation = demoMenu.translations?.[selectedLanguage]?.[path];
    console.log('[Translation Debug]', {
      path,
      selectedLanguage,
      translation,
      defaultValue,
      allTranslations: demoMenu.translations,
    });
    return translation || defaultValue;
  };

  // Debug: log when language changes
  useEffect(() => {
    console.log('[Language Changed]', {
      selectedLanguage,
      availableLanguages: demoMenu.languages,
      translations: demoMenu.translations,
    });
  }, [selectedLanguage, demoMenu.translations, demoMenu.languages]);

  return (
    <div
      className="h-full overflow-y-auto scrollbar-hide"
      style={{
        backgroundColor: design.backgroundColor,
      }}
    >
      {currentView === 'main' ? (
        <MainMenuView
          restaurant={demoRestaurant}
          menu={demoMenu}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          onSectionClick={handleSectionClick}
          wifiCopied={wifiCopied}
          onCopyWifi={copyWifiPassword}
          design={design}
          getTranslation={getTranslation}
          languageOptions={languageOptions}
          uiTranslations={uiTranslations}
        />
      ) : currentView === 'section' ? (
        <SectionView
          section={selectedSection}
          activeSubSection={activeSubSectionId}
          setActiveSubSection={setActiveSubSectionId}
          selectedLanguage={selectedLanguage}
          onBackClick={handleBackClick}
          onItemClick={handleItemClick}
          design={design}
          getTranslation={getTranslation}
          tagTranslations={tagTranslations}
          allergenTranslations={allergenTranslations}
        />
      ) : (
        <ItemDetailView
          item={selectedItem}
          selectedLanguage={selectedLanguage}
          onBackClick={handleBackClick}
          design={design}
          getTranslation={getTranslation}
          tagTranslations={tagTranslations}
          allergenTranslations={allergenTranslations}
          uiTranslations={uiTranslations}
        />
      )}
    </div>
  );
}

function MainMenuView({
  restaurant,
  menu,
  selectedLanguage,
  setSelectedLanguage,
  onSectionClick,
  wifiCopied,
  onCopyWifi,
  design,
  getTranslation,
  languageOptions,
  uiTranslations,
}) {
  // Get available languages from menu
  const availableLanguages = menu?.languages || ['pt'];

  return (
    <div className="flex flex-col h-full">
      {/* Header with restaurant logo/banner - Always shown */}
      <div className="relative h-32 bg-gradient-to-br from-purple-100 to-purple-200">
        {restaurant.logoUrl ? (
          <img
            src={restaurant.logoUrl}
            alt="Restaurant banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-800">{restaurant.name}</h2>
              {restaurant.description && (
                <p className="text-sm text-purple-600 mt-1">{restaurant.description}</p>
              )}
            </div>
          </div>
        )}
        {availableLanguages.length > 1 && (
          <div className="absolute top-2 right-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-8 px-3 rounded-full bg-white/90 backdrop-blur-sm border-white/20 text-sm focus:outline-none"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {languageOptions[lang]?.flag || lang}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Restaurant info */}
      <div className="p-3 space-y-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: design?.fontColor || '#1F2937' }}>
            {restaurant.name}
          </h1>
        </div>

        {/* Info section */}
        <div className="border-t pt-3 space-y-2" style={{ borderColor: design?.sectionBackgroundColor || '#F3F4F6' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: design?.sectionTextColor || '#374151' }}>{uiTranslations.info[selectedLanguage] || 'Info'}</span>
          </div>

          {/* WiFi Password */}
          {restaurant.showWifiOnMenu && (
            <div
              className="flex items-center justify-between rounded-lg p-2"
              style={{ backgroundColor: design?.subsectionBackgroundColor || '#F9FAFB' }}
            >
              <div className="flex items-center gap-2">
                <Wifi className="h-3 w-3" style={{ color: design?.subsectionTextColor || '#6B7280' }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: design?.fontColor || '#1F2937' }}>Wi-Fi</p>
                  <p className="text-xs" style={{ color: design?.subsectionTextColor || '#6B7280' }}>
                    {restaurant.wifiName && <span>{restaurant.wifiName} • </span>}
                    {restaurant.wifiPassword}
                  </p>
                </div>
              </div>
              <button onClick={onCopyWifi} className="p-1 rounded hover:opacity-80">
                {wifiCopied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" style={{ color: design?.subsectionTextColor || '#6B7280' }} />
                )}
              </button>
            </div>
          )}

          {/* Google Reviews */}
          {restaurant.showGoogleRating && (
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: design?.subsectionBackgroundColor || '#F9FAFB' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="font-semibold text-xs" style={{ color: design?.fontColor || '#1F2937' }}>
                      {restaurant.googleRating}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: design?.fontColor || '#1F2937' }}>{uiTranslations.googleReviews[selectedLanguage] || 'Google Reviews'}</p>
                    <p className="text-xs" style={{ color: design?.subsectionTextColor || '#6B7280' }}>
                      {restaurant.googleReviewCount} {uiTranslations.reviews[selectedLanguage] || 'reviews'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(restaurant.googleUrl, '_blank')}
                  className="flex items-center gap-1 text-xs px-2 py-1 border rounded hover:opacity-80"
                  style={{
                    borderColor: design?.subsectionTextColor || '#D1D5DB',
                    color: design?.subsectionTextColor || '#6B7280'
                  }}
                >
                  <ExternalLink className="h-2 w-2" />
                  Write
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Menu sections */}
        <div className="space-y-2 pt-2">
          {(menu?.sections || []).map((section, index) => (
            <button
              key={section.id || `section-${index}`}
              onClick={() => onSectionClick(section)}
              className="w-full p-3 text-center rounded-lg border transition-opacity hover:opacity-80"
              style={{
                backgroundColor: design?.sectionBackgroundColor || '#F9FAFB',
                borderColor: design?.sectionBorderColor || '#E5E7EB',
              }}
            >
              <span className="text-sm font-medium" style={{ color: design?.sectionTextColor || '#111827' }}>
                {getTranslation(`section.${section.id}.name`, section.name || 'Unnamed Section')}
              </span>
            </button>
          ))}
        </div>

        {/* Opening Hours Footer */}
        {(() => {
          console.log('[Hours Debug] showHoursOnMenu:', restaurant.showHoursOnMenu);
          console.log('[Hours Debug] workingHours:', restaurant.workingHours);
          console.log('[Hours Debug] Will show hours:', restaurant.showHoursOnMenu && restaurant.workingHours && restaurant.workingHours.length > 0);
          return null;
        })()}
        {restaurant.showHoursOnMenu && restaurant.workingHours && restaurant.workingHours.length > 0 && (() => {
          // Group consecutive days with same hours
          const grouped = [];
          let currentGroup = null;

          restaurant.workingHours.forEach((day, index) => {
            // Format time to remove seconds (HH:mm format)
            const formatTime = (timeStr) => {
              if (!timeStr) return '';
              // Remove seconds if present (HH:mm:ss -> HH:mm)
              return timeStr.split(':').slice(0, 2).join(':');
            };
            const openTime = formatTime(day.open);
            const closeTime = formatTime(day.close);
            const timeStr = day.closed ? (uiTranslations.closed[selectedLanguage] || 'Closed') : `${uiTranslations.from[selectedLanguage] || 'From'} ${openTime} ${uiTranslations.to[selectedLanguage] || 'to'} ${closeTime}`;

            if (!currentGroup || currentGroup.time !== timeStr) {
              if (currentGroup) grouped.push(currentGroup);
              currentGroup = { days: [day.day], time: timeStr, startIndex: index };
            } else {
              currentGroup.days.push(day.day);
            }
          });
          if (currentGroup) grouped.push(currentGroup);

          // Format day ranges
          const formatDayRange = (days) => {
            if (days.length === 1) return days[0];
            if (days.length === 2) return `${days[0]} & ${days[1]}`;
            return `${days[0]} - ${days[days.length - 1]}`;
          };

          return (
            <div className="mt-12 pt-6 border-t-2" style={{ borderColor: design?.sectionBackgroundColor || '#E5E7EB' }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" style={{ color: design?.sectionTextColor || '#374151' }} />
                <span className="text-xs font-semibold" style={{ color: design?.fontColor || '#1F2937' }}>
                  {uiTranslations.openingHours?.[selectedLanguage] || 'Opening Hours'}
                </span>
              </div>
              <div className="space-y-1.5">
                {grouped.map((group, index) => (
                  <div key={index} className="flex items-start justify-between text-xs gap-2">
                    <span className="flex-shrink-0" style={{ color: design?.subsectionTextColor || '#6B7280' }}>
                      {formatDayRange(group.days)}
                    </span>
                    <span className="font-medium text-right" style={{ color: design?.fontColor || '#1F2937' }}>
                      {group.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function SectionView({
  section,
  activeSubSection,
  setActiveSubSection,
  onBackClick,
  onItemClick,
  design,
  getTranslation,
  selectedLanguage,
  tagTranslations,
  allergenTranslations,
}) {
  const currentSubSection = section?.subSections?.find((sub) => sub.id === activeSubSection);

  // Icon mapping
  const iconMap = {
    Utensils,
    Coffee,
    Wine,
    Cake,
    Pizza,
    Soup,
    Salad,
    Fish,
    Beef,
    IceCream,
    Cookie,
    ChefHat,
    Star,
    Heart,
    Sparkles,
    Crown,
    Flame,
    Leaf,
    GlassWater,
    Rocket,
  };

  const allergenMeta = {
    gluten: { label: 'Gluten', color: 'bg-orange-100 text-orange-800' },
    dairy: { label: 'Dairy', color: 'bg-blue-100 text-blue-800' },
    fish: { label: 'Fish', color: 'bg-cyan-100 text-cyan-800' },
    soy: { label: 'Soy', color: 'bg-green-100 text-green-800' },
    sesame: { label: 'Sesame', color: 'bg-amber-100 text-amber-800' },
    eggs: { label: 'Eggs', color: 'bg-purple-100 text-purple-800' },
  };

  const tagMeta = {
    vegetarian: { icon: Leaf, label: 'Vegetarian', color: 'bg-green-100 text-green-800' },
    'gluten-free': { icon: GlassWater, label: 'Gluten Free', color: 'bg-blue-100 text-blue-800' },
    spicy: { icon: Flame, label: 'Spicy', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-white sticky top-0 z-10">
        <button onClick={onBackClick} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900">{section?.name}</h1>
      </div>

      {/* Sub-section tabs */}
      <div className="px-3 py-2 border-b bg-white sticky top-[51px] z-10">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {(section?.subSections || []).map((subSection) => {
            const IconComponent = subSection.icon ? iconMap[subSection.icon] : null;
            return (
              <button
                key={subSection.id}
                onClick={() => setActiveSubSection(subSection.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                style={
                  activeSubSection === subSection.id
                    ? {
                        backgroundColor: design?.tabActiveBackgroundColor || '#000000',
                        color: design?.tabActiveTextColor || '#FFFFFF',
                      }
                    : {
                        backgroundColor: design?.tabInactiveBackgroundColor || '#F3F4F6',
                        color: design?.tabInactiveTextColor || '#374151',
                      }
                }
              >
                {IconComponent && <IconComponent className="h-3 w-3" />}
                {getTranslation(`subsection.${subSection.id}.name`, subSection.name)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 p-3">
        {currentSubSection && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {currentSubSection.icon && iconMap[currentSubSection.icon] &&
                React.createElement(iconMap[currentSubSection.icon], { className: 'h-5 w-5 text-gray-700' })
              }
              <h2 className="text-base font-semibold text-gray-900">{getTranslation(`subsection.${currentSubSection.id}.name`, currentSubSection.name)}</h2>
            </div>

            <div className="space-y-3">
              {(currentSubSection.items || []).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className="w-full flex items-start justify-between py-2 text-left hover:bg-gray-50 rounded-lg px-1 transition-colors"
                >
                  <div className="flex-1 pr-3">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{getTranslation(`item.${item.id}.name`, item.name)}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-600 mb-1 line-clamp-2">{getTranslation(`item.${item.id}.description`, item.description)}</p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-1">
                      {item.tags?.map((tag) => {
                        const meta = tagMeta[tag];
                        if (!meta) return null;
                        const Icon = meta.icon;
                        const translatedLabel = tagTranslations[tag]?.[selectedLanguage] || meta.label;
                        return (
                          <Badge
                            key={tag}
                            className={`flex items-center gap-1 ${meta.color} border-0 text-xs px-1 py-0`}
                          >
                            <Icon className="h-2 w-2" />
                            <span>{translatedLabel}</span>
                          </Badge>
                        );
                      })}
                      {item.allergens?.map((allergen) => {
                        const meta = allergenMeta[allergen];
                        if (!meta) return null;
                        const translatedLabel = allergenTranslations[allergen]?.[selectedLanguage] || meta.label;
                        return (
                          <Badge
                            key={allergen}
                            variant="outline"
                            className={`${meta.color} border-0 text-xs px-1 py-0`}
                          >
                            {translatedLabel}
                          </Badge>
                        );
                      })}
                    </div>

                    {typeof item.price === 'number' && (
                      <p className="text-sm font-semibold text-gray-900">
                        {item.price.toFixed(2)} €
                      </p>
                    )}
                  </div>
                  {item.image && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemDetailView({ item, onBackClick, getTranslation, selectedLanguage, tagTranslations, allergenTranslations, uiTranslations }) {
  const allergenMeta = {
    gluten: { label: 'Contains Gluten', color: 'bg-orange-100 text-orange-800' },
    dairy: { label: 'Contains Dairy', color: 'bg-blue-100 text-blue-800' },
    fish: { label: 'Contains Fish', color: 'bg-cyan-100 text-cyan-800' },
    soy: { label: 'Contains Soy', color: 'bg-green-100 text-green-800' },
    sesame: { label: 'Contains Sesame', color: 'bg-amber-100 text-amber-800' },
    eggs: { label: 'Contains Eggs', color: 'bg-purple-100 text-purple-800' },
  };

  const tagMeta = {
    vegetarian: { icon: Leaf, label: 'Vegetarian', color: 'bg-green-100 text-green-800' },
    'gluten-free': { icon: GlassWater, label: 'Gluten Free', color: 'bg-blue-100 text-blue-800' },
    spicy: { icon: Flame, label: 'Spicy', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-white sticky top-0 z-10">
        <button onClick={onBackClick} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900 flex-1 text-center">{getTranslation(`item.${item.id}.name`, item.name)}</h1>
        <div className="w-7" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image */}
        {item.image && (
          <div className="w-full h-48 bg-gray-100">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Details */}
        <div className="p-3 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">{getTranslation(`item.${item.id}.name`, item.name)}</h2>
            {typeof item.price === 'number' && (
              <p className="text-lg font-bold text-gray-900">{item.price.toFixed(2)} €</p>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {item.tags?.map((tag) => {
              const meta = tagMeta[tag];
              if (!meta) return null;
              const Icon = meta.icon;
              const translatedLabel = tagTranslations[tag]?.[selectedLanguage] || meta.label;
              return (
                <Badge
                  key={tag}
                  className={`flex items-center gap-1 ${meta.color} border-0 text-xs`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{translatedLabel}</span>
                </Badge>
              );
            })}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {uiTranslations.description[selectedLanguage] || 'Description'}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getTranslation(`item.${item.id}.description`, item.fullDescription || item.description)}
            </p>
          </div>

          {/* Allergen Information */}
          {item.allergens && item.allergens.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {uiTranslations.allergenInformation[selectedLanguage] || 'Allergen Information'}
              </h3>
              <div className="flex flex-wrap gap-1">
                {item.allergens.map((allergen) => {
                  const meta = allergenMeta[allergen];
                  if (!meta) return null;
                  const translatedLabel = allergenTranslations[allergen]?.[selectedLanguage] || meta.label;
                  return (
                    <Badge key={allergen} variant="outline" className={`${meta.color} border-0 text-xs`}>
                      {translatedLabel}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DemoWidget;
