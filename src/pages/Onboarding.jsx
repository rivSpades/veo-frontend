import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { instancesAPI, menusAPI } from '../data/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  MapPin,
  Store,
  Globe,
  Check,
  Sparkles,
  QrCode,
  Wifi,
  Clock,
  Settings,
  Utensils,
  Eye,
  Save,
} from 'lucide-react';
import { saveMenu } from '../utils/menuStorage';
import { countries } from '../utils/countries';

// Language definitions - names and descriptions will be translated
const availableLanguages = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'pt', flag: '🇵🇹' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'it', flag: '🇮🇹' },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [menuCreationStep, setMenuCreationStep] = useState(1); // For step 3 sub-steps
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { refreshUser, user } = useAuth();

  const [formData, setFormData] = useState({
    // Step 1: Restaurant Details
    restaurantName: '',
    country: '',
    city: '',
    description: '',
    logo: null,
    logoFile: null, // Store the actual file for upload
    phoneNumber: '',

    // Step 3: Restaurant Settings
    configureSettings: false, // true = configure, false = skip
    wifiName: '',
    wifiPassword: '',
    openingTime: '09:00',
    closingTime: '22:00',
    googleBusinessUrl: '',

    // Step 3: First Menu
    createMenu: null, // null = not chosen, true = create, false = skip
    menuName: '',
    menuDescription: '',
    menuLanguages: ['en'],
    menuDefaultLanguage: 'en',
  });

  const totalSteps = 3;
  // Calculate progress accounting for sub-steps in step 3
  const getProgress = () => {
    if (currentStep === 1) return 33.33;
    if (currentStep === 2) return 66.66;
    if (currentStep === 3) {
      // Step 3 has two states: choice view and menu creation sub-steps
      if (formData.createMenu === null) {
        // Choice view - show 66.66% (not 100% until they make a choice)
        return 66.66;
      } else if (formData.createMenu === false) {
        // User chose to skip - show 100% (ready to complete)
        return 100;
      } else if (formData.createMenu === true) {
        // Menu creation sub-steps: 66.66 + (33.33 / 3 * menuCreationStep)
        return 66.66 + (33.33 / 3 * menuCreationStep);
      }
    }
    return 100;
  };
  const progress = getProgress();

  // Fetch existing instance data on mount if user has an instance
  useEffect(() => {
    const loadExistingInstance = async () => {
      try {
        const instanceId = localStorage.getItem('instance_id');
        if (instanceId) {
          const response = await instancesAPI.getInstance(instanceId);
          if (response.success && response.data) {
            const instanceData = response.data;
            // Populate form with existing data
            setFormData(prev => ({
              ...prev,
              restaurantName: instanceData.name || '',
              country: instanceData.country || '',
              city: instanceData.city || '',
              description: instanceData.description || '',
              phoneNumber: instanceData.phone || '',
              wifiName: instanceData.wifi_name || '',
              wifiPassword: instanceData.wifi_password || '',
              googleBusinessUrl: instanceData.google_business_url || '',
              configureSettings: !!(instanceData.wifi_name || instanceData.google_business_url),
              logo: instanceData.logo 
                ? (instanceData.logo.startsWith('http') 
                    ? instanceData.logo 
                    : `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}${instanceData.logo}`)
                : null,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading existing instance:', error);
        // Don't show error to user, just continue with empty form
      }
    };

    loadExistingInstance();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMenuLanguageToggle = (langCode) => {
    setFormData((prev) => {
      const menuLanguages = prev.menuLanguages.includes(langCode)
        ? prev.menuLanguages.filter((l) => l !== langCode)
        : [...prev.menuLanguages, langCode];

      // Ensure at least one language
      if (menuLanguages.length === 0) return prev;

      // If default language was removed, set new default
      let menuDefaultLanguage = prev.menuDefaultLanguage;
      if (!menuLanguages.includes(menuDefaultLanguage)) {
        menuDefaultLanguage = menuLanguages[0];
      }

      return { ...prev, menuLanguages, menuDefaultLanguage };
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('logo', e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.restaurantName?.trim() && formData.country?.trim() && formData.city?.trim();
      case 2:
        return true; // Can always proceed (skip or configure)
      case 3:
        // Can proceed if user has made a choice (createMenu is not null)
        if (formData.createMenu === null) return false; // Must make a choice first
        if (formData.createMenu === false) return true; // Can skip
        // If creating menu, validate sub-steps
        if (formData.createMenu === true) {
          if (menuCreationStep === 1) return formData.menuName?.trim().length > 0;
          if (menuCreationStep === 2) return formData.menuLanguages.length > 0;
          if (menuCreationStep === 3) return true; // Review step
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Restaurant details completed - go to settings
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Settings configured or skipped - go to menu creation choice
      setCurrentStep(3);
      // Reset menu creation state when entering step 3 (show choice view)
      handleInputChange('createMenu', null);
      setMenuCreationStep(1);
    } else if (currentStep === 3) {
      // Step 3: Menu creation choice or sub-steps
      if (formData.createMenu === null) {
        // User hasn't made a choice yet - shouldn't be able to proceed
        return;
      } else if (formData.createMenu === false) {
        // User chose to skip menu creation
        handleComplete();
      } else if (formData.createMenu === true) {
        // User chose to create menu, proceed through sub-steps
        if (menuCreationStep < 3) {
          setMenuCreationStep(menuCreationStep + 1);
        } else {
          handleComplete();
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      if (formData.createMenu === true && menuCreationStep > 1) {
        // Go back in menu creation sub-steps
        setMenuCreationStep(menuCreationStep - 1);
      } else if (formData.createMenu === true && menuCreationStep === 1) {
        // Go back from menu creation form to step 2 (allow editing previous data)
        setCurrentStep(2);
        handleInputChange('createMenu', null);
        setMenuCreationStep(1);
      } else {
        // Go back from menu choice to step 2
        setCurrentStep(2);
      }
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Create instance in backend
      const instanceData = {
        name: formData.restaurantName,
        city: formData.city,
        country: formData.country,
        description: formData.description,
        phone: formData.phoneNumber,
      };

      // Handle logo upload - use the stored file object
      const logoFile = formData.logoFile || null;

      // Add optional settings if user configured them
      if (formData.configureSettings) {
        if (formData.wifiName) {
          instanceData.wifi_name = formData.wifiName;
          instanceData.wifi_password = formData.wifiPassword;
          instanceData.show_wifi_on_menu = true;
        }
        if (formData.googleBusinessUrl) {
          instanceData.google_business_url = formData.googleBusinessUrl;
        }
      }

      // Create instance with logo if available
      const result = logoFile 
        ? await instancesAPI.createInstanceWithLogo(instanceData, logoFile)
        : await instancesAPI.createInstance(instanceData);

      if (result.success) {
        // Backend returns { instance: {...} } structure
        const instanceId = result.data?.instance?.id || result.data?.id;
        
        // Store the instance ID for immediate use
        if (instanceId) {
          localStorage.setItem('instance_id', instanceId);
        } else {
          console.error('Onboarding: No instance ID in response:', result.data);
        }

        // Create menu if user chose to create one
        if (formData.createMenu && formData.menuName?.trim()) {
          try {
            const menuData = {
              name: formData.menuName,
              description: formData.menuDescription || '',
              default_language: formData.menuDefaultLanguage || 'en',
              available_languages: formData.menuLanguages || ['en'],
              instance: instanceId,
            };
            
            const menuResult = await menusAPI.createMenu(menuData);
            if (menuResult.success) {
              console.log('Menu created successfully:', menuResult.data);
            } else {
              console.error('Failed to create menu:', menuResult.error);
              // Don't fail the whole onboarding if menu creation fails
            }
          } catch (menuError) {
            console.error('Error creating menu:', menuError);
            // Don't fail the whole onboarding if menu creation fails
          }
        }

        // Refresh user data to get updated instance information
        await refreshUser();

        toast({
          title: t('onboarding.toast.setupComplete'),
          description: t('onboarding.toast.setupCompleteDesc'),
          type: "success"
        });

        setIsLoading(false);
        navigate('/dashboard');
      } else {
        throw new Error(result.error?.message || 'Failed to create instance');
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to complete setup. Please try again.",
        type: "error"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      // STEP 1: Restaurant Details
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t('onboarding.restaurant.title')}</h2>
              <p className="text-white/80">{t('onboarding.restaurant.subtitle')}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName" className="text-white">
                  {t('onboarding.restaurant.name')}
                </Label>
                <Input
                  id="restaurantName"
                  placeholder={t('onboarding.restaurant.namePlaceholder')}
                  value={formData.restaurantName}
                  onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-white">
                    {t('onboarding.restaurant.country')}
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/60 z-10" />
                    <Select
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="pl-10 bg-white/10 border-white/30 text-white [&>option]:bg-gray-800 [&>option]:text-white"
                    >
                      <option value="">{t('onboarding.restaurant.countryPlaceholder')}</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">
                    {t('onboarding.restaurant.city')}
                  </Label>
                  <Input
                    id="city"
                    placeholder={t('onboarding.restaurant.cityPlaceholder')}
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  />
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  {t('onboarding.restaurant.description')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('onboarding.restaurant.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">{t('onboarding.restaurant.logo')}</Label>
                <div className="flex items-center gap-4">
                  {formData.logo ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-dashed border-white/30">
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white/60" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer bg-white/10 border-white/30 text-white file:bg-white/20 file:text-white file:border-0"
                    />
                    <p className="text-xs text-white/60 mt-1">{t('onboarding.restaurant.logoHelp')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      // STEP 2: Restaurant Settings (Optional)
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t('onboarding.settings.title')}</h2>
              <p className="text-white/80">{t('onboarding.settings.subtitle')}</p>
            </div>

            {/* Choice Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleInputChange('configureSettings', true)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  formData.configureSettings
                    ? 'border-white bg-white/20'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                <Settings className="w-12 h-12 text-white mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-1">{t('onboarding.settings.configureNow')}</h3>
                <p className="text-sm text-white/70">{t('onboarding.settings.configureNowDesc')}</p>
              </button>

              <button
                onClick={() => handleInputChange('configureSettings', false)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  !formData.configureSettings
                    ? 'border-white bg-white/20'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                <ArrowRight className="w-12 h-12 text-white mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-1">{t('onboarding.settings.skipForNow')}</h3>
                <p className="text-sm text-white/70">{t('onboarding.settings.skipForNowDesc')}</p>
              </button>
            </div>

            {/* Settings Form (if user chooses to configure) */}
            {formData.configureSettings && (
              <div className="space-y-4 mt-6">
                <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Wifi className="w-5 h-5" />
                    {t('onboarding.settings.wifiTitle')}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="wifiName" className="text-white text-sm">{t('onboarding.settings.wifiName')}</Label>
                      <Input
                        id="wifiName"
                        placeholder={t('onboarding.settings.wifiNamePlaceholder')}
                        value={formData.wifiName}
                        onChange={(e) => handleInputChange('wifiName', e.target.value)}
                        className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wifiPassword" className="text-white text-sm">{t('onboarding.settings.wifiPassword')}</Label>
                      <Input
                        id="wifiPassword"
                        type="password"
                        placeholder={t('onboarding.settings.wifiPasswordPlaceholder')}
                        value={formData.wifiPassword}
                        onChange={(e) => handleInputChange('wifiPassword', e.target.value)}
                        className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t('onboarding.settings.hoursTitle')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="openingTime" className="text-white text-sm">{t('onboarding.settings.openingTime')}</Label>
                      <Input
                        id="openingTime"
                        type="time"
                        value={formData.openingTime}
                        onChange={(e) => handleInputChange('openingTime', e.target.value)}
                        className="mt-1 bg-white/10 border-white/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="closingTime" className="text-white text-sm">{t('onboarding.settings.closingTime')}</Label>
                      <Input
                        id="closingTime"
                        type="time"
                        value={formData.closingTime}
                        onChange={(e) => handleInputChange('closingTime', e.target.value)}
                        className="mt-1 bg-white/10 border-white/30 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {t('onboarding.settings.googleTitle')}
                  </h3>
                  <div>
                    <Label htmlFor="googleBusinessUrl" className="text-white text-sm">{t('onboarding.settings.googleUrl')}</Label>
                    <Input
                      id="googleBusinessUrl"
                      placeholder={t('onboarding.settings.googleUrlPlaceholder')}
                      value={formData.googleBusinessUrl}
                      onChange={(e) => handleInputChange('googleBusinessUrl', e.target.value)}
                      className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );

      // STEP 3: Create First Menu (Optional with sub-steps)
      case 3:
        // Show choice view if createMenu is null (not yet chosen) or explicitly false
        // Only show menu creation sub-steps if createMenu is explicitly true
        if (formData.createMenu !== true) {
          // Show choice: create menu or skip
          return (
            <motion.div
              key="step4-choice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{t('onboarding.menu.title')}</h2>
                <p className="text-white/80">{t('onboarding.menu.subtitle')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    handleInputChange('createMenu', true);
                    setMenuCreationStep(1);
                  }}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.createMenu === true
                      ? 'border-white bg-white/20'
                      : 'border-white/30 hover:border-white bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <Utensils className="w-12 h-12 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-1">{t('onboarding.menu.createNow')}</h3>
                  <p className="text-sm text-white/70">{t('onboarding.menu.createNowDesc')}</p>
                </button>

                <button
                  onClick={() => {
                    handleInputChange('createMenu', false);
                    // Immediately complete if skipping
                    handleComplete();
                  }}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.createMenu === false
                      ? 'border-white bg-white/20'
                      : 'border-white/30 hover:border-white bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <ArrowRight className="w-12 h-12 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-1">{t('onboarding.menu.skipForNow')}</h3>
                  <p className="text-sm text-white/70">{t('onboarding.menu.skipForNowDesc')}</p>
                </button>
              </div>
            </motion.div>
          );
        }

        // Menu creation sub-steps (only show if user chose to create menu)
        if (formData.createMenu === true) {
          if (menuCreationStep === 1) {
            // Sub-step 1: Menu Info
            return (
            <motion.div
              key="step4-menu-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{t('onboarding.menu.infoTitle')}</h2>
                <p className="text-white/80">{t('onboarding.menu.infoSubtitle')}</p>
              </div>

              <div className="bg-blue-50/10 border border-blue-200/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-1">💡 {t('onboarding.menu.tip')}</h4>
                    <p className="text-white/80 text-sm">
                      {t('onboarding.menu.tipExamples')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="menuName" className="text-white">{t('onboarding.menu.menuName')}</Label>
                  <Input
                    id="menuName"
                    placeholder={t('onboarding.menu.menuNamePlaceholder')}
                    value={formData.menuName}
                    onChange={(e) => handleInputChange('menuName', e.target.value)}
                    className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60 text-lg py-3"
                    autoFocus
                  />
                </div>

                <div>
                  <Label htmlFor="menuDescription" className="text-white">{t('onboarding.menu.menuDescription')}</Label>
                  <Textarea
                    id="menuDescription"
                    placeholder={t('onboarding.menu.menuDescriptionPlaceholder')}
                    value={formData.menuDescription}
                    onChange={(e) => handleInputChange('menuDescription', e.target.value)}
                    rows={3}
                    className="mt-1 bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
            </motion.div>
          );
        } else if (menuCreationStep === 2) {
          // Sub-step 2: Languages
          return (
            <motion.div
              key="step4-languages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{t('onboarding.menu.languagesTitle')}</h2>
                <p className="text-white/80">{t('onboarding.menu.languagesSubtitle')}</p>
              </div>

              <div className="bg-green-50/10 border border-green-200/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-1">💡 {t('onboarding.menu.tip')}</h4>
                    <p className="text-white/80 text-sm">
                      {t('onboarding.menu.languagesTip')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableLanguages.slice(0, 3).map((lang) => {
                  const isSelected = formData.menuLanguages.includes(lang.code);
                  return (
                    <label
                      key={lang.code}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-white bg-white/20' : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleMenuLanguageToggle(lang.code)}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{t(`onboarding.menu.language.${lang.code}`)}</div>
                          <div className="text-sm text-white/70">{t(`onboarding.menu.language.${lang.code}Desc`)}</div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {formData.menuLanguages.length > 1 && (
                <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                  <Label htmlFor="menuDefaultLanguage" className="text-white">{t('onboarding.menu.primaryLanguage')}</Label>
                  <Select
                    id="menuDefaultLanguage"
                    value={formData.menuDefaultLanguage}
                    onChange={(e) => handleInputChange('menuDefaultLanguage', e.target.value)}
                    className="mt-2 bg-white/10 border-white/30 text-white [&>option]:bg-gray-800 [&>option]:text-white"
                  >
                    {formData.menuLanguages.map((langCode) => {
                      const lang = availableLanguages.find((l) => l.code === langCode);
                      return (
                        <option key={langCode} value={langCode}>
                          {lang?.flag} {t(`onboarding.menu.language.${langCode}`)}
                        </option>
                      );
                    })}
                  </Select>
                </div>
              )}
            </motion.div>
          );
        } else if (menuCreationStep === 3) {
          // Sub-step 3: Review
          return (
            <motion.div
              key="step4-review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{t('onboarding.menu.reviewTitle')}</h2>
                <p className="text-white/80">{t('onboarding.menu.reviewSubtitle')}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm text-white/60 mb-1">{t('onboarding.menu.reviewMenuName').toUpperCase()}</h4>
                      <p className="text-lg font-bold text-white">{formData.menuName}</p>
                    </div>
                    <button
                      onClick={() => setMenuCreationStep(1)}
                      className="text-white/80 hover:text-white text-sm"
                    >
                      {t('onboarding.menu.edit')}
                    </button>
                  </div>
                </div>

                {formData.menuDescription && (
                  <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                    <h4 className="text-sm text-white/60 mb-1">{t('onboarding.menu.reviewDescription').toUpperCase()}</h4>
                    <p className="text-white">{formData.menuDescription}</p>
                  </div>
                )}

                <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm text-white/60">{t('onboarding.menu.reviewLanguages').toUpperCase()}</h4>
                    <button
                      onClick={() => setMenuCreationStep(2)}
                      className="text-white/80 hover:text-white text-sm"
                    >
                      {t('onboarding.menu.edit')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.menuLanguages.map((langCode) => {
                      const lang = availableLanguages.find((l) => l.code === langCode);
                      const isPrimary = langCode === formData.menuDefaultLanguage;
                      return (
                        <Badge
                          key={langCode}
                          className={`${
                            isPrimary ? 'bg-purple-100 text-purple-800' : 'bg-white/20 text-white'
                          }`}
                        >
                          {lang?.flag} {t(`onboarding.menu.language.${langCode}`)}
                          {isPrimary && ` (${t('onboarding.menu.primary')})`}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50/10 border border-purple-200/20 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">🎉 {t('onboarding.menu.whatsNext')}</h4>
                <p className="text-white/80 text-sm mb-3">{t('onboarding.menu.whatsNextDesc')}</p>
                <ul className="space-y-2 text-white/80 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-purple-200/20 rounded-full flex items-center justify-center text-xs">1</span>
                    {t('onboarding.menu.whatsNext1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-purple-200/20 rounded-full flex items-center justify-center text-xs">2</span>
                    {t('onboarding.menu.whatsNext2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-purple-200/20 rounded-full flex items-center justify-center text-xs">3</span>
                    {t('onboarding.menu.whatsNext3')}
                  </li>
                </ul>
              </div>
            </motion.div>
          );
          }
        }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <QrCode className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">VEOmenu</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('onboarding.title')}</h1>
          <p className="text-white/80">{t('onboarding.subtitle').replace('{steps}', totalSteps)}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white">
              {t('onboarding.step').replace('{current}', currentStep).replace('{total}', totalSteps)}
            </span>
            <span className="text-sm text-white/70">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>

        {/* Step Content */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || (currentStep === 3 && formData.createMenu === null)}
            className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('onboarding.navigation.back')}
          </Button>

          {/* Only show Next button if not in choice view (step 3 with createMenu === null) */}
          {!(currentStep === 3 && formData.createMenu === null) && (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="flex items-center gap-2 bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                {t('onboarding.navigation.settingUp')}
              </>
            ) : currentStep === 3 && formData.createMenu === true && menuCreationStep === 3 ? (
              <>
                <Save className="w-4 h-4" />
                {t('onboarding.navigation.createMenu')}
              </>
            ) : currentStep === 3 && formData.createMenu === false ? (
              <>
                <Sparkles className="w-4 h-4" />
                {t('onboarding.navigation.completeSetup')}
              </>
            ) : currentStep === 1 ? (
              <>
                {t('onboarding.navigation.next')}
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                {t('onboarding.navigation.next')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

Onboarding.loader = async () => {
  return {};
};
