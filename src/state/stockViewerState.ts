import { List, Record } from 'immutable'
import Stock from '../state/stock'
import RetrievalResponse from './retrievalResponse'
import StockOrderer from '../stockPriceRetrieval/stockOrderer'
import SelectedStockSymbol from '../stockPriceRetrieval/selectedStockSymbol'

// There are benefits to having the state wrapped up in a single class instance; it
// makes unit testing easier and allows dependencies such as the "singleStockLoader"
// to be passed in - but it has a downside if the instance methods are used as
// delegate properties on component props classes as the "this" reference will be
// bound to the component instead of this class and things will go wrong at runtime.
// One way to work around this is to bind the methods on this class to the instance
// of this class, so that they can be safely used as component props. This method
// looks at the (non-construtor) functions on an object and binds them to the owner
// (it's not fully generic code as it might need changing if the target type was
// derived from another type and potentially another, etc..)
const bindFunctionsToSelfForUseWithReactCallbacks = (target: any) => {
  const prototype = Object.getPrototypeOf(target)
  Object.getOwnPropertyNames(prototype)
    .filter(name => {
      const property = prototype[name]
      return (property !== prototype.constructor) && (property instanceof Function)
    })
    .forEach(name => { target[name] = target[name].bind(target) })
}

export class State extends Record({
  trackedStocks: <RetrievalResponse<List<Stock>>>null,
  availableStockSymbols: <RetrievalResponse<List<string>>>null,
  stockToSetAlertFor: <SelectedStockSymbol | null>null
}) {}

export type changeListener = (state: State) => void

export class StockSelectionTracker {
  private state: State
  private changeListeners: List<changeListener>
  constructor (readonly singleStockLoader: (symbol: string) => Promise<Stock>) {
    this.state = new State()
    this.changeListeners = List.of<changeListener>()
    this.singleStockLoader = singleStockLoader
    bindFunctionsToSelfForUseWithReactCallbacks(this)
  }

  replaceStockSelections (newTrackedStocks: RetrievalResponse<List<Stock>>) {
    this.state = this.state.set('trackedStocks', newTrackedStocks)
    this.raiseChange()
  }

  replaceAvailableOptions (newAvailableStockSymbols: RetrievalResponse<List<string>>) {
    this.state = this.state.set('availableStockSymbols', newAvailableStockSymbols)
    this.raiseChange()
  }

  async addStockSelection (symbol: string) {
    // If the stocks data hasn't loaded yet (or if an error occurred during retrieval),
    // then don't try to do anything here - just return false
    let loadedStocks = this.getTrackedStocksIfLoaded()
    if (!loadedStocks) {
      return Promise.resolve(false)
    }

    // Since we just performed an async lookup, double-check that that stocks data
    // is still fully loaded (not that a reload was attempted and failed, for example)
    // Just in case it already exists remove it; we want them to be unique
    const stock = await this.singleStockLoader(symbol)
    loadedStocks = this.getTrackedStocksIfLoaded()
    if (!loadedStocks) {
      return Promise.resolve(false)
    }

    // Ensure that the stock doesn't get "double added" (all stock entries are expected
    // to have unique symbols) - if so, remove the old entry and replace with the new
    // one since we just retrieved the data for it (if there was a value for the
    // priceDeviationPercentageForAlert on it then maintain that but nothing else)
    const priceDeviationPercentageForAlert = loadedStocks
      .filter(stock => stock.symbol === symbol)
      .first()
      ?.priceDeviationPercentageForAlert || 0

    this.state = this.state.set(
      'trackedStocks',
      loadedStocks
        .filter(stock => stock.symbol !== symbol)
        .push(stock.withPriceDeviationPercentageForAlert(priceDeviationPercentageForAlert))
    )
    this.raiseChange()
    return true
  }

  removeStockSelection (symbol: string) {
    // If the stocks data hasn't loaded yet (or if an error occurred during retrieval),
    // then don't try to do anything here - just return false
    const loadedStocks = this.getTrackedStocksIfLoaded()
    if (!loadedStocks) {
      return false
    }

    const indexOfExistingEntry = loadedStocks.findIndex(stock => stock.symbol === symbol)
    if (indexOfExistingEntry !== -1) {
      this.state = this.state.set('trackedStocks', loadedStocks.remove(indexOfExistingEntry))
      this.raiseChange()
      return true
    }
    return false
  }

  sortStockSelection (order: StockOrderer) {
    // If the stocks data hasn't loaded yet (or if an error occurred during retrieval),
    // then don't try to do anything here (we could persist the specified StockOrderer
    // and then apply it when data DOES get loaded but for the sake of a sample app
    // that feels like overkill - plus, maybe the data is in the process of being
    // loaded in a particular order and any sorting request at this point should
    // be completely ignored)
    const loadedStocks = this.getTrackedStocksIfLoaded()
    if (!loadedStocks) {
      return false
    }

    this.state = this.state.set(
      'trackedStocks',
      loadedStocks.sort(order)
    )
    this.raiseChange()
    return true
  }

  registerChangeListener (listenerToAdd: changeListener) {
    this.changeListeners = this.changeListeners.push(listenerToAdd)
  }

  unregisterChangeListener (listenerToRemove: changeListener) {
    this.changeListeners = this.changeListeners
      .filter(listener => listener !== listenerToRemove)
  }

  // This is only used by automated tests that exercise the unusual-looking logic in
  // the bindFunctionsToSelfForUseWithReactCallbacks method that is required to pass
  // the un/registerChangeListener methods as React component props
  areThereAnyRegisteredChangeListeners () {
    return !this.changeListeners.isEmpty()
  }

  private getTrackedStocksIfLoaded = () =>
    (this.state.trackedStocks === null) || (this.state.trackedStocks instanceof Error)
      ? null
      : this.state.trackedStocks

  private raiseChange = () =>
    this.changeListeners.forEach(listener => listener(this.state))
}
