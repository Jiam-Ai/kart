import React, { useContext } from 'react';
import { AppContext } from '../App';
import type { Language, View } from '../types';

interface HeaderProps {
    onSearch: (term: string) => void;
    onCartClick: () => void;
    currentView: View;
    onMenuClick: () => void;
}

const ThemeToggle: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { theme, toggleTheme } = context;

    return (
        <button
            onClick={toggleTheme}
            className="text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
        </button>
    );
};

export const LanguageSwitcher: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { language, setLanguage, translations } = context;

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div className="relative">
            <select 
                value={language}
                onChange={handleLangChange}
                className="bg-primary dark:bg-gray-700 text-white pl-3 pr-8 py-2 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
            >
                <option value="en">{translations.english}</option>
                <option value="krio">{translations.krio}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ onSearch, onCartClick, currentView, onMenuClick }) => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { cart, translations, currentSeller, currentBuyer, logout, handleNavigation } = context;
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const isShopView = currentView === 'shop';
    
    return (
        <header className="bg-primary dark:bg-gray-800 shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onMenuClick} className="lg:hidden text-accent dark:text-gray-200" aria-label="Open menu">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                    <h1 onClick={() => handleNavigation('shop')} 
                        className="text-3xl font-bold text-accent dark:text-white cursor-pointer"
                    >
                        Salone<span className="text-secondary">Kart</span>
                    </h1>
                </div>

                {isShopView && (
                    <div className="flex-1 max-w-xl mx-4 hidden lg:flex items-center bg-white dark:bg-gray-700 rounded-full px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder={translations.search_placeholder}
                            className="w-full bg-transparent p-2 text-gray-700 dark:text-gray-200 focus:outline-none"
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>
                )}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="hidden lg:flex items-center space-x-2 sm:space-x-4">
                        {currentSeller ? (
                             <div className="flex items-center space-x-2 sm:space-x-4">
                                <button
                                    onClick={() => handleNavigation('seller')}
                                    className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                                        currentView === 'seller' 
                                        ? 'bg-secondary text-white' 
                                        : 'text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700'
                                    }`}
                                    aria-current={currentView === 'seller' ? 'page' : undefined}
                                >
                                    {translations.seller_dashboard}
                                </button>
                                <button
                                    onClick={logout}
                                    className="text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                >
                                    {translations.logout}
                                </button>
                            </div>
                        ) : currentBuyer ? (
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <button
                                    onClick={() => handleNavigation('buyer-dashboard')}
                                    className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                                        currentView === 'buyer-dashboard' 
                                        ? 'bg-secondary text-white' 
                                        : 'text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700'
                                    }`}
                                    aria-current={currentView === 'buyer-dashboard' ? 'page' : undefined}
                                >
                                    {translations.my_account}
                                </button>
                                <button
                                    onClick={logout}
                                    className="text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                >
                                    {translations.logout}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleNavigation('auth')}
                                className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                                    currentView === 'auth' 
                                    ? 'bg-secondary text-white' 
                                    : 'text-accent dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700'
                                }`}
                            >
                                {translations.login_signup}
                            </button>
                        )}
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                    <button onClick={onCartClick} className="relative text-accent dark:text-gray-200 hover:text-secondary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            {isShopView && (
                 <div className="lg:hidden container mx-auto px-4 pb-4">
                    <div className="w-full flex items-center bg-white dark:bg-gray-700 rounded-full px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder={translations.search_placeholder}
                            className="w-full bg-transparent p-2 text-gray-700 dark:text-gray-200 focus:outline-none"
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </header>
    );
};