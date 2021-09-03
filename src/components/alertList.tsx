import React, { Fragment, PureComponent } from 'react'
import { List } from 'immutable'
import Stock from '../state/stock'
import StockOrderTracker from '../stockPriceRetrieval/stockOrderTracker'

interface Props {
  readonly stocks: List<Stock>
  readonly removeAlert: (symbol: string) => void
}

const retrievedDateFormat = new Intl.DateTimeFormat(
  'en-us',
  {
    hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }
)

// JavaScript has a precision limit on its floating point numbers and bad/confusing things can happen
// if "too much" precision is used, so we'll limit all calculations to 16 significant digits - this
// should prevent any issues without introducing any real loss
const limitPrecision = (value: number, precision: number) => parseFloat(value.toPrecision(precision))
const limitToSafePrecision = (value: number) => limitPrecision(value, 16)

export default class AlertList extends PureComponent<Props> {
  render () {
    return <div className="alert-list">{this.renderAlertList()}</div>
  }

  private renderAlertList () {
    if (this.props.stocks.isEmpty()) {
      return <div className="no-stocks">No stocks have been selected, so there is nothing to raise alerts for</div>
    }

    const stocksWithAlerts = this.props.stocks
      .filter(stock => stock.priceDeviationPercentageForAlert !== 0)
      .sort(StockOrderTracker.symbolOrder) // Sort by symbol name for consistency

    if (stocksWithAlerts.isEmpty()) {
      return <div className="no-stocks">While stocks HAVE been selected, none of them have price change alerts configured</div>
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

    if (stocksToAlertFor.isEmpty()) {
      return <div className="no-stocks">None of the selected stocks have changed within the specified margins</div>
    }

    return (
      <ul>
        {
          stocksToAlertFor
            .map(stockAndPriceChange =>
              <li className="alert" key={stockAndPriceChange.stock.symbol}>
                {
                  <Fragment>
                    <h3>{stockAndPriceChange.stock.symbol} @ {retrievedDateFormat.format(stockAndPriceChange.stock.retrieved)}</h3>
                    <div className="details">
                      <span className="symbol">{stockAndPriceChange.stock.symbol + '\'s'}</span>
                      BID price moved {AlertList.renderPriceChange(stockAndPriceChange.increaseAsPercentageOfOpening)}
                      from the opening price at {retrievedDateFormat.format(stockAndPriceChange.stock.retrieved)} today
                    </div>
                    <button onClick={_ => this.props.removeAlert(stockAndPriceChange.stock.symbol)}>Remove alert</button>
                  </Fragment>
                }
              </li>
            )
          }
      </ul>
    )
  }

  private static renderPriceChange (increaseAsPercentageOfOpening: number) {
    const className = 'increase ' + ((increaseAsPercentageOfOpening > 0) ? 'positive' : 'negative')
    return <span className={className}>{increaseAsPercentageOfOpening.toFixed(2)}%</span>
  }
}
