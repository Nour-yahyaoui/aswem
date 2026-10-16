/**
 * Runs before the first paint so the page never flashes the wrong theme.
 * Uses the saved choice ("light" or "dark"), otherwise follows the system setting.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("theme");var dark=s==="dark"||((!s||s==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`;

export const THEME_STORAGE_KEY = "theme";
