const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // v6 API: getCLS/getFID/etc. were renamed to onCLS/onFID/etc. in v3, and
    // onFID was removed entirely in v4+ (FID was retired as a Core Web
    // Vital in favor of INP) -- onINP replaces it here.
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
