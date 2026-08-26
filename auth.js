/**
 * JourneyMate Shared Authentication & UI Utility System
 */

(function () {
    const USER_KEY = 'jm_current_user';
    const FAVORITES_KEY = 'jm_favorite_cities';

    // Toast Container Creator
    function getOrCreateToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    // Show Toast Notification
    window.showToast = function (message, type = 'info') {
        const container = getOrCreateToastContainer();
        const toast = document.createElement('div');

        const bgColors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
        };

        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        toast.style.cssText = `
            background: ${bgColors[type] || bgColors.info};
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            font-family: 'Heebo', sans-serif;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 250px;
            max-width: 380px;
            pointer-events: auto;
            transform: translateX(120%);
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

        toast.innerHTML = `<span style="font-size: 16px; font-weight: bold;">${icons[type] || 'ℹ'}</span> <span>${message}</span>`;
        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    };

    // User Session Helpers
    window.getCurrentUser = function () {
        try {
            const userJson = localStorage.getItem(USER_KEY);
            return userJson ? JSON.parse(userJson) : null;
        } catch (e) {
            return null;
        }
    };

    window.setCurrentUser = function (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        window.updateNavbarAuthState();
    };

    window.logoutUser = function () {
        localStorage.removeItem(USER_KEY);
        window.showToast('Logged out successfully', 'info');
        window.updateNavbarAuthState();
        setTimeout(() => {
            if (window.location.pathname.includes('profile.html') || window.location.pathname.includes('Login.html') || window.location.pathname.includes('Signup.html')) {
                window.location.href = 'index.html';
            }
        }, 800);
    };

    // Favorites Helper
    window.getFavoriteCities = function () {
        try {
            const favs = localStorage.getItem(FAVORITES_KEY);
            return favs ? JSON.parse(favs) : [];
        } catch(e) {
            return [];
        }
    };

    window.toggleFavoriteCity = function (cityName) {
        let favs = window.getFavoriteCities();
        const index = favs.indexOf(cityName);
        let added = false;
        if (index > -1) {
            favs.splice(index, 1);
            window.showToast(`Removed ${cityName} from favorites`, 'info');
        } else {
            favs.push(cityName);
            window.showToast(`Added ${cityName} to favorites!`, 'success');
            added = true;
        }
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
        return added;
    };

    // Update Navigation Bar Auth State dynamically on all pages
    window.updateNavbarAuthState = function () {
        const user = window.getCurrentUser();
        const navbar = document.querySelector('.navbar') || document.querySelector('nav');
        const navList = document.querySelector('.navbar-list') || document.querySelector('nav ul');
        
        let authButtons = document.querySelectorAll('.btn-secondary, [href="Login.html"], [href="Signup.html"], [href="./Login.html"], [href="./Signup.html"]');

        if (user) {
            const userAvatarChar = user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
            const userName = user.name || user.email.split('@')[0];

            authButtons.forEach(btn => {
                if (!btn.closest('#nav-user-badge')) {
                    btn.style.display = 'none';
                }
            });

            let userBadge = document.getElementById('nav-user-badge');
            if (!userBadge) {
                userBadge = document.createElement('div');
                userBadge.id = 'nav-user-badge';
                userBadge.className = 'auth-nav-container';
                userBadge.style.cssText = `
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    margin-left: 15px;
                `;
                if (navbar) {
                    navbar.appendChild(userBadge);
                } else if (navList && navList.parentNode) {
                    navList.parentNode.appendChild(userBadge);
                }
            }

            userBadge.style.display = 'inline-flex';
            userBadge.innerHTML = `
                <a href="profile.html" style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.15);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.25);
                    padding: 6px 14px;
                    border-radius: 30px;
                    color: inherit;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: background 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                    <span style="
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #007bff, #00c6ff);
                        color: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 13px;
                    ">${userAvatarChar}</span>
                    <span>Hi, ${userName}</span>
                </a>
                <button onclick="window.logoutUser()" style="
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#ef4444'; this.style.color='#fff';" onmouseout="this.style.background='rgba(239,68,68,0.15)'; this.style.color='#ef4444';">Logout</button>
            `;
        } else {
            let userBadge = document.getElementById('nav-user-badge');
            if (userBadge) userBadge.style.display = 'none';
            authButtons.forEach(btn => btn.style.display = '');
        }
    };

    // Calculate password strength score (0-100)
    window.calculatePasswordStrength = function (password) {
        if (!password) return { score: 0, text: '', color: '#ccc' };
        let score = 0;
        if (password.length >= 6) score += 20;
        if (password.length >= 10) score += 20;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;

        if (score < 40) return { score, text: 'Weak', color: '#ef4444' };
        if (score < 80) return { score, text: 'Medium', color: '#f59e0b' };
        return { score, text: 'Strong', color: '#10b981' };
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.updateNavbarAuthState();
    });
})();
