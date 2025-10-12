import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { instancesAPI } from '../data/api';
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
  Phone,
  Shield,
  RotateCcw,
  PhoneCall,
  Mail,
  Wifi,
  Clock,
  Settings,
  X,
  Utensils,
  Eye,
  Save,
} from 'lucide-react';
import { saveMenu } from '../utils/menuStorage';

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧', description: 'International visitors' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', description: 'Portuguese speakers' },
  { code: 'es', name: 'Español', flag: '🇪🇸', description: 'Spanish speakers' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', description: 'French speakers' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', description: 'German speakers' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', description: 'Italian speakers' },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(210); // 3:30 in seconds
  const [canResend, setCanResend] = useState(false);
  const [menuCreationStep, setMenuCreationStep] = useState(1); // For step 4 sub-steps
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    // Step 1: Restaurant Details
    restaurantName: '',
    country: '',
    city: '',
    description: '',
    logo: null,
    phoneNumber: '',

    // Step 3: Restaurant Settings
    configureSettings: false, // true = configure, false = skip
    wifiName: '',
    wifiPassword: '',
    openingTime: '09:00',
    closingTime: '22:00',
    googleBusinessUrl: '',

    // Step 4: First Menu
    createMenu: false, // true = create, false = skip
    menuName: '',
    menuDescription: '',
    menuLanguages: ['en'],
    menuDefaultLanguage: 'en',
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Timer for verification code
  useEffect(() => {
    if (currentStep === 2 && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [currentStep, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleVerificationCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.restaurantName?.trim() && formData.country?.trim() && formData.city?.trim() && formData.phoneNumber?.trim();
      case 2:
        return verificationCode.every((digit) => digit !== '');
      case 3:
        return true; // Can always proceed (skip or configure)
      case 4:
        if (!formData.createMenu) return true; // Can skip
        if (menuCreationStep === 1) return formData.menuName?.trim().length > 0;
        if (menuCreationStep === 2) return formData.menuLanguages.length > 0;
        if (menuCreationStep === 3) return true; // Review step
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Send verification code
      toast({
        title: "Code sent!",
        description: `We sent a verification code to ${formData.phoneNumber}`,
        type: "success"
      });
      setTimeLeft(210);
      setCanResend(false);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Verify code (in real app, validate with backend)
      toast({
        title: "Phone verified!",
        description: "Your phone number has been verified successfully",
        type: "success"
      });
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Settings configured or skipped
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (formData.createMenu) {
        if (menuCreationStep < 3) {
          setMenuCreationStep(menuCreationStep + 1);
        } else {
          handleComplete();
        }
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 4 && formData.createMenu && menuCreationStep > 1) {
      setMenuCreationStep(menuCreationStep - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResendCode = () => {
    setTimeLeft(210);
    setCanResend(false);
    setVerificationCode(['', '', '', '', '', '']);
    toast({
      title: "Code resent!",
      description: `New code sent to ${formData.phoneNumber}`,
      type: "success"
    });
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

      const result = await instancesAPI.createInstance(instanceData);

      if (result.success) {
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
                    Country
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                    <Input
                      id="country"
                      placeholder="e.g., Portugal"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g., Lisbon"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-white">
                  {t('onboarding.restaurant.phone')}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="phoneNumber"
                    placeholder={t('onboarding.restaurant.phonePlaceholder')}
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
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
                    <p className="text-xs text-white/60 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      // STEP 2: Phone Verification (OTP)
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
              <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t('onboarding.verification.title')}</h2>
              <p className="text-white/80">{t('onboarding.verification.subtitle')}</p>
              <p className="text-white font-semibold">{formData.phoneNumber}</p>
            </div>

            <div className="space-y-6">
              {/* Verification Code Input */}
              <div className="flex justify-center gap-3">
                {verificationCode.map((digit, index) => (
                  <Input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-white/30 text-white focus:border-white/50"
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-white/80 mb-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                  <span className="text-sm">{t('onboarding.verification.expires')}</span>
                </div>
                <div className="text-2xl font-bold text-white">{formatTime(timeLeft)}</div>
              </div>

              {/* Resend Code */}
              <div className="text-center space-y-3">
                <p className="text-white/80 text-sm">{t('onboarding.verification.didntReceive')}</p>
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={!canResend}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('onboarding.verification.resend')}
                </Button>
              </div>

              {/* Security Info */}
              <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">{t('onboarding.verification.security')}</h4>
                    <p className="text-sm text-white/80">
                      {t('onboarding.verification.securityDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      // STEP 3: Restaurant Settings (Optional)
      case 3:
        return (
          <motion.div
            key="step3"
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

      // STEP 4: Create First Menu (Optional with sub-steps)
      case 4:
        if (!formData.createMenu) {
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
                  className="p-6 rounded-lg border-2 border-white/30 hover:border-white bg-white/10 hover:bg-white/20 transition-all"
                >
                  <Utensils className="w-12 h-12 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-1">{t('onboarding.menu.createNow')}</h3>
                  <p className="text-sm text-white/70">{t('onboarding.menu.createNowDesc')}</p>
                </button>

                <button
                  onClick={() => handleInputChange('createMenu', false)}
                  className="p-6 rounded-lg border-2 border-white/30 hover:border-white bg-white/10 hover:bg-white/20 transition-all"
                >
                  <ArrowRight className="w-12 h-12 text-white mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-1">{t('onboarding.menu.skipForNow')}</h3>
                  <p className="text-sm text-white/70">{t('onboarding.menu.skipForNowDesc')}</p>
                </button>
              </div>
            </motion.div>
          );
        }

        // Menu creation sub-steps
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
                          <div className="font-semibold text-white">{lang.name}</div>
                          <div className="text-sm text-white/70">{lang.description}</div>
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
                    className="mt-2 bg-white/10 border-white/30 text-white"
                  >
                    {formData.menuLanguages.map((langCode) => {
                      const lang = availableLanguages.find((l) => l.code === langCode);
                      return (
                        <option key={langCode} value={langCode}>
                          {lang?.flag} {lang?.name}
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
                          {lang?.flag} {lang?.name}
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
            disabled={currentStep === 1 || (currentStep === 4 && !formData.createMenu && menuCreationStep === 1)}
            className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('onboarding.navigation.back')}
          </Button>

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
            ) : currentStep === 4 && formData.createMenu && menuCreationStep === 3 ? (
              <>
                <Save className="w-4 h-4" />
                {t('onboarding.navigation.createMenu')}
              </>
            ) : currentStep === 4 && !formData.createMenu ? (
              <>
                <Sparkles className="w-4 h-4" />
                {t('onboarding.navigation.completeSetup')}
              </>
            ) : currentStep === 1 ? (
              <>
                {t('onboarding.navigation.sendCode')}
                <ArrowRight className="w-4 h-4" />
              </>
            ) : currentStep === 2 ? (
              <>
                {t('onboarding.navigation.verify')}
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                {t('onboarding.navigation.next')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

Onboarding.loader = async () => {
  return {};
};
