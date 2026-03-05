// Storage management for user preferences and data

class ToolNestStorage {
    constructor() {
        this.keys = {
            FAVORITES: 'toolnest_favorites',
            RECENT: 'toolnest_recent',
            SETTINGS: 'toolnest_settings',
            HISTORY: 'toolnest_history',
            USAGE: 'toolnest_usage',
            CUSTOM: 'toolnest_custom'
        };
    }

    // Favorites management
    getFavorites() {
        return this._get(this.keys.FAVORITES, []);
    }

    addFavorite(toolId) {
        const favorites = this.getFavorites();
        if (!favorites.includes(toolId)) {
            favorites.push(toolId);
            this._set(this.keys.FAVORITES, favorites);
        }
        return favorites;
    }

    removeFavorite(toolId) {
        const favorites = this.getFavorites().filter(id => id !== toolId);
        this._set(this.keys.FAVORITES, favorites);
        return favorites;
    }

    toggleFavorite(toolId) {
        const favorites = this.getFavorites();
        const isFavorite = favorites.includes(toolId);
        
        if (isFavorite) {
            return this.removeFavorite(toolId);
        } else {
            return this.addFavorite(toolId);
        }
    }

    isFavorite(toolId) {
        return this.getFavorites().includes(toolId);
    }

    // Recent tools management
    getRecentTools(limit = 10) {
        return this._get(this.keys.RECENT, []).slice(0, limit);
    }

    addToRecent(toolId) {
        let recent = this.getRecentTools();
        recent = [toolId, ...recent.filter(id => id !== toolId)];
        recent = recent.slice(0, 20); // Keep last 20
        this._set(this.keys.RECENT, recent);
        return recent;
    }

    clearRecent() {
        this._set(this.keys.RECENT, []);
    }

    // Settings management
    getSettings() {
        return this._get(this.keys.SETTINGS, {
            darkMode: false,
            notifications: true,
            defaultCategory: 'all'
        });
    }

    updateSettings(settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        this._set(this.keys.SETTINGS, updated);
        return updated;
    }

    // Tool history (usage tracking)
    addToHistory(toolId) {
        const history = this._get(this.keys.HISTORY, []);
        const entry = {
            toolId,
            timestamp: new Date().toISOString()
        };
        history.unshift(entry);
        this._set(this.keys.HISTORY, history.slice(0, 50)); // Keep last 50
    }

    getHistory() {
        return this._get(this.keys.HISTORY, []);
    }

    
    // Usage counts (for Popular Tools)
    incrementUsage(toolId) {
        const usage = this._get(this.keys.USAGE, {});
        usage[toolId] = (usage[toolId] || 0) + 1;
        this._set(this.keys.USAGE, usage);
        return usage;
    }

    getUsageCounts() {
        return this._get(this.keys.USAGE, {});
    }

    // Generic custom store (for features like saved semesters)
    getCustom(key, defaultValue = null) {
        const all = this._get(this.keys.CUSTOM, {});
        return (key in all) ? all[key] : defaultValue;
    }

    setCustom(key, value) {
        const all = this._get(this.keys.CUSTOM, {});
        all[key] = value;
        this._set(this.keys.CUSTOM, all);
        return value;
    }

    // Private methods
    _get(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    }

    _set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error writing to localStorage:', e);
        }
    }

    // Clear all data
    clearAll() {
        Object.values(this.keys).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}

// Create global instance
const storage = new ToolNestStorage();

// Export for use in other files
window.ToolNestStorage = storage;

// Compatibility alias (used by some pages)
window.storage = storage;
