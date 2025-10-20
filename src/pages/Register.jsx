import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Separator } from '../components/ui/Separator';
import { QrCode, Mail, Lock, User, ArrowLeft, Chrome, Eye, EyeOff, Phone, ChevronDown } from 'lucide-react';
import { useTranslation } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';

// Country codes with flags
const countryCodes = [
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+351',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [error, setError] = useState(undefined);
  const [fieldErrors, setFieldErrors] = useState({});
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, isLoading, error: authError, clearError, isAuthenticated } = useAuth();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  
  // Handle auth logic internally to prevent remounting
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      setError(t('auth.register.alertName'));
      return;
    }

    if (!formData.email.trim()) {
      setError(t('auth.register.alertEmail'));
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!formData.password) {
      setError(t('auth.register.alertPassword'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.alertPasswordMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.register.alertPasswordLength'));
      return;
    }

    try {
      
      // Call backend register API
      const result = await register({
        email: formData.email,
        name: formData.name,
        phone: `${formData.countryCode}${formData.phone}`,
        password: formData.password,
      });

      if (result.success) {
        // Registration successful - redirect to phone verification
        navigate('/auth/verify-phone', {
          state: {
            email: formData.email,
            message: 'Please verify your phone number to continue',
          },
        });
      } else {
        // Handle field-specific validation errors
        handleRegistrationError(result.error);
      }
    } catch (error) {
      setError(t('auth.register.alertError'));
    }
  };

  const handleRegistrationError = (error) => {
    // Handle field-specific validation errors
    if (error && typeof error === 'object') {
      const errorData = error.data || error;
      
      const errors = {};
      Object.keys(errorData).forEach(field => {
        if (Array.isArray(errorData[field])) {
          errors[field] = errorData[field][0];
        }
      });
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        setError(error?.message || t('auth.register.alertError'));
      }
    } else {
      setError(error?.message || t('auth.register.alertError'));
    }
  };
  const handleGoogleSignIn = () => {
    alert(t('auth.register.googleDev'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">{t('auth.back')}</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <QrCode className="h-6 w-6 md:h-8 md:w-8 text-white" />
              <span className="text-xl md:text-2xl font-bold text-white">{t('app.name')}</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">{t('auth.register.title')}</CardTitle>
            <CardDescription className="text-white/80">{t('auth.register.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || authError) && (
              <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-2 rounded-md text-sm">
                {error || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  {t('auth.register.fullName')}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('auth.register.fullNamePlaceholder')}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  {t('auth.register.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('auth.register.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 ${
                      fieldErrors.email ? 'border-red-500' : ''
                    }`}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-400 text-sm">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/30 text-white rounded-md hover:bg-white/20 focus:outline-none focus:border-white/50 min-w-[120px]"
                    >
                      <span className="text-lg">
                        {countryCodes.find(c => c.code === formData.countryCode)?.flag}
                      </span>
                      <span className="text-sm">{formData.countryCode}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, countryCode: country.code }));
                              setShowCountryDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 focus:outline-none"
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm font-medium">{country.code}</span>
                            <span className="text-sm text-gray-600">{country.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Phone Number Input */}
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="969850699"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 ${
                        fieldErrors.phone ? 'border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                </div>
                {fieldErrors.phone && (
                  <p className="text-red-400 text-sm">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  {t('auth.register.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  {t('auth.register.confirmPassword')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? t('auth.register.submitting') : t('auth.register.submit')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-white/70">{t('auth.register.or')}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={handleGoogleSignIn}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {t('auth.register.google')}
            </Button>

            <div className="text-center text-sm">
              <span className="text-white/70">{t('auth.register.haveAccount')} </span>
              <Link to="/auth/login" className="text-white hover:underline font-medium">
                {t('auth.register.signIn')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

Register.loader = async () => {
  return {};
};
