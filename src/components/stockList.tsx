import React, { FunctionComponent, PureComponent } from 'react'
import { List } from 'immutable'
import Stock from '../state/stock'
import StockOrderer from '../stockPriceRetrieval/stockOrderer'
import StockOrderTracker from '../stockPriceRetrieval/stockOrderTracker'
import SelectedStockSymbol from '../stockPriceRetrieval/selectedStockSymbol'

interface Props {
  readonly stocks: List<Stock>
  readonly selectedStockSortOrderTracker: StockOrderTracker
  readonly remove: (symbol: string) => void
  readonly sort: (order: StockOrderer) => void
  readonly setAlert: (stock: SelectedStockSymbol) => void
}

const SortOptionHeader: FunctionComponent<{readonly sort: () => void, readonly message: string}> = props =>
  <th><a className="sortable" onClick={_ => props.sort()}>{props.message}</a></th>

const retrievedDateFormat = new Intl.DateTimeFormat(
  'en-us',
  {
    day: 'numeric', month: 'short', year: 'numeric', hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }
)

const toSelectedStockSymbol = (stock: Stock): SelectedStockSymbol => {
  return { symbol: stock.symbol, priceDeviationPercentageForAlert: stock.priceDeviationPercentageForAlert }
}

export default class StockList extends PureComponent<Props> {
  render () {
    return (
      <table className='stock-list'>
        <thead>
          <tr>
            <SortOptionHeader sort={() => this.applySort(StockOrderTracker.symbolOrder)} message='Symbol' />
            <SortOptionHeader sort={() => this.applySort(StockOrderTracker.bidOrder)} message='Bid' />
            <SortOptionHeader sort={() => this.applySort(StockOrderTracker.askOrder)} message='Ask' />
            <SortOptionHeader sort={() => this.applySort(StockOrderTracker.lastVolOrder)} message='Vol' />
            <SortOptionHeader sort={() => this.applySort(StockOrderTracker.openOrder)} message='Opened At' />
            <SortOptionHeader sort={() => this.applySort(StockOrderTracker.hasAlertOrder)} message='Alerts' />
            <th>Retrieved</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {
            this.props.stocks.isEmpty()
              ? <tr className="none-selected"><td colSpan={8}>None selected</td></tr>
              : this.props.stocks.map((stock, index) =>
                <tr key={stock.symbol} className={index % 2 === 0 ? 'even' : 'odd'}>
                  <td>{stock.symbol}</td>
                  <td>{stock.bid.toFixed(2)}</td>
                  <td>{stock.ask.toFixed(2)}</td>
                  <td>{stock.lastVol}</td>
                  <td>{stock.open.toFixed(2)}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={stock.priceDeviationPercentageForAlert !== 0}
                      disabled={true} />
                  </td>
                  <td>{retrievedDateFormat.format(stock.retrieved)}</td>
                  <td>
                    <a className='alerts' onClick={_ => this.props.setAlert(toSelectedStockSymbol(stock))}>Set Alert</a>
                    <button title="Remove" onClick={_ => this.props.remove(stock.symbol)}>X</button>
                  </td>
                </tr>
              )
          }
        </tbody>
      </table>
    )
  }

  private applySort (order: StockOrderer) {
    // Using the StockOrderTracker's getSorter method let's the StockOrderTracker
    // keep track of what ordering was last requested and flip it if it the same
    // order is requested twice (eg. if sort by 'Symbol' twice then each click
    // will resort in ascending and then descending - or v.v - ordering)
    this.props.sort(this.props.selectedStockSortOrderTracker.getSorter(order))
  }
}
