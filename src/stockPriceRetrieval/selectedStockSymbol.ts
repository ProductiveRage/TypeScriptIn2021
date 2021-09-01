export default class SelectedStockSymbol {
  constructor (readonly symbol: string, readonly priceDeviationPercentageForAlert: number) {
    this.symbol = symbol
    this.priceDeviationPercentageForAlert = priceDeviationPercentageForAlert
  }
}
