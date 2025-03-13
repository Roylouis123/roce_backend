// SignUp.jsx
import React, { useState } from 'react';
import { signUp, signIn, resetPassword, confirmResetPassword, confirmSignUp } from 'aws-amplify/auth';
import './SignUp.css';

// Simple get utility function (similar to lodash.get)
const get = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    resetCode: '',
    verificationCode: ''
  });
  const [mode, setMode] = useState('signup'); // 'signup', 'login', 'forgot', or 'verify'
  const [step, setStep] = useState(1); // 1 for initial form, 2 for verification/reset steps
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle Signup - Step 1
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const resp = await signUp({
        username: formData.phoneNumber,
        password: formData.password,
        attributes: {
          phone_number: formData.phoneNumber
        }
      });

      const isOtpDelivery =
        get(resp, 'nextStep.codeDeliveryDetails.attributeName') === 'phone_number';
      
      if (
        isOtpDelivery &&
        get(resp, 'nextStep.signUpStep') === 'CONFIRM_SIGN_UP'
      ) {
        setMode('verify');
        setStep(2);
        setSuccessMessage('Please check your phone for verification code');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup Verification - Step 2
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await confirmSignUp({
        username: formData.phoneNumber,
        confirmationCode: formData.verificationCode
      });
      setSuccessMessage('Account verified successfully! Please login.');
      setMode('login');
      setStep(1);
      setFormData({ phoneNumber: '', password: '', confirmPassword: '', resetCode: '', verificationCode: '' });
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn({
        username: formData.phoneNumber,
        password: formData.password
      });
      setSuccessMessage('Login successful!');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password - Step 1: Send reset code
  const handleForgotPasswordStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPassword({ username: formData.phoneNumber });
      setSuccessMessage('Reset code sent! Check your phone.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'An error occurred sending reset code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password - Step 2: Confirm reset
  const handleForgotPasswordStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await confirmResetPassword({
        username: formData.phoneNumber,
        confirmationCode: formData.resetCode,
        newPassword: formData.password
      });
      setSuccessMessage('Password reset successful! Please login.');
      setMode('login');
      setStep(1);
      setFormData({ phoneNumber: '', password: '', confirmPassword: '', resetCode: '', verificationCode: '' });
    } catch (err) {
      setError(err.message || 'An error occurred resetting password');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (mode === 'signup' && step === 1) handleSignUp(e);
    else if (mode === 'verify' && step === 2) handleVerify(e);
    else if (mode === 'login') handleLogin(e);
    else if (mode === 'forgot' && step === 1) handleForgotPasswordStep1(e);
    else if (mode === 'forgot' && step === 2) handleForgotPasswordStep2(e);
  };

  const renderFormFields = () => {
    switch (mode) {
      case 'signup':
        return (
          <>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number (e.g., +1234567890)"
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              disabled={loading}
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              disabled={loading}
            />
          </>
        );
      case 'verify':
        return (
          <>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number (e.g., +1234567890)"
              required
              disabled={true}
            />
            <input
              type="text"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleChange}
              placeholder="Verification Code"
              required
              disabled={loading}
            />
          </>
        );
      case 'login':
        return (
          <>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number (e.g., +1234567890)"
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              disabled={loading}
            />
          </>
        );
      case 'forgot':
        if (step === 1) {
          return (
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number (e.g., +1234567890)"
              required
              disabled={loading}
            />
          );
        } else {
          return (
            <>
              <input
                type="text"
                name="resetCode"
                value={formData.resetCode}
                onChange={handleChange}
                placeholder="Reset Code"
                required
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="New Password"
                required
                disabled={loading}
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm New Password"
                required
                disabled={loading}
              />
            </>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
     KILL ME <h2>
        {mode === 'signup' ? 'Sign Up' : 
         mode === 'verify' ? 'Verify Phone Number' :
         mode === 'login' ? 'Login' : 
         `Forgot Password${step === 1 ? '' : ' - Enter Code'}`}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {renderFormFields()}
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 
           mode === 'signup' ? 'Sign Up' : 
           mode === 'verify' ? 'Verify' :
           mode === 'login' ? 'Login' : 
           step === 1 ? 'Send Reset Code' : 'Reset Password'}
        </button>
      </form>

      <div className="mode-switch">
        {(mode !== 'signup' && mode !== 'verify') && (
          <button onClick={() => { 
            setMode('signup'); 
            setStep(1); 
            setError(''); 
            setSuccessMessage(''); 
          }}>
            Go to Signup
          </button>
        )}
        {mode !== 'login' && (
          <button onClick={() => { 
            setMode('login'); 
            setStep(1); 
            setError(''); 
            setSuccessMessage(''); 
          }}>
            Go to Login
          </button>
        )}
        {mode !== 'forgot' && (
          <button onClick={() => { 
            setMode('forgot'); 
            setStep(1); 
            setError(''); 
            setSuccessMessage(''); 
          }}>
            Forgot Password?
          </button>
        )}
      </div>
    </div>
  );
};

export default SignUp;