const API_KEY = "65ad22f82d5aed54178d88581783200e48d16eb5b1ad784fc00c298b45352e72"

const tickersHandlers = new Map()

const loadTickers = () => {
   if (tickersHandlers.size === 0) {
      return;
   }
   console.log('Load data....');
   
   fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
         ...tickersHandlers.keys(),
      ]}&tsyms=USD&api_key=${API_KEY}`
   )
      .then((r) => r.json())
      .then((rawData) => {
         const updatedPrices = Object.fromEntries(
            Object.entries(rawData).map(([key, value]) => [key, value.USD])
         )
      Object.entries(updatedPrices).forEach(([currency, newPrice]) =>{
         const handlers = tickersHandlers.get(currency) ?? []
         handlers.forEach(fn=>fn(newPrice))
      })
      })
}

export const subscribeToTicker = (ticker, cb) => {
   const subscribers = tickersHandlers.get(ticker) || []
   tickersHandlers.set(ticker, [...subscribers, cb])
}
export const unSubscribeFromTicker = ticker => {
   tickersHandlers.delete(ticker)
}

setInterval(loadTickers, 5000)

window.tickers = tickersHandlers
