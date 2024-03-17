const API_KEY = 
    "262338a768fb143a0fb2e9001cbf6d7635f29ac7782815d687f3b5cc60358935";

const tickersHandlers = new Map();

//TODO: refactor to use URLSearchParams
const loadtickersHandlers = () => {
    if (tickersHandlers.size === 0) {
        return;
    }

    fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
            ...tickersHandlers.keys()
        ].join(",")}&tsyms=USD&api_key=${API_KEY}`
    )
        .then(r => r.json())
        .then(rawData => {
            const updatedPrices = Object.fromEntries(
                Object.entries(rawData).map(([key, value]) => [key, value.USD])
            );
            
            Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
                const handlers = tickersHandlers.get(currency) ?? [];
                handlers.forEach(fn => fn(newPrice));
            })
        });
};

export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(
        ticker,
        subscribers.filter(fn => fn != cb)
    );
};

setInterval(loadtickersHandlers, 5000);
window.tickersHandlers = tickersHandlers; // для проверки переменной в консоли