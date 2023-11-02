const API_KEY = "65ad22f82d5aed54178d88581783200e48d16eb5b1ad784fc00c298b45352e72"
const tickersHandlers = new Map()
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
const AGGREGATE_INDEX = '5'

socket.addEventListener("message", (e) => {
   const {TYPE: type, FROMSYMBOL: currencyTicker, PRICE: newPrice} = JSON.parse(e.data)
   if (type !== AGGREGATE_INDEX || newPrice === undefined ) {
      return
   }
   const handlers = tickersHandlers.get(currencyTicker) ?? []
   handlers.forEach((fn) => fn(newPrice))
})

function sendToWebSocket(message) {
   const stringifiedMessage = JSON.stringify(message)

   if (socket.readyState === WebSocket.OPEN) {
      socket.send(stringifiedMessage)
      return
   }
   socket.addEventListener(
      "open",
      () => {
         socket.send(stringifiedMessage)
      },
      {once: true}
   )
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
      action: "SubAdd",
      subs: [`5~CCCAGG~${ticker}~USD`],
   })
}
function unsubscribeToTickerOnWs(ticker) {
  sendToWebSocket({
      action: "SubRemove",
      subs: [`5~CCCAGG~${ticker}~USD`],
   })
}


export const subscribeToTicker = (ticker, cb) => {
   const subscribers = tickersHandlers.get(ticker) || []
   tickersHandlers.set(ticker, [...subscribers, cb])
   subscribeToTickerOnWs(ticker)
}
export const unSubscribeFromTicker = (ticker) => {
   tickersHandlers.delete(ticker)
   unsubscribeToTickerOnWs(ticker)
}
