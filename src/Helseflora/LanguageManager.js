/**A very simple manager for locales, written last-minute.
 * Proof of concept.
 */
export default class LanguageManager {
    constructor() {
        this.translations = {};
    }

    /**Loads the specified language asynchronously. Needs to be called
     * before getTranslation().
     */
    async loadLanguage(lang) {
        try {
            const response = await fetch(`./Locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            this.translations[lang] = await response.json();
        } catch (error) {
            console.error("Could not load language file:", error);
        }
    }

    /**Gets a translation for the specified language.
     * @param {string} lang The language of the translation.
     * @param {string} key The ID of the string (translation) to get.
     * @returns The translation if it was found, otherwise null.
     */
    getTranslation(lang, key) {
        if (!this.translations[lang]) {
            console.warn(`Language '${lang}' not loaded.`);
            return `{{${key}}}`;
        }
        return this.translations[lang][key] || `{{${key}}}`;
    }
}