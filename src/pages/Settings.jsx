import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Switch } from '../components/ui/Switch';
import { Select } from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LanguageSwitcherCards } from '../components/LanguageSwitcher';
import { Building2, Phone, Globe, MapPin, Upload, Star, Wifi, Clock, Eye, EyeOff, User, Mail, Lock, Shield, CreditCard, Crown, Check, Sparkles } from 'lucide-react';
import {
  getRestaurantSettings,
  updateRestaurantSettings,
} from '../utils/menuStorage';
import { useTranslation } from '../store/LanguageContext';
import { instancesAPI } from '../data/api';
import { useToast } from '../components/ui/Toast';

const getTabs = (t) => [
  { id: 'restaurant', label: t('settings.tabs.restaurant'), icon: Building2 },
  { id: 'hours', label: t('settings.tabs.hours'), icon: Clock },
  { id: 'wifi', label: t('settings.tabs.wifi'), icon: Wifi },
  { id: 'google', label: t('settings.tabs.google'), icon: Globe },
  { id: 'account', label: t('settings.tabs.account'), icon: User },
  { id: 'billing', label: t('settings.tabs.billing'), icon: CreditCard },
];

const cuisineTypes = [
  'Italian',
  'French',
  'Spanish',
  'Portuguese',
  'Mediterranean',
  'American',
  'Asian',
  'Mexican',
  'Indian',
  'Japanese',
  'Chinese',
  'Thai',
  'Greek',
  'Turkish',
  'Lebanese',
  'Other',
];

const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸', enabled: true, complete: 100 },
  { code: 'es', name: 'Español', flag: '🇪🇸', enabled: true, complete: 85 },
  { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: true, complete: 92 },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', enabled: false, complete: 0 },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', enabled: false, complete: 0 },
  { code: 'pt', name: 'Português', flag: '🇵🇹', enabled: false, complete: 0 },
  { code: 'zh', name: '中文', flag: '🇨🇳', enabled: false, complete: 0 },
  { code: 'ja', name: '日本語', flag: '🇯🇵', enabled: false, complete: 0 },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', enabled: false, complete: 0 },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', enabled: false, complete: 0 },
];

const daysOfWeek = [
  { day: 'Monday', open: '09:00', close: '22:00', closed: false },
  { day: 'Tuesday', open: '09:00', close: '22:00', closed: false },
  { day: 'Wednesday', open: '09:00', close: '22:00', closed: false },
  { day: 'Thursday', open: '09:00', close: '22:00', closed: false },
  { day: 'Friday', open: '09:00', close: '23:00', closed: false },
  { day: 'Saturday', open: '10:00', close: '23:00', closed: false },
  { day: 'Sunday', open: '10:00', close: '21:00', closed: true },
];

