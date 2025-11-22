import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Phone, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from '../store/LanguageContext';
import { apiFetch } from '../data/api';

export default function ChangePhone() {
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingCooldown, setIsCheckingCooldown] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const { currentPhone, email } = location.state || {};

  // Check cooldown status on component mount
  useEffect(() => {
    const checkCooldownStatus = async () => {
      try {
        const response = await apiFetch('/auth/phone-verification-cooldown/', {
          method: 'GET',
        });

        if (response.success) {
          console.log('ChangePhone - Cooldown response:', response.data);
          
          // If cooldown is active, redirect back to verification page
          if (response.data.cooldown_active) {
            console.log('ChangePhone - Cooldown is active, redirecting back');
            toast({
              title: 'Cannot Change Phone Number',
              description: `Please wait ${Math.floor(response.data.cooldown_remaining / 60)} minutes and ${response.data.cooldown_remaining % 60} seconds before changing your phone number.`,
              type: 'error'
            });
            navigate('/auth/verify-phone');
            return;
          }
          
          // If there's an active code, also redirect back
          if (response.data.has_active_code) {
            console.log('ChangePhone - Active code exists, redirecting back');
            toast({
              title: 'Cannot Change Phone Number',
              description: 'You have an active verification code. Please use it or wait for it to expire before changing your phone number.',
              type: 'error'
            });
            navigate('/auth/verify-phone');
            return;
          }
          
          console.log('ChangePhone - No cooldown or active code, allowing phone change');
        }
      } catch (error) {
        console.log('ChangePhone - Error checking cooldown status:', error);
        toast({
          title: 'Error',
          description: 'Unable to verify cooldown status. Please try again.',
          type: 'error'
        });
        navigate('/auth/verify-phone');
      } finally {
        setIsCheckingCooldown(false);
      }
    };

    checkCooldownStatus();
  }, [navigate, toast]);

  const handleSendCode = async () => {
    if (!newPhoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const response = await apiFetch('/auth/request-phone-verification/', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: newPhoneNumber.trim(),
        }),
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Verification code sent to your new phone number!',
          type: 'success'
        });
        
        // Navigate back to OTP verification with new phone number
        navigate('/auth/verify-phone', {
          state: {
            phoneNumber: newPhoneNumber.trim(),
            email: email,
            message: 'Code sent to your new phone number'
          }
        });
      } else {
        let errorMessage = response.error?.message || response.error || 'Failed to send verification code';
        
        // Handle phone number already exists error
        if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
          errorMessage = 'This phone number is already registered with another account. Please use a different number.';
        }
        
        // Ensure errorMessage is always a string
        if (typeof errorMessage === 'object') {
          errorMessage = JSON.stringify(errorMessage);
        }
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setError('Failed to send verification code. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Show loading state while checking cooldown
  if (isCheckingCooldown) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-white/80">Checking verification status...</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
      {/* Back to Phone Verification */}
      <button
        onClick={() => navigate('/auth/verify-phone')}
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to Verification</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Phone className="h-6 w-6 text-white" />
              <span className="text-xl font-bold text-white">Change Phone Number</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Enter New Phone Number</CardTitle>
            <CardDescription className="text-white/80">
              We'll send a verification code to your new phone number
            </CardDescription>
            {currentPhone && (
              <CardDescription className="text-white/70 text-sm">
                Current: {currentPhone}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white text-sm">
                New Phone Number
              </Label>
              <Input
                type="tel"
                placeholder={t('auth.changePhone.placeholder')}
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder-white/50 focus:border-white/50"
                disabled={isSending}
              />
              <p className="text-white/60 text-xs">
                Include country code (e.g., +1234567890)
              </p>
            </div>

            <Button
              onClick={handleSendCode}
              disabled={!newPhoneNumber.trim() || isSending}
              className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              {isSending ? 'Sending Code...' : 'Send Verification Code'}
            </Button>

            <div className="text-center">
              <button
                onClick={() => navigate('/auth/verify-phone')}
                className="text-white/70 hover:text-white text-sm underline"
              >
                Use Current Phone Number Instead
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

ChangePhone.loader = async () => {
  return {};
};
