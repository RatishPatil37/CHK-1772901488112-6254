import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import { useNavigate, Routes, Route } from "react-router-dom";
import { useAuth } from './AuthContext';
import Profile from "./Pages/Profile";
import VapiButton from './Vapibutton';

// Auth Callback Component
function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading, checkOnboardedStatus } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!loading && user) {
        const urlParams = new URLSearchParams(window.location.search);
        const fromDataCollection = urlParams.get('from') === 'datacollection';

        if (fromDataCollection) {
          // Coming from data collection, user is onboarded
          navigate('/');
          return;
        }

        // Check if user is onboarded
        const isOnboarded = await checkOnboardedStatus(user.id);
        if (!isOnboarded) {
          // Redirect to data collection app
          window.location.href = 'http://localhost:5173';
          return;
        }

        // User is onboarded, go to main app
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [loading, user, navigate, checkOnboardedStatus]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '18px'
    }}>
      Completing authentication...
    </div>
  );
}



function App() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signOut } = useAuth();

  // Language code map for Google Translate
  const langCodeMap = {
    'English': 'en',
    'हिंदी': 'hi',
    'मराठी': 'mr',
    'தமிழ்': 'ta',
    'తెలుగు': 'te',
  };

  // On mount: load GT script and inject styles
  useEffect(() => {
    // Read initial language from cookie to keep state consistent on refresh
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]+)/);
    if (match) {
      const langCodeDecoded = decodeURIComponent(match[1]);
      const langCode = langCodeDecoded.split('/').pop();
      const langName = Object.keys(langCodeMap).find(key => langCodeMap[key] === langCode);
      if (langName) {
        setSelectedLanguage(langName);
      }
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'en,hi,mr,ta,te', autoDisplay: false },
        'google_translate_element_hidden'
      );
    };

    if (!document.getElementById('gt-script')) {
      const script = document.createElement('script');
      script.id = 'gt-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Hide the Google Translate banners
    if (!document.getElementById('gt-styles')) {
      const style = document.createElement('style');
      style.id = 'gt-styles';
      style.innerHTML = `
        body { top: 0 !important; }
        .skiptranslate, .goog-te-banner-frame { display: none !important; }
        #goog-gt-tt { display: none !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    const langCode = langCodeMap[lang];
    if (!langCode) return;

    // Try finding the native GT dropdown and change it directly (instant translate)
    const gtCombo = document.querySelector('.goog-te-combo');
    if (gtCombo) {
      gtCombo.value = langCode;
      gtCombo.dispatchEvent(new Event('change'));
    } else {
      // Fallback if GT widget hasn't fully loaded yet
      if (langCode === 'en') {
        const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = `googtrans=; ${expiry}; path=/`;
        document.cookie = `googtrans=; ${expiry}; path=/; domain=${window.location.hostname}`;
      } else {
        const value = `/en/${langCode}`;
        document.cookie = `googtrans=${value}; path=/`;
        document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
      }
      window.location.reload();
    }
  };
  const [schemes, setSchemes] = useState([
    {
      _id: 1,
      scheme_name: 'PM Fasal Bima Yojana',
      category: 'Farmers',
      state: 'All India',
      income_level: 'All',
      summary: 'Low-premium crop insurance against natural disasters and weather events.',
      eligibility_criteria: 'Farmers across India',
      benefits: 'Insurance coverage',
      application_link: 'https://pmfby.gov.in/',
      eligibility_score: 65
    },
    {
      _id: 2,
      scheme_name: 'Beti Bachao Beti Padhao',
      category: 'Women',
      state: 'All India',
      income_level: 'All',
      summary: 'Empowering girl child through education and financial security schemes.',
      eligibility_criteria: 'Girl children',
      benefits: 'Educational and financial support',
      application_link: 'https://wcd.nic.in/bbbp-schemes',
      eligibility_score: 55
    },
    {
      _id: 3,
      scheme_name: 'Pradhan Mantri Mudra Yojana',
      category: 'Business',
      state: 'All India',
      income_level: 'All',
      summary: 'Collateral-free business loans up to ₹10 lakh for micro entrepreneurs.',
      eligibility_criteria: 'Entrepreneurs without collateral',
      benefits: 'Business loans',
      application_link: 'https://www.mudra.org.in/',
      eligibility_score: 65
    },
    {
      _id: 4,
      scheme_name: 'National Scholarship Portal',
      category: 'Education',
      state: 'All India',
      income_level: 'Low Income',
      summary: 'Centralized platform offering pre-matric, post-matric, and merit-based scholarships for students from economically weaker sections.',
      eligibility_criteria: 'Students from low-income families',
      benefits: 'Scholarship up to ₹50,000/year',
      application_link: 'https://scholarships.gov.in/',
      eligibility_score: 78
    },
    {
      _id: 5,
      scheme_name: 'Ayushman Bharat – PMJAY',
      category: 'Health',
      state: 'All India',
      income_level: 'Below Poverty Line',
      summary: 'Free health insurance coverage of ₹5 lakh per family per year for secondary and tertiary hospitalisation.',
      eligibility_criteria: 'BPL families identified via SECC data',
      benefits: 'Cashless hospitalisation up to ₹5 lakh',
      application_link: 'https://pmjay.gov.in/',
      eligibility_score: 82
    },
    {
      _id: 6,
      scheme_name: 'Indira Gandhi National Old Age Pension',
      category: 'Senior Citizens',
      state: 'All India',
      income_level: 'Below Poverty Line',
      summary: 'Monthly pension of ₹200–₹500 for senior citizens aged 60+ belonging to BPL families.',
      eligibility_criteria: 'Citizens aged 60+ below poverty line',
      benefits: 'Monthly pension',
      application_link: 'https://nsap.nic.in/',
      eligibility_score: 70
    },
    {
      _id: 7,
      scheme_name: 'PM Kaushal Vikas Yojana (PMKVY)',
      category: 'Youth',
      state: 'All India',
      income_level: 'All',
      summary: 'Industry-relevant skill training and certification for youth to improve employability and earn a livelihood.',
      eligibility_criteria: 'Youth aged 15–45 years',
      benefits: 'Free skill training & certification',
      application_link: 'https://www.pmkvyofficial.org/',
      eligibility_score: 88
    },
    {
      _id: 8,
      scheme_name: 'Pradhan Mantri Awas Yojana (Urban)',
      category: 'Housing',
      state: 'All India',
      income_level: 'Low Income',
      summary: 'Credit-linked subsidy and affordable housing for economically weaker sections and low-income groups in urban areas.',
      eligibility_criteria: 'EWS/LIG/MIG urban households',
      benefits: 'Subsidy up to ₹2.67 lakh on home loans',
      application_link: 'https://pmaymis.gov.in/',
      eligibility_score: 60
    },
    {
      _id: 9,
      scheme_name: 'Jan Dhan Yojana',
      category: 'General',
      state: 'All India',
      income_level: 'All',
      summary: 'Zero-balance bank accounts with RuPay debit card, insurance, and overdraft facility for every unbanked household.',
      eligibility_criteria: 'Any Indian citizen without a bank account',
      benefits: 'Zero-balance account with ₹1 lakh insurance',
      application_link: 'https://pmjdy.gov.in/',
      eligibility_score: 92
    },
    {
      _id: 10,
      scheme_name: 'Maharashtra Majhi Kanya Bhagyashree',
      category: 'Women',
      state: 'Maharashtra',
      income_level: 'Below Poverty Line',
      summary: 'Financial assistance of up to ₹50,000 for families with one or two girl children to promote girl child welfare.',
      eligibility_criteria: 'BPL families in Maharashtra with girl children',
      benefits: '₹50,000 financial assistance',
      application_link: 'https://womenchild.maharashtra.gov.in/',
      eligibility_score: 58
    },
    {
      _id: 11,
      scheme_name: 'Karnataka Raitha Siri',
      category: 'Farmers',
      state: 'Karnataka',
      income_level: 'Low Income',
      summary: 'Crop loan interest subvention and input support for small and marginal farmers in Karnataka.',
      eligibility_criteria: 'Small & marginal farmers in Karnataka',
      benefits: 'Interest-free crop loans up to ₹3 lakh',
      application_link: 'https://raitamitra.karnataka.gov.in/',
      eligibility_score: 72
    },
    {
      _id: 12,
      scheme_name: 'Gujarat Startup & Innovation Policy',
      category: 'Business',
      state: 'Gujarat',
      income_level: 'Middle Income',
      summary: 'Seed funding, mentorship, and infrastructure support for innovative startups registered in Gujarat.',
      eligibility_criteria: 'Startups registered in Gujarat under DPIIT',
      benefits: 'Seed fund up to ₹30 lakh',
      application_link: 'https://startup.gujarat.gov.in/',
      eligibility_score: 63
    },
    {
      _id: 13,
      scheme_name: "Tamil Nadu Chief Minister's Health Insurance",
      category: 'Health',
      state: 'Tamil Nadu',
      income_level: 'Below Poverty Line',
      summary: 'Free medical and surgical treatment up to ₹5 lakh at empanelled hospitals for BPL families in Tamil Nadu.',
      eligibility_criteria: 'BPL families in Tamil Nadu',
      benefits: 'Cashless treatment up to ₹5 lakh',
      application_link: 'https://www.cmchistn.com/',
      eligibility_score: 75
    }
  ]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedIncome, setSelectedIncome] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [isLoading, setIsLoading] = useState(false);

  // Sync profile data to filters automatically
  useEffect(() => {
    const fetchUserFilters = async () => {
      if (user?.email) {
        try {
          const response = await axios.get(`http://localhost:5000/api/users/profile/${user.email}`);
          const profile = response.data;
          if (profile) {
            // Apply State Filter
            if (profile.state) setSelectedState(profile.state);

            // Apply Income Filter mapping
            const incomeMapping = {
              'BPL': 'Below Poverty Line',
              'LIG': 'Low Income',
              'MIG': 'Middle Income',
              'HIG': 'All' // Fallback for HIG
            };
            if (profile.incomeClass && incomeMapping[profile.incomeClass]) {
              setSelectedIncome(incomeMapping[profile.incomeClass]);
            }

            // Sync Language automatically
            const langMapping = {
              'english': 'English',
              'hindi': 'हिंदी',
              'marathi': 'मराठी',
              'tamil': 'தமிழ்',
              'telugu': 'తెలుగు'
            };
            if (profile.language && langMapping[profile.language]) {
              handleLanguageChange(langMapping[profile.language]);
            }
          }
        } catch (error) {
          console.log("No profile found or error fetching profile for filters", error);
        }
      }
    };
    fetchUserFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    filterSchemes();
  }, [schemes, selectedCategory, selectedState, selectedIncome]);

  const filterSchemes = () => {
    let filtered = schemes;

    if (selectedCategory) {
      filtered = filtered.filter(scheme => scheme.category === selectedCategory);
    }

    if (selectedState) {
      filtered = filtered.filter(scheme => scheme.state === selectedState);
    }

    if (selectedIncome) {
      filtered = filtered.filter(scheme => scheme.income_level === selectedIncome);
    }

    setFilteredSchemes(filtered);
  };

  const categories = ['Farmers', 'Women', 'Business', 'Education', 'Health', 'Senior Citizens', 'Youth', 'Housing', 'General'];
  const states = ['All India', 'Punjab', 'Maharashtra', 'Tamil Nadu', 'Gujarat', 'Karnataka', 'Rajasthan', 'Delhi'];
  const incomes = ['All', 'Below Poverty Line', 'Low Income', 'Middle Income'];
  const languages = ['English', 'हिंदी', 'मराठी', 'தமிழ்', 'తెలుగు'];

  const getCategoryColor = (category) => {
    const colors = {
      'Farmers': '#2d5a3d',
      'Women': '#8b3a8b',
      'Business': '#d97706',
      'Education': '#1e5a96',
      'Health': '#10b981',
      'Senior Citizens': '#6366f1',
      'Youth': '#ec4899',
      'Housing': '#f59e0b',
      'General': '#06b6d4'
    };
    return colors[category] || '#003366';
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="app">
          {/* Top Banner */}
          <div className="top-banner">
            🇮🇳 भारत सरकार | Government of India | LOKSEVA — Powered by Firecrawl · Gemini · LangGraph
          </div>

          <div className="app-container">
            {/* Left Sidebar */}
            <aside className="sidebar">
              <div className="sidebar-header">
                <div className="logo">🏛️</div>
                <h1>LOKSEVA</h1>
                <p>Smart Scheme Finder for Every Citizen</p>
              </div>

              {/* Language Section */}
              <div className="sidebar-section">
                <h3>🌐 LANGUAGE</h3>
                <select value={selectedLanguage} onChange={(e) => handleLanguageChange(e.target.value)} className="language-select">
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                {/* Hidden GT widget mount point */}
                <div id="google_translate_element_hidden" style={{ display: 'none' }}></div>
              </div>

              {/* Filters Section */}
              <div className="sidebar-section">
                <h3>🔍 SCHEME FILTERS</h3>

                <div className="filter-group">
                  <label>Category</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
                    <option value="">All categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>State / UT</label>
                  <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="filter-select">
                    <option value="">All States</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Income Level</label>
                  <div className="income-tags">
                    {selectedIncome && (
                      <span className="income-tag">
                        {selectedIncome}
                        <button onClick={() => setSelectedIncome('')}>✕</button>
                      </span>
                    )}
                    {!selectedIncome && (
                      <select value={selectedIncome} onChange={(e) => setSelectedIncome(e.target.value)} className="filter-select">
                        <option value="">All</option>
                        {incomes.map(inc => (
                          <option key={inc} value={inc}>{inc}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Section */}
              <div className="sidebar-section">
                <h3>👤 MY PROFILE</h3>
                {user ? (
                  <>
                    <p className="user-email">{user.email}</p>
                    <button className="profile-btn" onClick={() => navigate("/profile")}>
                      View Profile
                    </button>
                    <button className="logout-btn" onClick={signOut}>
                      Logout
                    </button>
                  </>
                ) : (
                  <button className="login-btn" onClick={signInWithGoogle}>
                    Login with Google
                  </button>
                )}
              </div>

              {/* Data Sync */}
              <div className="sidebar-section">
                <h3>☁️ DATA SYNC</h3>
                <button className="sync-btn">📊 Sync Live Schemes</button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
              {/* Header with Stats */}
              <div className="main-header">
                <div className="header-left">
                  <h1>LOKSEVA</h1>
                  <p>सरकारी योजना खोजें | Government Scheme Finder</p>
                </div>
                <div className="header-stats">
                  <div className="stat-badge">
                    <span className="number">13</span> Schemes
                  </div>
                  <div className="stat-badge">
                    <span className="number">8</span> Languages
                  </div>
                  <div className="stat-badge">
                    <span className="number">🛡️</span> Fraud Guard
                  </div>
                  <div className="stat-badge ai-badge">
                    <span className="number">✨</span> AI Powered
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <section className="hero-section">
                <h2>🏛️ Find Your Government Benefit</h2>
                <p>Discover schemes you're entitled to — in your language, instantly.</p>
                <div className="hero-stats">
                  <div className="stat-pill">
                    <span>13</span> Active Schemes
                  </div>
                  <div className="stat-pill">
                    <span>9</span> Categories
                  </div>
                  <div className="stat-pill">
                    <span>8</span> Languages
                  </div>
                  <div className="stat-pill">
                    <span>AI</span> Fraud Protection
                  </div>
                </div>
              </section>

              {/* Tabs */}
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'browse' ? 'active' : ''} `}
                  onClick={() => setActiveTab('browse')}
                >
                  📋 Browse Schemes
                </button>
                <button
                  className={`tab ${activeTab === 'assistant' ? 'active' : ''} `}
                  onClick={() => setActiveTab('assistant')}
                >
                  🤖 AI Assistant + Voice
                </button>
                <button
                  className={`tab ${activeTab === 'fraud' ? 'active' : ''} `}
                  onClick={() => setActiveTab('fraud')}
                >
                  🗺️ Fraud Heatmap
                </button>
              </div>

              {/* Available Schemes */}
              {activeTab === 'browse' && (
                <div className="schemes-container">
                  <h3>📋 Available Schemes</h3>
                  {isLoading ? (
                    <div className="loading">Loading schemes...</div>
                  ) : filteredSchemes.length > 0 ? (
                    <div className="schemes-grid">
                      {filteredSchemes.map((scheme) => (
                        <div key={scheme._id} className="scheme-card">
                          <div className="card-header" style={{ backgroundColor: getCategoryColor(scheme.category) }}>
                            <div className="card-category">⭐ {scheme.category.toUpperCase()}</div>
                            <h3 className="card-title">{scheme.scheme_name}</h3>
                          </div>
                          <div className="card-body">
                            <p className="card-summary">{scheme.summary}</p>
                            <div className="card-meta">
                              <span className="meta-tag">📍 {scheme.state}</span>
                              <span className="meta-tag">💰 {scheme.income_level}</span>
                            </div>
                            <div className="eligibility-score">
                              <div className="score-label">Your Eligibility Score: <strong>{scheme.eligibility_score}%</strong></div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${scheme.eligibility_score}% ` }}></div>
                              </div>
                            </div>
                            <a href={scheme.application_link} target="_blank" rel="noopener noreferrer" className="btn-apply">
                              Apply Now →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-schemes">No schemes found matching your filters.</div>
                  )}
                </div>
              )}

              {activeTab === 'assistant' && (
                <VapiButton mode="inline" />
              )}

              {activeTab === 'fraud' && (
                <div className="tab-content">
                  <h3>🗺️ Fraud Heatmap</h3>
                  <p>View fraud alerts and scams related to government schemes.</p>
                </div>
              )}
            </main>
          </div>

          {/* Floating voice button — visible on all tabs */}
          <VapiButton mode="float" />
        </div>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;