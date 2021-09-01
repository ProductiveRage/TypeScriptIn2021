import Stock from '../state/stock'
import StockOrderer from './StockOrderer'

export default class StockOrderTracker {
  private currentOrder: StockOrderer | null
  private ascending: boolean
  constructor (preferredOrder: StockOrderer | null = null) {
    this.currentOrder = preferredOrder
    this.ascending = true
  }

  // If the same order delegate is specified multiple times (and the optional
  // 'ascending' parameter is not given a value) then the ordering will be
  // flipped each call (eg. making it easy to sort symbol A-Z, then Z-A)
  getSorter (order: StockOrderer, ascending: boolean | null = null) {
    if (ascending === null) {
      if (this.currentOrder === order) {
        this.ascending = !this.ascending
      } else {
        this.currentOrder = order
        this.ascending = true
      }
    } else {
      this.currentOrder = order
      this.ascending = ascending
    }
    return this.ascending
      ? this.currentOrder
      : StockOrderTracker.reverseOrder(this.currentOrder)
  }

  static symbolOrder = (x: Stock, y: Stock) =>
    x.symbol.toLocaleLowerCase().localeCompare(y.symbol.toLocaleLowerCase())

  static bidOrder = StockOrderTracker.getNumericOrdering(stock => stock.bid)

  static askOrder = StockOrderTracker.getNumericOrdering(stock => stock.ask)

  static lastVolOrder = StockOrderTracker.getNumericOrdering(stock => stock.lastVol)

  static openOrder = StockOrderTracker.getNumericOrdering(stock => stock.open)

  static hasAlertOrder = StockOrderTracker.getNumericOrdering(
    stock => (stock.priceDeviationPercentageForAlert === 0) ? 1 : -1
  )

  private static reverseOrder = (order: StockOrderer) => (x: Stock, y: Stock) => order(y, x)

  private static getNumericOrdering (property: (stock: Stock) => number): StockOrderer {
    return (x, y) => {
      const valueX = property(x)
      const valueY = property(y)
      return (valueX > valueY) ? 1 : ((valueX < valueY) ? -1 : 0)
    }
  }
}
