export const getExchangeRates = async () => {
    const API_KEY = process.env.FASTFOREX_API_KEY;
    const BASE_CURRENCY = process.env.BASE_CURRENCY || 'GTQ';
    
    // Variables globales para el caché en memoria
    if (!global.ratesCache) {
        global.ratesCache = null;
        global.lastFetchTime = 0;
    }

    const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 horas
    const now = Date.now();

    // Si tenemos caché válido, lo retornamos sin llamar a la API
    if (global.ratesCache && (now - global.lastFetchTime < CACHE_DURATION)) {
        return global.ratesCache;
    }

    try {
        const response = await fetch(`https://api.fastforex.io/fetch-all?from=${BASE_CURRENCY}&api_key=${API_KEY}`, {
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Guardamos los resultados en caché
        global.ratesCache = data.results;
        global.lastFetchTime = now;

        return global.ratesCache;
    } catch (error) {
        console.error('Error al conectar con FastForex:', error.message);
        // Si la API falla pero tenemos datos viejos, es mejor devolver eso que quebrar el sistema
        if (global.ratesCache) return global.ratesCache;
        throw new Error('Servicio de divisas no disponible actualmente');
    }
};

export const convertCurrency = async (amount, targetCurrency = 'USD') => {
    if (amount === 0) return 0;
    
    const rates = await getExchangeRates();
    const rate = rates[targetCurrency];

    if (!rate) {
        throw new Error(`No se encontró la tasa de cambio para ${targetCurrency}`);
    }

    // Convertimos y redondeamos a 2 decimales
    return parseFloat((amount * rate).toFixed(2));
};