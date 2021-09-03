import React, { Fragment, PureComponent } from 'react'
import { List } from 'immutable'
import Stock from '../state/stock'
import StockOrderTracker from '../stockPriceRetrieval/stockOrderTracker'
import getStocksToAlertAbout from '../businessLogic/alertFiltering'

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

export default class AlertList extends PureComponent<Props> {
  render () {
    return <div className="alert-list">{this.renderAlertList()}</div>
  }

  private renderAlertList () {
    const stocksToAlertFor = getStocksToAlertAbout(
      this.props.stocks.sort(StockOrderTracker.symbolOrder) // Sort by symbol name for consistency
    )
    if (typeof stocksToAlertFor === 'string') {
      return <div className="no-stocks">{stocksToAlertFor}</div>
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
