import { List, Map } from 'immutable'
import SelectedStockSymbol from '../stockPriceRetrieval/selectedStockSymbol'
import Stock from '../state/stock'

export default class TickerAppQuerier {
  constructor (readonly baseUrl: string) {
    this.baseUrl = TickerAppQuerier.sanitiseBaseBaseUrl(baseUrl)
  }

  async loadAllSymbols () {
    const response = await fetch(new URL('static/tickers', this.baseUrl).href)
    const json = await response.json()
    return List(<string[]>json)
  }

  async loadStocks (stocks: List<SelectedStockSymbol>) {
    // There is a limit to the length of a query string, so if a huge number of symbols are passed
    // in here then it might be necessary to chunk them up, make multiple requests and combine the
    // results. In the interests of this demo app, we can probably get away with ignoring that.
    if (stocks.isEmpty()) {
      return Promise.resolve(List<Stock>())
    }

    const priceDeviationAlertLookup = Map(
      stocks.map(stock => [stock.symbol, stock.priceDeviationPercentageForAlert])
    )

    const response = await fetch(
      new URL(
        'prices/' + stocks.map(stock => stock.symbol).map(encodeURIComponent).join(','),
        this.baseUrl).href)

    const json = await response.json()
    return List((<any[]>json)
      .map(stock => {
        const symbol = stock.symbol
        return new Stock(
          symbol,
          stock.bid,
          stock.ask,
          stock.lastVol,
          stock.open,
          priceDeviationAlertLookup.get(symbol) || 0,
          new Date()
        )
      })
    )
  }

  private static sanitiseBaseBaseUrl (baseUrl: string) {
    // The browser "new URL" constructor is fussy with the format of the strings - to correctly
    // combine a base URL with a relative URL, the base URL must have a trailing slash while the
    // relative path must NOT have a leading slash
    baseUrl = baseUrl.replace(/\\/g, '/')
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/'
    }
    return baseUrl
  }
}
