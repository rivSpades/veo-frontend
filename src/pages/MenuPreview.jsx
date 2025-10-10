import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { getMenu, getTextWithTranslation } from '../utils/menuStorage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

/**
 * MenuPreview Page - Public menu view with language switching
 */
function MenuPreview() {
  const { menu } = useLoaderData();
  const [currentLang, setCurrentLang] = useState(menu?.defaultLanguage || 'en');
  const [activeSection, setActiveSection] = useState(0);

  if (!menu) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Menu not found</h2>
            <p className="text-secondary-600">This menu doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getText = (obj, field) => getTextWithTranslation(obj, field, currentLang, menu.defaultLanguage);

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ].filter((lang) => menu.languages?.includes(lang.code));

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">{menu.name}</h1>
              {menu.description && (
                <p className="text-sm text-secondary-600 mt-1">{menu.description}</p>
              )}
            </div>
            {availableLanguages.length > 1 && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-secondary-500" />
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value)}
                  className="px-3 py-1.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section Tabs */}
          {menu.sections && menu.sections.length > 0 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
              {menu.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeSection === index
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {getText(section, 'name')}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!menu.sections || menu.sections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-secondary-600">This menu is empty</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {menu.sections[activeSection]?.subSections?.map((subSection) => (
              <Card key={subSection.id}>
                <CardHeader>
                  <CardTitle>{getText(subSection, 'name')}</CardTitle>
                  {subSection.description && (
                    <CardDescription>{getText(subSection, 'description')}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subSection.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 p-4 rounded-lg hover:bg-secondary-50 transition-colors border border-secondary-100"
                      >
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-secondary-900">
                                {getText(item, 'name')}
                              </h4>
                              {item.description && (
                                <p className="text-sm text-secondary-600 mt-1">
                                  {getText(item, 'description')}
                                </p>
                              )}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {item.tags.map((tag) => (
                                    <Badge key={tag} variant="info">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {item.price > 0 && (
                          <div className="text-lg font-semibold text-primary-600 whitespace-nowrap">
                            €{item.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}

                    {(!subSection.items || subSection.items.length === 0) && (
                      <p className="text-center text-secondary-500 py-8">No items in this section</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!menu.sections[activeSection]?.subSections ||
              menu.sections[activeSection]?.subSections.length === 0) && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-secondary-600">No subsections in this section</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

// Loader function
MenuPreview.loader = async ({ params }) => {
  const menu = getMenu(params.id);
  return { menu };
};

export default MenuPreview;
