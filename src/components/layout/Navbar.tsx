/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight, UserCheck, LogOut, Bell, BellRing, Info, Sparkles, Shield, Sun, Moon, Globe, Check } from 'lucide-react';
import { getAuthSession, clearAuthSession } from '../../lib/learnerStore';
import { supabase } from '../../lib/supabase/client';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../lib/notificationsStore';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(getAuthSession());

  // Notifications Popover States & Ref
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(event.target as Node)) {
        setNotifsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };

    if (notifsOpen || langDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [notifsOpen, langDropdownOpen]);

  const loadNotifications = async () => {
    const activeSession = getAuthSession();
    if (activeSession.isLoggedIn) {
      let list = await fetchNotifications(activeSession.userId);
      
      // Filter notifications based on RBAC role to show specific notifications per panel
      if (activeSession.role === 'admin') {
        // Admins see everything, including all KYC requests and system alerts
      } else if (activeSession.role === 'approved_mentor' || activeSession.role === 'mentor' || activeSession.role === 'pending_mentor') {
        // Mentors see system messages, announcements, roadmap updates, and ONLY their own KYC updates
        list = list.filter(n => {
          if (n.type === 'kyc') {
            return n.user_id === activeSession.userId;
          }
          return true;
        });
      } else {
        // Learners only see general system alerts, announcements, and roadmap updates. They never see KYC submissions.
        list = list.filter(n => n.type !== 'kyc');
      }

      setNotifications(list);
      setUnreadCount(list.filter(n => !n.is_read).length);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    setSession(getAuthSession());
    loadNotifications();
    
    const handleStorage = () => {
      setSession(getAuthSession());
      loadNotifications();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setSession(getAuthSession());
      loadNotifications();
    });

    const interval = setInterval(loadNotifications, 10000); // Poll notifications every 10s

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
      clearInterval(interval);
      subscription?.unsubscribe();
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    clearAuthSession();
    await supabase.auth.signOut();
    setSession(getAuthSession());
    setNotifications([]);
    setUnreadCount(0);
    navigate('/');
  };

  const navLinks = session.role === 'admin'
    ? [
        { name: t('nav.adminPanel'), path: '/admin-panel' },
        { name: t('nav.roadmaps'), path: '/roadmaps' },
        { name: t('nav.mentors'), path: '/mentors' },
        { name: t('nav.cvGenerator'), path: '/cv-generator' }
      ]
    : [
        { name: t('nav.roadmaps'), path: '/roadmaps' },
        { name: t('nav.mentors'), path: '/mentors' },
        { name: t('nav.cvGenerator'), path: '/cv-generator' },
        ...(session.isLoggedIn
          ? (session.role === 'pending_mentor' || session.role === 'mentor' || session.role === 'approved_mentor'
              ? [{ name: t('nav.mentorPortal'), path: '/apply-mentor' }]
              : [
                  { name: t('nav.myDashboard'), path: '/dashboard' }
                ])
          : [])
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 group-hover:bg-green-500 group-hover:text-zinc-950 transition-all duration-300">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-100 group-hover:text-green-400 transition-colors">
            Career <span className="text-green-500">Ready</span> Path
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return link.path.includes('#') ? (
              <a
                key={link.path}
                href={link.path}
                className="text-sm font-medium text-white hover:text-green-400 transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors pb-1 border-b-2 ${
                  isActive 
                    ? 'text-green-400 border-green-500 font-semibold' 
                    : 'text-white border-transparent hover:text-green-400'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              id="language-selector-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer text-xs font-semibold"
              title="Change Language / ဘာသာစကားပြောင်းရန်"
              aria-label="Language Selector"
            >
              <Globe className="h-3.5 w-3.5 text-green-400" />
              <span>{language === 'my' ? '🇲🇲 မြန်မာ' : '🇬🇧 EN'}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-zinc-800/60">
                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Select Language
                </div>
                <div className="pt-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      language === 'en'
                        ? 'bg-green-500/10 text-green-400 font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🇬🇧</span>
                      <span>English</span>
                    </span>
                    {language === 'en' && <Check className="h-3.5 w-3.5 text-green-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('my');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      language === 'my'
                        ? 'bg-green-500/10 text-green-400 font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🇲🇲</span>
                      <span>မြန်မာ (Burmese)</span>
                    </span>
                    {language === 'my' && <Check className="h-3.5 w-3.5 text-green-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center group"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500 group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          {session.isLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* Notifications Popover Dropdown */}
              <div className="relative" ref={notifsRef}>
                <button
                  type="button"
                  onClick={() => setNotifsOpen(!notifsOpen)}
                  className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                >
                  {unreadCount > 0 ? (
                    <>
                      <BellRing className="h-4 w-4 text-green-400 animate-bounce" />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-zinc-950 font-mono">
                        {unreadCount}
                      </span>
                    </>
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </button>

                {notifsOpen && (
                  <>
                    {/* Transparent Click-Outside Overlay */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent cursor-default" 
                      onClick={() => setNotifsOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden z-50 divide-y divide-zinc-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 bg-zinc-950/40 flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Bell className="h-3.5 w-3.5 text-green-400" />
                          {t('nav.alerts')}
                        </span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={async () => {
                              await markAllAsRead(session.userId);
                              loadNotifications();
                            }}
                            className="text-[10px] font-semibold text-green-400 hover:text-green-300 font-mono cursor-pointer bg-transparent border-none outline-none"
                          >
                            {t('nav.markAllAsRead')}
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/40">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-xs text-zinc-500">
                            {t('nav.noAlerts')}
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={async () => {
                                if (!notif.is_read) {
                                  await markAsRead(notif.id);
                                  loadNotifications();
                                }
                              }}
                              className={`p-3.5 transition-colors cursor-pointer text-left ${
                                notif.is_read ? 'hover:bg-zinc-800/30' : 'bg-green-500/5 hover:bg-green-500/10 border-l-2 border-green-500'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 shrink-0">
                                  {notif.type === 'kyc' && (
                                    <Shield className="h-3.5 w-3.5 text-yellow-500" />
                                  )}
                                  {notif.type === 'mentor_announcement' && (
                                    <Sparkles className="h-3.5 w-3.5 text-green-400" />
                                  )}
                                  {notif.type === 'system' && (
                                    <Info className="h-3.5 w-3.5 text-blue-400" />
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <p className={`text-xs font-semibold leading-tight ${notif.is_read ? 'text-zinc-300' : 'text-white'}`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 leading-normal">
                                    {notif.message}
                                  </p>
                                  <p className="text-[9px] text-zinc-500 font-mono">
                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {session.email && (
                <span className="text-xs font-medium text-zinc-400 font-mono">
                  {session.email}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 capitalize">
                <UserCheck className="h-3.5 w-3.5 text-green-400" />
                {session.role === 'pending_mentor' ? 'Mentor (Pending)' : session.role || 'Learner'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t('nav.logOut')}
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-sm font-semibold text-white hover:text-green-400 px-3 py-2 rounded-md transition-colors"
              >
                {t('nav.logIn')}
              </Link>
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-500 shadow-lg shadow-green-600/20 hover:shadow-green-500/30 transition-all duration-200"
              >
                {t('nav.getStarted')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 md:hidden focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-6 space-y-4 animate-in fade-in slide-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 pt-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return link.path.includes('#') ? (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-zinc-300 hover:text-green-400 px-2 py-1.5 rounded-md transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium px-3 py-1.5 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-green-500/10 text-green-400 font-semibold border-l-2 border-green-500 pl-2' 
                      : 'text-zinc-300 hover:text-green-400'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-3">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-400" />
                <span>{t('nav.language')}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    language === 'en'
                      ? 'bg-green-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('my')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    language === 'my'
                      ? 'bg-green-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  မြန်မာ
                </button>
              </div>
            </div>

            {/* Mobile Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500" />
                )}
                <span>{t('nav.appearance')}</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </button>

            {session.isLoggedIn ? (
              <div className="space-y-3">
                <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 flex flex-col gap-1 capitalize">
                  {session.email && (
                    <span className="text-xs text-zinc-400 font-mono lowercase mb-1">
                      {session.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-green-400" />
                    {t('common.role')}: {session.role === 'pending_mentor' ? 'Mentor (Pending)' : session.role || 'Learner'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.logOut')}
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  {t('nav.logIn')}
                </Link>
                <Link
                  to="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-500 shadow-md shadow-green-600/20 transition-all"
                >
                  {t('nav.getStarted')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
