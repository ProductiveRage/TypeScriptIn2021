export default class Stock {
  constructor (
    readonly symbol: string,
    readonly bid: number,
    readonly ask: number,
    readonly lastVol: number,
    readonly open: number,
    readonly priceDeviationPercentageForAlert: number,
    readonly retrieved: Date) {
    this.symbol = symbol
    this.bid = bid
    this.ask = ask
    this.lastVol = lastVol
    this.open = open
    this.priceDeviationPercentageForAlert = priceDeviationPercentageForAlert
    this.retrieved = retrieved
  }

  withPriceDeviationPercentageForAlert (priceDeviationPercentageForAlert: number) {
    return (this.priceDeviationPercentageForAlert !== priceDeviationPercentageForAlert)
      ? new Stock(this.symbol, this.bid, this.ask, this.lastVol, this.open, priceDeviationPercentageForAlert, this.retrieved)
      : this
  }
}
