/** Read the same resolved CSS token values used by the application. */
export const designToken = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
