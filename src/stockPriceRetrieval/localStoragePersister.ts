import { List } from 'immutable'
import SelectedStockSymbol from './selectedStockSymbol'

const storageKey = 'TickerAppLocalStorage'

// In a real app, we'd be persisting the selections to a database on a server somewhere
// but for this demo, we'll just use localStorages so that selections are maintained
// between executions and it mimics a remote store
export default class LocalStoragePersister {
  loadStockSymbolSelections () {
    const rawData = localStorage.getItem(storageKey)
    if (rawData === null) {
      return List<SelectedStockSymbol>()
    }

    let parsedData
    try {
      parsedData = JSON.parse(rawData)
    } catch {
      parsedData = null
    }
    if (!(parsedData instanceof Array)) {
      return List<SelectedStockSymbol>()
    }

    let listData = List<SelectedStockSymbol>()
    parsedData
      .filter(value => value)
      .map(value => {
        if (typeof value.symbol === 'string') {
          const priceDeviationPercentageForAlert = parseFloat('' + value.priceDeviationPercentageForAlert)
          return new SelectedStockSymbol(
            (<string>value.symbol).trim(),
            isFinite(priceDeviationPercentageForAlert) ? priceDeviationPercentageForAlert : 0
          )
        } else {
          return new SelectedStockSymbol('', 0)
        }
      })
      .filter(entry => entry.symbol !== '')
      .forEach(value => {
        // Exclue any duplicates that may have snuck into the localStorage as
        // bad data - it's presumed that the symbols will be distinct
        if (!listData.contains(value)) {
          listData = listData.insert(0, value)
        }
      })

    return listData.reverse()
  }

  saveStockSymbolSelections (selections: List<SelectedStockSymbol>) {
    localStorage.setItem(storageKey, JSON.stringify(selections))
  }
}
