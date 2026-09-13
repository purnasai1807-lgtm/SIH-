import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export const BorrowerSignUpPage: React.FC = () => {
  const { registerBorrower } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State - Fast Borrower Signup (Only authorized representative & account credentials)
  const [formData, setFormData] = useState({
    authorizedName: '',
    username: '',
    email: '',
    mobile: '',
    designation: 'Managing Director & Founder',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    privacyAccepted: false,
    dataConsentAccepted: false
  });

  // Password validation logic
  const isPasswordMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const isPasswordValid = isPasswordMinLength && hasUppercase && hasLowercase && hasNumber;
  const isPasswordMatching = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const calculatePasswordStrength = (): { score: number; label: string; color: string } => {
    let score = 0;
    if (formData.password.length >= 8) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (/[^A-Za-z0-9]/.test(formData.password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Moderate', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.authorizedName.trim()) {
      return setFormError('Authorized person name is required.');
    }
    if (!formData.username.trim() || formData.username.length < 4) {
      return setFormError('Username is required and must be at least 4 characters.');
    }
    if (/\s/.test(formData.username)) {
      return setFormError('Username cannot contain spaces.');
    }
    if (authService.isUsernameTaken(formData.username)) {
      return setFormError('Username is already taken. Please choose another username.');
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      return setFormError('Please enter a valid email address.');
    }
    if (authService.isEmailTaken(formData.email)) {
      return setFormError('An account with this email already exists.');
    }
    if (!formData.mobile.trim() || formData.mobile.replace(/\D/g, '').length < 10) {
      return setFormError('Please enter a valid 10-digit mobile number.');
    }
    if (!formData.designation.trim()) {
      return setFormError('Designation is required.');
    }
    if (!isPasswordValid) {
      return setFormError('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setFormError('Passwords do not match.');
    }
    if (!formData.termsAccepted || !formData.privacyAccepted || !formData.dataConsentAccepted) {
      return setFormError('You must agree to the Terms, Privacy Policy, and Data Consent to register.');
    }

    setIsSubmitting(true);

    try {
      const res = await registerBorrower({
        authorizedName: formData.authorizedName,
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        designation: formData.designation,
        password: formData.password,
        termsAccepted: formData.termsAccepted,
        privacyAccepted: formData.privacyAccepted,
        dataConsentAccepted: formData.dataConsentAccepted
      });

      if (res.success) {
        // Immediately navigate to borrower dashboard
        navigate('/borrower/dashboard', { replace: true });
      } else {
        setFormError(res.error || 'Failed to create business account.');
        setIsSubmitting(false);
      }
    } catch {
      setFormError('An unexpected error occurred during signup.');
      setIsSubmitting(false);
    }
  };

  const strength = calculatePasswordStrength();

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                Fast Sign Up • Business Portal
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
                Register Business Account
              </h1>
            </div>
            <div className="text-xs text-slate-400 font-semibold">
              Portal: <span className="text-white">Borrower</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Create your owner account quickly. Detailed statutory filings, financials, and verification are completed inside your Profile.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {formError && (
            <div
              id="borrower-signup-error-alert"
              role="alert"
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Authorized Person Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Owner / Authorized Representative Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="borrower-authorizedname-input"
              type="text"
              required
              value={formData.authorizedName}
              onChange={e => setFormData({ ...formData, authorizedName: e.target.value })}
              placeholder="e.g. Rajesh Singhania"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Username & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                id="borrower-username-input"
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value.replace(/\s/g, '').toLowerCase() })}
                placeholder="min 4 chars, no spaces"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Unique portal username</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                id="borrower-designation-input"
                type="text"
                required
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Managing Director / Partner"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Mobile & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="borrower-email-input"
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. contact@business.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="borrower-mobile-input"
                type="tel"
                required
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="borrower-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="borrower-confirmpassword-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className={`w-full px-3.5 py-2.5 pr-10 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                    formData.confirmPassword
                      ? isPasswordMatching
                        ? 'border-emerald-300'
                        : 'border-rose-300'
                      : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && !isPasswordMatching && (
                <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                  Passwords do not match.
                </span>
              )}
            </div>
          </div>

          {/* Password Requirements helper */}
          {formData.password && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Strength:</span>
                <span className="font-bold text-slate-700">{strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${(strength.score / 5) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                <span className={`flex items-center gap-1 ${isPasswordMinLength ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className="w-3 h-3" /> 8+ characters
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className="w-3 h-3" /> Uppercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className="w-3 h-3" /> Lowercase letter
                </span>
                <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 font-semibold' : ''}`}>
                  <Check className="w-3 h-3" /> Number
                </span>
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="pt-2 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                id="borrower-terms-checkbox"
                type="checkbox"
                required
                checked={formData.termsAccepted}
                onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <span className="text-xs text-slate-600">
                I agree to the <span className="font-semibold text-slate-900 underline">Terms and Conditions</span> governing the CodeVest enterprise financing network.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                id="borrower-privacy-checkbox"
                type="checkbox"
                required
                checked={formData.privacyAccepted}
                onChange={e => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <span className="text-xs text-slate-600">
                I acknowledge the <span className="font-semibold text-slate-900 underline">Privacy Policy</span> and enterprise confidentiality guarantees.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                id="borrower-dataconsent-checkbox"
                type="checkbox"
                required
                checked={formData.dataConsentAccepted}
                onChange={e => setFormData({ ...formData, dataConsentAccepted: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
              />
              <span className="text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Data Consent:</span> I consent to subsequent verification of statutory and financial disclosures during the profile completion phase.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              id="borrower-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account & Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/borrower/signin" className="text-blue-600 font-bold hover:underline">
              Sign In to Business Portal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
