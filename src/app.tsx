import React from 'react'
import ReactDOM from 'react-dom'
import { List } from 'immutable'
import { stockPriceAppUrlBase, statePersister } from './config'
import { StockSelectionTracker } from './state/stockViewerState'
import TickerAppQuerier from './stockPriceRetrieval/tickerAppQuerier'
import StockOrderTracker from './stockPriceRetrieval/stockOrderTracker'
import SelectedStockSymbol from './stockPriceRetrieval/selectedStockSymbol'
import AppContainer from './components/appContainer'

// Initialise the "stock retrievers" that call the server to get the latest data
const stockQuerier = new TickerAppQuerier(stockPriceAppUrlBase)
const singleStockQuerier = (symbol: string) =>
  stockQuerier
    .loadStocks(List.of(new SelectedStockSymbol(symbol, 0)))
    .then(stocks => {
      const stock = stocks.get(0)
      return (stock !== undefined)
        ? Promise.resolve(stock)
        : Promise.reject(new Error(`Failed to retrieve stock data for symbol ${symbol}`))
    })
const stockSelectionTracker = new StockSelectionTracker(singleStockQuerier)
stockSelectionTracker.registerChangeListener(state => {
  const trackedStocks = state.get('trackedStocks')
  if ((trackedStocks === null) || (trackedStocks instanceof Error)) {
    return
  }
  statePersister.saveStockSymbolSelections(
    trackedStocks.map(stock => new SelectedStockSymbol(stock.symbol, stock.priceDeviationPercentageForAlert))
  )
})

// Clear the document body (which will have a "loading.." message visible while the JS
// loads) and replace it with a container div that we'll render the React app into
document.body.innerHTML = ''
const container = document.createElement('div')
container.className = 'container'
document.body.appendChild(container)

// Prepare the dependencies for the "container component" and render into the div above
const loadPersistedStockSelections = () =>
  stockQuerier.loadStocks(statePersister.loadStockSymbolSelections())
    .then(stocks => stockSelectionTracker.replaceStockSelections(stocks))
    .catch(e => stockSelectionTracker.replaceStockSelections(e))
ReactDOM.render(
  <AppContainer
    stateTracker={stockSelectionTracker}
    selectedStockSortOrderTracker={new StockOrderTracker()}
    reloadSelectedStocks={loadPersistedStockSelections}/>,
  container
)

// .. and load any previous selections from that state persister so that the app starts up
// in the same state as it was last left
loadPersistedStockSelections()

// Load all of the stock symbols that the User may add to their list of selections
stockQuerier.loadAllSymbols()
  .then(symbols => stockSelectionTracker.replaceAvailableOptions(symbols))
  .catch(e => stockSelectionTracker.replaceAvailableOptions(e))
