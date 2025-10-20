import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Phone, ArrowLeft, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../data/api';
import { useAuth } from '../store/AuthContext';

export default function VerifyPhone() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isCheckingCooldown, setIsCheckingCooldown] = useState(true);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { refreshUser, user } = useAuth();
  
  const { phoneNumber: statePhoneNumber, email, message } = location.state || {};
  // Always prioritize backend user data as source of truth
  const phoneNumber = user?.phone || statePhoneNumber;

  // Redirect if no phone number provided or if already verified
  useEffect(() => {
    console.log('VerifyPhone: Checking user state', {
      phoneNumber,
      userPhone: user?.phone,
      statePhoneNumber,
      user,
      is_phone_verified: user?.is_phone_verified,
      has_instances: user?.has_instances,
      instances: user?.instances
    });
    
    // Wait for user data to load
    if (!user) {
      console.log('VerifyPhone: User data not loaded yet, waiting...');
      return;
    }
    
    if (!phoneNumber) {
      console.log('VerifyPhone: No phone number, redirecting to register');
      navigate('/auth/register');
    } else if (user?.is_phone_verified) {
      console.log('VerifyPhone: User already verified, redirecting to appropriate page');
      // User is already verified, redirect to appropriate page
      if (user?.has_instances || user?.instances?.length > 0) {
        console.log('VerifyPhone: User has instances, redirecting to dashboard');
        navigate('/dashboard');
      } else {
        console.log('VerifyPhone: User has no instances, redirecting to onboarding');
        navigate('/onboarding');
      }
    }
  }, [phoneNumber, user, navigate]);

  // Countdown timer


  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      setError('');

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

  const handleVerify = async () => {
    if (verificationCode.some(digit => digit === '')) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await apiFetch('/auth/confirm-phone-verification/', {
        method: 'POST',
        body: JSON.stringify({
          verification_code: verificationCode.join(''),
        }),
      });

      if (response.success) {
        console.log('VerifyPhone: Phone verification successful, refreshing user data');
        console.log('VerifyPhone: Response data:', response.data);
        
        // Refresh user data to get updated verification status
        const refreshResult = await refreshUser();
        console.log('VerifyPhone: User data refreshed', refreshResult);
        
        toast({
          title: 'Success',
          description: 'Phone number verified successfully!',
          type: 'success'
        });
        
        // Force page reload to ensure fresh user state
        console.log('VerifyPhone: Reloading page to get fresh user state');
        window.location.href = '/onboarding';
      } else {
        // Handle error response - ensure it's a string
        console.log('VerifyPhone: Error response:', response);
        let errorMessage = response.error?.message || response.error || 'Invalid verification code';
        
        // Ensure errorMessage is always a string
        if (typeof errorMessage === 'object') {
          errorMessage = JSON.stringify(errorMessage);
        }
        
        console.log('VerifyPhone: Error message:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber) return;

    console.log('handleSendCode: Sending phone number:', phoneNumber);
    console.log('handleSendCode: User phone from backend:', user?.phone);
    console.log('handleSendCode: State phone number:', statePhoneNumber);

    setIsSending(true);
    setError('');

    try {
      const response = await apiFetch('/auth/request-phone-verification/', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
      });

      if (response.success) {
        setCanResend(false);
        setCooldownRemaining(600); // 10 minutes in seconds
        toast({
          title: 'Success',
          description: 'Verification code sent!',
          type: 'success'
        });
      } else {
        let errorMessage = response.error?.message || response.error || 'Failed to send verification code';
        
        // Handle cooldown error
        if (response.cooldown_remaining) {
          setCooldownRemaining(response.cooldown_remaining);
          setCanResend(false);
          errorMessage = `Please wait ${Math.floor(response.cooldown_remaining / 60)} minutes and ${response.cooldown_remaining % 60} seconds before requesting another code.`;
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

  const handleResend = async () => {
    if (!canResend) return;
    await handleSendCode();
  };

  // Check cooldown status on component mount
  useEffect(() => {
    const checkCooldownStatus = async () => {
      try {
        const response = await apiFetch('/auth/phone-verification-cooldown/', {
          method: 'GET',
        });

        if (response.success) {
          console.log('Cooldown response:', response.data);
          if (response.data.cooldown_active) {
            console.log('Cooldown is active, hiding phone change link');
            setCooldownRemaining(response.data.cooldown_remaining);
            setCanResend(false);
            setShowPhoneInput(false);
          } else {
            console.log('Cooldown expired, has_active_code:', response.data.has_active_code);
            setCooldownRemaining(0);
            setCanResend(true);
            // Only show phone change link if there's no active code
            setShowPhoneInput(!response.data.has_active_code);
            
            // If we can send and there's no active code, automatically request verification
            if (response.data.can_send && !response.data.has_active_code && phoneNumber) {
              console.log('Automatically requesting phone verification code');
              await handleSendCode();
            }
          }
        }
      } catch (error) {
        console.log('Error checking cooldown status:', error);
      } finally {
        setIsCheckingCooldown(false);
      }
    };

    checkCooldownStatus();
  }, [phoneNumber]);

  // Update cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldownRemaining]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
      {/* Back to Register */}
      <button
        onClick={() => navigate('/auth/register')}
        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to Register</span>
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
              <span className="text-xl font-bold text-white">Phone Verification</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Verify Your Phone</CardTitle>
            <CardDescription className="text-white/80">
              {isCheckingCooldown 
                ? `Checking verification status...`
                : cooldownRemaining > 0 
                  ? `We sent a 6-digit code to ${phoneNumber}`
                  : `We'll send a 6-digit code to ${phoneNumber}`
              }
            </CardDescription>
            {message && (
              <CardDescription className="text-white/70 text-sm">
                {message}
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

            {/* Always show verification form */}
            <div className="space-y-4">
              <Label className="text-white text-center block">
                Enter Verification Code
              </Label>
              <div className="flex justify-center gap-3">
                {verificationCode.map((digit, index) => (
                  <Input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold bg-white/10 border-white/30 text-white focus:border-white/50"
                  />
                ))}
              </div>
            </div>

            {/* Change phone number link when cooldown expired and no active code */}
            {showPhoneInput && cooldownRemaining === 0 && (
              <div className="text-center">
                <button
                  onClick={() => navigate('/auth/change-phone', {
                    state: {
                      currentPhone: phoneNumber,
                      email: email
                    }
                  })}
                  className="text-white/70 hover:text-white text-sm underline"
                >
                  Change Phone Number
                </button>
              </div>
            )}

            <Button
              onClick={handleVerify}
              disabled={verificationCode.some(digit => digit === '') || isVerifying}
              className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              {isVerifying ? 'Verifying...' : 'Verify Phone Number'}
            </Button>

            <div className="text-center">
              {isCheckingCooldown ? (
                <div className="text-white/70">Checking status...</div>
              ) : cooldownRemaining > 0 ? (
                <div className="text-white/70 text-sm">
                  Resend available in {Math.floor(cooldownRemaining / 60)}:{(cooldownRemaining % 60).toString().padStart(2, '0')}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleResend}
                  disabled={!canResend}
                  className="text-white/70 hover:text-white disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resend Code
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

VerifyPhone.loader = async () => {
  return {};
};
