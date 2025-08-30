// Utility file for managing asset imports to avoid circular dependencies

// Door style image fallbacks
export const doorImages = {
  panelShaker: "https://via.placeholder.com/100x100?text=Panel+Shaker",
  panelEclipse: "https://via.placeholder.com/100x100?text=Panel+Eclipse",
  estoril: "https://via.placeholder.com/100x100?text=Estoril",
  santana: "https://via.placeholder.com/100x100?text=Santana"
};

// Handle style image fallbacks
export const handleImages = {
  none: "https://img.icons8.com/ios/50/000000/cancel--v1.png",
  straight: "https://img.icons8.com/ios/50/000000/vertical-line.png",
  fancy: "https://img.icons8.com/ios/50/000000/ellipsis-vertical.png",
  spherical: "https://img.icons8.com/ios/50/000000/sphere.png"
};

// Define a safer require function that doesn't throw
const safeRequire = (path: string) => {
  try {
    // Use a dynamic import which will be resolved at runtime
    return require(path);
  } catch (e) {
    console.log(`Image not found: ${path}, using fallback`);
    return null;
  }
};

// Initialize assets outside of try/catch blocks to avoid initialization issues
// Door images
const panelShakerImg = safeRequire('../assets/door-styles/panel-shaker.jpg');
if (panelShakerImg) doorImages.panelShaker = panelShakerImg;

const panelEclipseImg = safeRequire('../assets/door-styles/panel-eclipse.jpg');
if (panelEclipseImg) doorImages.panelEclipse = panelEclipseImg;

const estorilImg = safeRequire('../assets/door-styles/estoril.jpg');
if (estorilImg) doorImages.estoril = estorilImg;

const santanaImg = safeRequire('../assets/door-styles/santana.jpg');
if (santanaImg) doorImages.santana = santanaImg;

// Handle images
const noneHandleImg = safeRequire('../assets/handles/none.svg');
if (noneHandleImg) handleImages.none = noneHandleImg;

const straightHandleImg = safeRequire('../assets/handles/straight.svg');
if (straightHandleImg) handleImages.straight = straightHandleImg;

const fancyHandleImg = safeRequire('../assets/handles/fancy.svg');
if (fancyHandleImg) handleImages.fancy = fancyHandleImg;

const sphericalHandleImg = safeRequire('../assets/handles/spherical.svg');
if (sphericalHandleImg) handleImages.spherical = sphericalHandleImg; 