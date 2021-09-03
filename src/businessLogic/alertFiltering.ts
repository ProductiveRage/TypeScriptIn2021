import { List } from 'immutable'
import Stock from '../state/stock'

// JavaScript has a precision limit on its floating point numbers and bad/confusing things can happen
// if "too much" precision is used, so we'll limit all calculations to 16 significant digits - this
// should prevent any issues without introducing any real loss
const limitPrecision = (value: number, precision: number) => parseFloat(value.toPrecision(precision))
const limitToSafePrecision = (value: number) => limitPrecision(value, 16)

export default function getStocksToAlertAbout (stocks: List<Stock>) {
  if (stocks.isEmpty()) {
    return 'No stocks have been selected, so there is nothing to raise alerts for'
  }

  const stocksWithAlerts = stocks
    .filter(stock => stock.priceDeviationPercentageForAlert !== 0)

  if (stocksWithAlerts.isEmpty()) {
    return 'While stocks HAVE been selected, none of them have price change alerts configured'
  }

  const stocksToAlertFor = stocksWithAlerts
    .map(stock => {
      const increase = limitToSafePrecision(limitToSafePrecision(stock.bid) - limitToSafePrecision(stock.open))
      const increaseAsPercentageOfOpening = (increase / limitToSafePrecision(stock.open)) * 100
      return { stock, increaseAsPercentageOfOpening }
    })
    .filter(stockAndPriceChange => {
      const stockPriceDeviationPercentageForAlert = limitToSafePrecision(stockAndPriceChange.stock.priceDeviationPercentageForAlert)
      const thresholdPercentageForAlert = limitToSafePrecision(stockPriceDeviationPercentageForAlert)
      if (stockPriceDeviationPercentageForAlert > 0) {
        return stockAndPriceChange.increaseAsPercentageOfOpening >= thresholdPercentageForAlert
      } else if (stockPriceDeviationPercentageForAlert < 0) {
        return stockAndPriceChange.increaseAsPercentageOfOpening <= thresholdPercentageForAlert
      } else {
        // Zero stock.priceDeviationPercentageForAlert indicates no alerts desired
        return false
      }
    })

  return stocksToAlertFor.isEmpty()
    ? 'None of the selected stocks have changed within the specified margins'
    : stocksToAlertFor
}
