import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Phone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../data/api';

export default function PhoneVerification({ 
  phoneNumber, 
  onVerificationComplete, 
  onBack,
  onResend 
}) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setVerificationCode(value);
      setError('');
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Call backend verification API
      const response = await apiFetch('/auth/confirm-phone-verification/', {
        method: 'POST',
        body: JSON.stringify({
          verification_id: localStorage.getItem('verification_id'),
          verification_code: verificationCode,
        }),
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Phone number verified successfully!',
          type: 'success'
        });
        onVerificationComplete();
      } else {
        // Handle error response - ensure it's a string
        console.log('PhoneVerification: Error response:', response);
        let errorMessage = response.error?.message || response.error || 'Invalid verification code';
        
        // Ensure errorMessage is always a string
        if (typeof errorMessage === 'object') {
          errorMessage = JSON.stringify(errorMessage);
        }
        
        console.log('PhoneVerification: Error message:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      const response = await apiFetch('/auth/request-phone-verification/', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
      });

      if (response.success) {
        localStorage.setItem('verification_id', response.data.verification_id);
        setTimeLeft(600);
        setCanResend(false);
        toast({
          title: 'Success',
          description: 'Verification code sent!',
          type: 'success'
        });
      } else {
        let errorMessage = response.error?.message || response.error || 'Failed to resend code';
        
        // Ensure errorMessage is always a string
        if (typeof errorMessage === 'object') {
          errorMessage = JSON.stringify(errorMessage);
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          type: 'error'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend code. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Phone className="h-6 w-6 text-white" />
            <span className="text-xl font-bold text-white">Phone Verification</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Verify Your Phone</CardTitle>
          <CardDescription className="text-white/80">
            We sent a 6-digit code to <strong>{phoneNumber}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="verificationCode" className="text-white">
              Verification Code
            </Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={handleCodeChange}
              className="text-center text-2xl tracking-widest bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <div className="text-center text-sm text-white/70">
            {timeLeft > 0 ? (
              <span>Code expires in {formatTime(timeLeft)}</span>
            ) : (
              <span className="text-red-400">Code expired</span>
            )}
          </div>

          <Button
            onClick={handleVerify}
            disabled={verificationCode.length !== 6 || isVerifying}
            className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
          >
            {isVerifying ? 'Verifying...' : 'Verify Phone Number'}
          </Button>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={!canResend}
              className="text-white/70 hover:text-white disabled:opacity-50"
            >
              Resend Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