export default function Settings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('restaurant');
  const [settings, setSettings] = useState(null);
  const [instanceId, setInstanceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [workingHours, setWorkingHours] = useState(daysOfWeek);
  const [languages, setLanguages] = useState(languageOptions);
  const [isDirty, setIsDirty] = useState(false);
  const [accountSettings, setAccountSettings] = useState({
    email: 'sarah.johnson@email.com',
    currentPassword: '',
    newPassword: '',
  });

  const [currentPlan, setCurrentPlan] = useState('trial');
  const [trialDaysLeft, setTrialDaysLeft] = useState(23);
  const [trialStartDate] = useState(new Date('2024-12-10'));

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Get instance ID from localStorage
      const storedInstanceId = localStorage.getItem('instance_id');
      if (!storedInstanceId) {
        toast({
          title: 'No instance selected',
          type: 'error',
          duration: 3000
        });
        setLoading(false);
        return;
      }
      
      setInstanceId(storedInstanceId);
      
      // Fetch instance data from backend
      const response = await instancesAPI.getInstance(storedInstanceId);
      if (response.success && response.data) {
        const instanceData = response.data;
        
        // Transform backend data to frontend format
        const transformedSettings = {
          name: instanceData.name || 'Restaurant Bella Vista',
          description: instanceData.description || '',
          cuisine: instanceData.cuisine_type || 'Italian',
          phone: instanceData.phone || '',
          email: instanceData.email || '',
          website: instanceData.website || '',
          address: instanceData.address || '',
          city: instanceData.city || '',
          country: instanceData.country || '',
          whatsapp: instanceData.whatsapp || '',
          wifiName: instanceData.wifi_name || '',
          wifiPassword: instanceData.wifi_password || '',
          showWifiOnMenu: instanceData.show_wifi_on_menu || false,
          googleUrl: instanceData.google_business_url || '',
          showGoogleRating: instanceData.show_google_rating || false,
          googleRating: instanceData.google_rating || 0,
          googleReviewCount: instanceData.google_review_count || 0,
          logoUrl: instanceData.logo || '',
          showHoursOnMenu: instanceData.show_hours_on_menu || false,
          workingHours: instanceData.business_hours || daysOfWeek,
        };
        
        setSettings(transformedSettings);
        
        // Set working hours - ensure correct structure
        const hoursData = instanceData.business_hours && instanceData.business_hours.length > 0 
          ? instanceData.business_hours 
          : daysOfWeek;
        console.log('Loading working hours:', hoursData);
        setWorkingHours(hoursData);
        setLoading(false);
      } else {
        toast({
          title: 'Failed to load settings',
          type: 'error',
          duration: 3000
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error loading settings',
        type: 'error',
        duration: 3000
      });
      setLoading(false);
    }
  };

  // Auto-save with debouncing
  useEffect(() => {
    if (!isDirty || !settings || !instanceId) return;

    saveSettings();
  }, [settings, workingHours, isDirty]);

  const saveSettings = async () => {
    if (!instanceId || !settings) return;
    
    try {
      // Transform frontend data to backend format
      const backendData = {
        name: settings.name,
        description: settings.description,
        cuisine_type: settings.cuisine,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        address: settings.address,
        wifi_name: settings.wifiName,
        wifi_password: settings.wifiPassword,
        show_wifi_on_menu: settings.showWifiOnMenu,
        google_business_url: settings.googleUrl,
        show_google_rating: settings.showGoogleRating,
        google_rating: settings.googleRating,
        google_review_count: settings.googleReviewCount,
        show_hours_on_menu: settings.showHoursOnMenu,
      };
      
      // Save business hours separately if they exist
      const shouldSaveHours = workingHours && workingHours.length > 0;
      
      const response = await instancesAPI.updateInstance(instanceId, backendData);
      
      // Save business hours separately - transform to backend format
      if (shouldSaveHours && response.success) {
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const transformedHours = workingHours.map((hour, index) => ({
          instance: instanceId,  // Backend requires instance field
          day_of_week: dayNames.indexOf(hour.day) !== -1 ? dayNames.indexOf(hour.day) : index,
          opening_time: hour.open || '09:00',
          closing_time: hour.close || '22:00',
          is_closed: hour.closed || false,
        }));
        
        console.log('Saving business hours:', transformedHours);
        const hoursResponse = await instancesAPI.updateBusinessHours(instanceId, transformedHours);
        console.log('Business hours save response:', hoursResponse);
        
        if (hoursResponse && hoursResponse.success) {
          console.log('Business hours saved successfully');
        } else {
          console.error('Failed to save business hours:', hoursResponse);
        }
      }
      
      if (response.success) {
        setIsDirty(false);
        // Auto-save toast disabled to avoid spam
      } else {
        toast({
          title: 'Failed to save settings',
          type: 'error',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error saving settings',
        type: 'error',
        duration: 3000
      });
    }
  };

  const handleInputChange = (field, value) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setIsDirty(true);
  };

  const handleAccountInputChange = (field, value) => {
    setAccountSettings({ ...accountSettings, [field]: value });
  };

  const handleWorkingHoursChange = (dayIndex, field, value) => {
    const updatedHours = [...workingHours];
    updatedHours[dayIndex] = { ...updatedHours[dayIndex], [field]: value };
    setWorkingHours(updatedHours);
    setIsDirty(true);
  };

  const handleToggleLanguage = (languageCode) => {
    const updatedLanguages = languages.map((lang) =>
      lang.code === languageCode ? { ...lang, enabled: !lang.enabled } : lang
    );
    setLanguages(updatedLanguages);
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large. Please select an image smaller than 2MB.',
        type: 'error',
        duration: 3000
      });
      return;
    }

    setLogoUploading(true);
    
    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('logoUrl', reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload to backend
      const formData = new FormData();
      formData.append('logo', file);
      
      console.log('Uploading logo to instance:', instanceId);
      const response = await instancesAPI.updateInstance(instanceId, formData);
      console.log('Logo upload response:', response);
      
      if (response && response.success && response.data) {
        // Update with the backend URL
        const backendLogoUrl = response.data.logo;
        if (backendLogoUrl) {
          handleInputChange('logoUrl', backendLogoUrl);
        }
        toast({
          title: 'Logo uploaded successfully!',
          type: 'success',
          duration: 3000
        });
      } else {
        toast({
          title: 'Failed to upload logo',
          type: 'error',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Failed to upload logo',
        type: 'error',
        duration: 3000
      });
    } finally {
      setLogoUploading(false);
    }
  };

  if (loading || !settings) {
    return (
      <DashboardLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            <div className="h-96 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const enabledLanguagesCount = languages.filter((lang) => lang.enabled).length;

  return (
    <DashboardLayout
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
    >
      <div className="p-6">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {getTabs(t).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Restaurant Tab */}
        {activeTab === 'restaurant' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                {t('settings.restaurant.title')}
              </h2>

              <div className="grid gap-6">
                <div>
                  <Label htmlFor="restaurant-name">{t('settings.restaurant.name')}</Label>
                  <Input
                    id="restaurant-name"
                    value={settings.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('settings.restaurant.namePlaceholder')}
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t('settings.restaurant.description')}</Label>
                  <Textarea
                    id="description"
                    value={settings.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('settings.restaurant.descriptionPlaceholder')}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="street-address">{t('settings.restaurant.address')}</Label>
                  <Textarea
                    id="street-address"
                    value={settings.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder={t('settings.restaurant.addressPlaceholder')}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                {t('settings.restaurant.contactTitle')}
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">{t('settings.restaurant.phone')}</Label>
                  <Input
                    id="phone"
                    value={settings.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('settings.restaurant.phonePlaceholder')}
                  />
                </div>

                <div>
                  <Label htmlFor="email">{t('settings.restaurant.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t('settings.restaurant.emailPlaceholder')}
                  />
                </div>

                <div>
                  <Label htmlFor="website">{t('settings.restaurant.website')}</Label>
                  <Input
                    id="website"
                    value={settings.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder={t('settings.restaurant.websitePlaceholder')}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">{t('settings.restaurant.whatsapp')}</Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsapp || settings.phone || ''}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder={t('settings.restaurant.whatsappPlaceholder')}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('settings.restaurant.logoTitle')}</h3>
              <div className="space-y-4">
                {settings.logoUrl && (
                  <div className="flex items-center gap-4">
                    <img
                      src={settings.logoUrl}
                      alt="Restaurant logo"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{t('settings.restaurant.currentLogo')}</p>
                      <p className="text-sm text-gray-600">{t('settings.restaurant.clickToChange')}</p>
                    </div>
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">{t('settings.restaurant.dragDrop')}</p>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={logoUploading}
                    />
                    <Button variant="outline" disabled={logoUploading}>
                      {logoUploading ? t('settings.restaurant.uploading') : t('settings.restaurant.browseFiles')}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t('settings.restaurant.fileSize')}</p>
                </div>
              </div>
            </div>

          </div>
        )}


        {/* Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {t('settings.hours.title')}
              </h2>
              <p className="text-gray-600 mb-4">{t('settings.hours.subtitle')}</p>

              <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-gray-900">{t('settings.hours.displayOnMenu')}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('settings.hours.displayOnMenuDesc')}</p>
                </div>
                <Switch
                  checked={settings.showHoursOnMenu || false}
                  onCheckedChange={(checked) => handleInputChange('showHoursOnMenu', checked)}
                />
              </div>

              <div className="space-y-3">
                {(workingHours || daysOfWeek).map((day, index) => (
                  <div
                    key={day.day}
                    className={`rounded-lg border-2 p-5 transition-all ${
                      !day.closed ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <Switch
                          checked={!day.closed}
                          onCheckedChange={(checked) => handleWorkingHoursChange(index, 'closed', !checked)}
                        />
                        <span className="font-semibold text-base text-gray-900 w-28">{day.day}</span>
                      </div>

                      <div className="flex items-center gap-4 flex-1 justify-end">
                        {!day.closed ? (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col gap-1.5">
                                <Label className="text-xs text-gray-600 font-medium">{t('settings.hours.opening')}</Label>
                                <Input
                                  type="time"
                                  value={day.open}
                                  onChange={(e) => handleWorkingHoursChange(index, 'open', e.target.value)}
                                  className="w-32 text-sm font-medium"
                                />
                              </div>
                              <span className="text-gray-400 mt-5">—</span>
                              <div className="flex flex-col gap-1.5">
                                <Label className="text-xs text-gray-600 font-medium">{t('settings.hours.closing')}</Label>
                                <Input
                                  type="time"
                                  value={day.close}
                                  onChange={(e) => handleWorkingHoursChange(index, 'close', e.target.value)}
                                  className="w-32 text-sm font-medium"
                                />
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1.5 font-medium">
                              {t('settings.hours.open')}
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 px-3 py-1.5 font-medium">
                            {t('settings.hours.closed')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WiFi Tab */}
        {activeTab === 'wifi' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-blue-600" />
                {t('settings.wifi.title')}
              </h2>
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{t('settings.wifi.displayOnMenu')}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('settings.wifi.displayOnMenuDesc')}</p>
                </div>
                <Switch
                  checked={settings.showWifiOnMenu || false}
                  onCheckedChange={(checked) => handleInputChange('showWifiOnMenu', checked)}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="wifi-name" className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    {t('settings.wifi.networkName')}
                  </Label>
                  <Input
                    id="wifi-name"
                    value={settings.wifiName || ''}
                    onChange={(e) => handleInputChange('wifiName', e.target.value)}
                    placeholder={t('settings.wifi.networkNamePlaceholder')}
                  />
                </div>

                <div>
                  <Label htmlFor="wifi-password" className="flex items-center gap-2">
                    <span className="w-4 h-4 text-purple-600">🔒</span>
                    {t('settings.wifi.password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="wifi-password"
                      type={showPassword ? 'text' : 'password'}
                      value={settings.wifiPassword || ''}
                      onChange={(e) => handleInputChange('wifiPassword', e.target.value)}
                      placeholder={t('settings.wifi.passwordPlaceholder')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Google Integration Tab */}
        {activeTab === 'google' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                {t('settings.google.title')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('settings.google.subtitle')}
              </p>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{t('settings.google.profileTitle')}</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="google-url">{t('settings.google.url')}</Label>
                        <Input
                          id="google-url"
                          value={settings.googleUrl || ''}
                          onChange={(e) => handleInputChange('googleUrl', e.target.value)}
                          placeholder={t('settings.google.urlPlaceholder')}
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {t('settings.google.urlDesc')}
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 {t('settings.google.howToFind')}</h4>
                        <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                          <li>{t('settings.google.step1')}</li>
                          <li>{t('settings.google.step2')}</li>
                          <li>{t('settings.google.step3')}</li>
                          <li>{t('settings.google.step4')}</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{t('settings.google.displaySettings')}</h3>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <Label className="text-base">{t('settings.google.showRating')}</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {t('settings.google.showRatingDesc')}
                        </p>
                      </div>
                      <Switch
                        checked={settings.showGoogleRating || false}
                        onCheckedChange={(checked) => handleInputChange('showGoogleRating', checked)}
                      />
                    </div>

                    {settings.showGoogleRating && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
                        <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-semibold text-lg">{settings.googleRating || 4.8}</span>
                          <span className="text-gray-600">({settings.googleReviewCount || 247} reviews)</span>
                          <Badge variant="secondary" className="ml-auto">Google Reviews</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          This is how your rating will appear on your menus
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Benefits of Google Integration</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>Build trust by displaying your real Google rating</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>Encourage customers to leave reviews directly from your menu</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>Improve your online reputation and visibility</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>Ratings update automatically from your Google Business profile</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Tab */}
        {activeTab === 'account' && (
          <div className="space-y-8">
            {/* Account Information */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('settings.account.infoTitle')}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">{t('settings.account.infoSubtitle')}</p>

                <div className="space-y-6">
                  {/* Email Address - Locked */}
                  <div>
                    <Label htmlFor="email">{t('settings.account.email')}</Label>
                    <div className="relative mt-1">
                      <Input
                        id="email"
                        value={accountSettings.email}
                        disabled
                        className="bg-gray-50 text-gray-600 cursor-not-allowed pr-10"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('settings.account.emailLocked')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password & Security */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('settings.account.securityTitle')}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">{t('settings.account.securitySubtitle')}</p>

                <div className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <Label htmlFor="currentPassword">{t('settings.account.currentPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={accountSettings.currentPassword}
                        onChange={(e) => handleAccountInputChange('currentPassword', e.target.value)}
                        placeholder={t('settings.account.currentPasswordPlaceholder')}
                        className="mt-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <Label htmlFor="newPassword">{t('settings.account.newPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={accountSettings.newPassword}
                        onChange={(e) => handleAccountInputChange('newPassword', e.target.value)}
                        placeholder={t('settings.account.newPasswordPlaceholder')}
                        className="mt-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Password Strength</span>
                      <Badge variant="secondary" className="text-orange-600 bg-orange-50">
                        {accountSettings.newPassword.length === 0 ? 'Not set' : accountSettings.newPassword.length < 8 ? 'Weak' : 'Strong'}
                      </Badge>
                    </div>
                  </div>

                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Language Preferences */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('settings.account.languageTitle')}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  {t('settings.account.languageSubtitle')}
                </p>

                <LanguageSwitcherCards />

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm mb-1">{t('settings.account.languageDetection')}</h4>
                      <p className="text-sm text-blue-800">
                        {t('settings.account.languageDetectionDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Trial Status or Active Subscription */}
            {currentPlan === 'trial' ? (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('settings.billing.trialActive')}</h2>
                        <p className="text-gray-600 mt-1">{t('settings.billing.trialActiveDesc')}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600 text-white px-4 py-2 text-base">
                      {t('settings.billing.trial')}
                    </Badge>
                  </div>

                  {/* Trial Progress */}
                  <div className="bg-white rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">{t('settings.billing.trialProgress')}</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {t('settings.billing.daysRemaining', { days: trialDaysLeft })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${((30 - trialDaysLeft) / 30) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('settings.billing.trialStarted', { date: trialStartDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) })}
                    </p>
                  </div>

                  {/* What happens next */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 text-sm mb-1">{t('settings.billing.afterTrial')}</h4>
                        <p className="text-sm text-yellow-800">
                          {t('settings.billing.afterTrialDesc', { days: trialDaysLeft })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg">
                    <Crown className="w-5 h-5 mr-2" />
                    {t('settings.billing.subscribeNow')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('settings.billing.activeTitle')}</h2>
                        <p className="text-gray-600 mt-1">{t('settings.billing.activeDesc')}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white px-4 py-2 text-base">
                      {t('settings.billing.active')}
                    </Badge>
                  </div>

                  <div className="bg-white rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{t('settings.billing.monthlySubscription')}</p>
                        <p className="text-3xl font-bold text-gray-900">€10.00</p>
                        <p className="text-sm text-gray-500 mt-1">{t('settings.billing.billedMonthly')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">{t('settings.billing.nextBilling')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      {t('settings.billing.cancelSubscription')}
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      {t('settings.billing.updatePayment')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing Information */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('settings.billing.pricingTitle')}</h3>

                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{t('settings.billing.price')}</h4>
                      <p className="text-gray-600 mt-1">{t('settings.billing.fullAccess')}</p>
                    </div>
                    <Crown className="w-12 h-12 text-purple-600" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{t('settings.billing.feature1')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{t('settings.billing.feature2')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{t('settings.billing.feature3')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{t('settings.billing.feature4')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{t('settings.billing.feature5')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{t('settings.billing.feature6')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{t('settings.billing.feature7')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm mb-1">💡 {t('settings.billing.simplePricing')}</h4>
                      <p className="text-sm text-blue-800">
                        {t('settings.billing.simplePricingDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            {currentPlan === 'paid' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Payment Method</h3>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        VISA
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing History */}
            {currentPlan === 'paid' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Billing History</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">View and download your invoices</p>

                  <div className="space-y-3">
                    {[
                      { date: 'Dec 1, 2024', amount: '€10.00', status: 'Paid' },
                      { date: 'Nov 1, 2024', amount: '€10.00', status: 'Paid' },
                      { date: 'Oct 1, 2024', amount: '€10.00', status: 'Paid' },
                    ].map((invoice, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium text-gray-900">{invoice.date}</p>
                            <p className="text-sm text-gray-600">Monthly Subscription</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-gray-900">{invoice.amount}</p>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {invoice.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
