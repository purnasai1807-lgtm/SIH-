import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { LenderLayout } from './layouts/LenderLayout';
import { BorrowerLayout } from './layouts/BorrowerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { SecurityPage } from './pages/public/SecurityPage';
import { FAQPage } from './pages/public/FAQPage';
import { TrustVerificationPage } from './pages/public/TrustVerificationPage';
import { RiskIntelligencePage } from './pages/public/RiskIntelligencePage';

// Auth Pages
import { LenderSignInPage } from './pages/auth/LenderSignInPage';
import { LenderSignUpPage } from './pages/auth/LenderSignUpPage';
import { BorrowerSignInPage } from './pages/auth/BorrowerSignInPage';
import { BorrowerSignUpPage } from './pages/auth/BorrowerSignUpPage';
import { AdminSignInPage } from './pages/auth/AdminSignInPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Lender Pages
import { LenderDashboard } from './pages/lender/Dashboard';
import { OpportunitiesPage } from './pages/lender/Opportunities';
import { OpportunityDetail } from './pages/lender/OpportunityDetail';
import { PortfolioPage } from './pages/lender/Portfolio';
import { WhatIfSimulationPage } from './pages/lender/WhatIfSimulation';
import { LenderProfilePage } from './pages/lender/LenderProfile';

// Borrower Pages
import { BorrowerDashboard } from './pages/borrower/Dashboard';
import { BusinessHealthPage } from './pages/borrower/BusinessHealth';
import { FinancingRequestPage } from './pages/borrower/FinancingRequest';
import { BorrowerRepaymentsPage } from './pages/borrower/Repayments';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { VerificationQueuePage } from './pages/admin/VerificationQueue';
import { TelemetryOpsPage } from './pages/admin/TelemetryOps';
import { UsersPage } from './pages/admin/UsersPage';
import { BorrowersPage } from './pages/admin/BorrowersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/trust-verification" element={<TrustVerificationPage />} />
            <Route path="/risk-intelligence" element={<RiskIntelligencePage />} />

            {/* Authentication Pages */}
            <Route path="/lender/signin" element={<LenderSignInPage />} />
            <Route path="/lender/signup" element={<LenderSignUpPage />} />
            <Route path="/borrower/signin" element={<BorrowerSignInPage />} />
            <Route path="/borrower/signup" element={<BorrowerSignUpPage />} />
            <Route path="/admin/signin" element={<AdminSignInPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Protected Lender Routes */}
          <Route path="/lender" element={<LenderLayout />}>
            <Route path="dashboard" element={<LenderDashboard />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="opportunities/:id" element={<OpportunityDetail />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="what-if" element={<WhatIfSimulationPage />} />
            <Route path="simulator" element={<Navigate to="/lender/what-if" replace />} />
            <Route path="monitoring" element={<Navigate to="/lender/portfolio" replace />} />
            <Route path="risk" element={<Navigate to="/lender/opportunities" replace />} />
            <Route path="dependency" element={<Navigate to="/lender/opportunities" replace />} />
            <Route path="alerts" element={<Navigate to="/lender/dashboard" replace />} />
            <Route path="profile" element={<LenderProfilePage />} />
            <Route path="settings" element={<Navigate to="/lender/profile" replace />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Protected Borrower Routes */}
          <Route path="/borrower" element={<BorrowerLayout />}>
            <Route path="dashboard" element={<BorrowerDashboard />} />
            <Route path="health" element={<BusinessHealthPage />} />
            <Route path="profile" element={<Navigate to="/borrower/health" replace />} />
            <Route path="financing" element={<Navigate to="/borrower/financing-request" replace />} />
            <Route path="financing-request" element={<FinancingRequestPage />} />
            <Route path="monitoring" element={<Navigate to="/borrower/health" replace />} />
            <Route path="documents" element={<Navigate to="/borrower/financing-request" replace />} />
            <Route path="alerts" element={<Navigate to="/borrower/dashboard" replace />} />
            <Route path="profile-user" element={<Navigate to="/borrower/dashboard" replace />} />
            <Route path="settings" element={<Navigate to="/borrower/dashboard" replace />} />
            <Route path="repayments" element={<BorrowerRepaymentsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="borrowers" element={<BorrowersPage />} />
            <Route path="verifications" element={<VerificationQueuePage />} />
            <Route path="verification" element={<VerificationQueuePage />} />
            <Route path="telemetry" element={<TelemetryOpsPage />} />
            <Route path="monitoring" element={<Navigate to="/admin/telemetry" replace />} />
            <Route path="alerts" element={<Navigate to="/admin/telemetry" replace />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
