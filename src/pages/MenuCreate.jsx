import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Utensils, Globe, Eye, Save, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { createMenu } from '../data/menus';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from '../store/LanguageContext';

// STEPS will be defined inside the component to use translations

/**
 * MenuCreate Page - Step-by-step wizard for creating a new menu
 * Designed with simplicity in mind for easy onboarding
 */
function MenuCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const STEPS = [
    { id: 1, title: t('menuCreate.steps.info'), icon: Utensils, description: t('menuCreate.steps.infoDesc') },
    { id: 2, title: t('menuCreate.steps.languages'), icon: Globe, description: t('menuCreate.steps.languagesDesc') },
    { id: 3, title: t('menuCreate.steps.review'), icon: Eye, description: t('menuCreate.steps.reviewDesc') },
  ];
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    languages: ['en'],
    defaultLanguage: 'en',
    enabled: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData((prev) => {
      const languages = prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang];

      // Ensure at least one language is selected
      if (languages.length === 0) return prev;

      // If default language was removed, set new default
      let defaultLanguage = prev.defaultLanguage;
      if (!languages.includes(defaultLanguage)) {
        defaultLanguage = languages[0];
      }

      return { ...prev, languages, defaultLanguage };
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      alert(t('menuCreate.alertNameRequired'));
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: t('auth.error') || 'Error',
        description: t('menuCreate.errorNameRequired'),
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const instanceId = localStorage.getItem('instance_id');

      const menuData = {
        instance: instanceId,
        name: formData.name,
        description: formData.description || '',
        default_language: formData.defaultLanguage,
        available_languages: formData.languages,
      };

      const response = await createMenu(menuData);

      if (response.success && response.data && response.data.menu && response.data.menu.id) {
        toast({
          title: t('auth.success') || 'Success',
          description: t('menuCreate.successCreated'),
          type: 'success',
        });
        navigate(`/dashboard/menus/${response.data.menu.id}/edit`);
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to create menu',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error creating menu:', error);
      toast({
        title: 'Error',
        description: 'Failed to create menu',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧', description: 'International visitors' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', description: 'Portuguese speakers' },
    { code: 'es', name: 'Español', flag: '🇪🇸', description: 'Spanish speakers' },
  ];

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.languages.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">{t('menuCreate.backToDashboard')}</span>
          </button>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                          isCompleted
                            ? 'bg-green-500 border-green-500'
                            : isActive
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <StepIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div className="ml-3 hidden md:block">
                        <div
                          className={`text-sm font-semibold ${
                            isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">{step.description}</div>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 transition-all ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Menu Info */}
            {currentStep === 1 && (
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{t('menuCreate.title')}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">{t('menuCreate.subtitle')}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Helpful tip */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm mb-1">{t('menuCreate.tip')}</h4>
                        <p className="text-blue-800 text-sm">
                          {t('menuCreate.tipName')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Name */}
                  <div>
                    <Label htmlFor="name" className="text-lg font-semibold mb-3 flex items-center gap-2">
                      {t('menuCreate.nameLabel')}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('menu.create.namePlaceholder')}
                      className="text-lg py-6"
                      required
                      autoFocus
                    />
                    <p className="text-sm text-gray-500 mt-2">{t('menuCreate.nameHelp')}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-lg font-semibold mb-3">
                      {t('menuCreate.descriptionLabel')} ({t('menuCreate.optional')})
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={t('menu.create.descriptionPlaceholder')}
                      rows={4}
                      className="text-base"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {t('menuCreate.descriptionHelp')}
                    </p>
                  </div>

                </CardContent>
              </Card>
            )}

            {/* Step 2: Languages */}
            {currentStep === 2 && (
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{t('menuCreate.languagesTitle')}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">
                        {t('menuCreate.languagesSubtitle')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Helpful tip */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 text-sm mb-1">{t('menuCreate.tip')}</h4>
                        <p className="text-green-800 text-sm">
                          {t('menuCreate.tipLanguages')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Languages Selection */}
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      {t('menuCreate.availableLanguages')}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="space-y-3">
                      {availableLanguages.map((lang) => {
                        const isSelected = formData.languages.includes(lang.code);
                        return (
                          <label
                            key={lang.code}
                            className={`flex items-center gap-4 p-5 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all ${
                              isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleLanguageToggle(lang.code)}
                              className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-4xl">{lang.flag}</span>
                            <div className="flex-1">
                              <span className="text-lg font-semibold text-gray-900 block">{lang.name}</span>
                              <span className="text-sm text-gray-600">{lang.description}</span>
                            </div>
                            {isSelected && (
                              <Badge className="bg-purple-100 text-purple-700 font-medium">Selected</Badge>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Default Language */}
                  {formData.languages.length > 1 && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <Label htmlFor="defaultLanguage" className="text-lg font-semibold mb-3 block">
                        {t('menuCreate.primaryLanguage')}
                      </Label>
                      <Select
                        id="defaultLanguage"
                        name="defaultLanguage"
                        value={formData.defaultLanguage}
                        onChange={handleChange}
                        className="text-base py-3"
                      >
                        {formData.languages.map((langCode) => {
                          const lang = availableLanguages.find((l) => l.code === langCode);
                          return (
                            <option key={langCode} value={langCode}>
                              {lang?.flag} {lang?.name}
                            </option>
                          );
                        })}
                      </Select>
                      <p className="text-sm text-gray-600 mt-2">
                        This will be the main language shown when customers first open your menu
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{t('menuCreate.reviewTitle')}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">{t('menuCreate.reviewSubtitle')}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Success message */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 text-sm mb-1">Almost Done!</h4>
                        <p className="text-green-800 text-sm">
                          Review your settings below. You can change these anytime after creating your menu.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Summary */}
                  <div className="space-y-4">
                    {/* Menu Name */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">MENU NAME</h4>
                          <p className="text-xl font-bold text-gray-900">{formData.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {formData.description && (
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">DESCRIPTION</h4>
                            <p className="text-base text-gray-900">{formData.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-500">{t('menuCreate.steps.languages').toUpperCase()}</h4>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.languages.map((langCode) => {
                          const lang = availableLanguages.find((l) => l.code === langCode);
                          const isPrimary = langCode === formData.defaultLanguage;
                          return (
                            <Badge
                              key={langCode}
                              className={`text-base py-2 px-4 ${
                                isPrimary ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {lang?.flag} {lang?.name}
                              {isPrimary && <span className="ml-2 text-xs">{t('menuCreate.primary')}</span>}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* What's Next */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
                    <h4 className="font-semibold text-purple-900 text-lg mb-3">{t('menuCreate.whatsNext')}</h4>
                    <p className="text-purple-800 mb-4">
                      {t('menuCreate.whatsNextDesc')}
                    </p>
                    <ul className="space-y-2 text-purple-800">
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        {t('menuCreate.whatsNext1')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        {t('menuCreate.whatsNext2')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        {t('menuCreate.whatsNext3')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">
                          4
                        </span>
                        Generate a QR code for customers to scan
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 gap-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center gap-2 text-lg py-6 px-8"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </Button>
              )}

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center gap-2 text-lg py-6 px-8 ml-auto bg-purple-600 hover:bg-purple-700"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 text-lg py-6 px-8 ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? t('menuCreate.creatingMenu') : t('menuCreate.createMenu')}
                </Button>
              )}
            </div>

            {/* Step Indicator (Mobile) */}
            <div className="text-center text-sm text-gray-500 mt-6">
              {t('menuCreate.stepIndicator').replace('{current}', currentStep).replace('{total}', STEPS.length)}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// Loader for this page
MenuCreate.loader = async () => {
  return {};
};

export default MenuCreate;
