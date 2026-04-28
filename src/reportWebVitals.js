/*
 reportWebVitals
 - Helper opcional para medir métricas de rendimiento (LCP, FID, CLS, etc.).
 - Por defecto se exporta una función que permite enviar los resultados a la consola o a un endpoint de analítica.
 - No es obligatorio para la funcionalidad de la app; útil para optimización y monitoreo.
*/

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
