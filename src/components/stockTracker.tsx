/* eslint-disable react/jsx-no-bind */
// ^ This rule is most beneficial for PureComponents that have props with functions in that may be bound,
//   which will prevent shallow equality checks on the built-in shouldComponentUpdate implementation.
//   Since that isn't applicable to this stateful container component, we can disable the rule.

import React, { Component, ReactElement, Fragment } from 'react'
import { List } from 'immutable'
import HeaderMessage from './headerMessage'
import StockAdder from './stockAdder'
import Loading from './loading'
import ErrorMessage from './errorMessage'
import StockList from './stockList'
import StateValueRetriever from './stateValueRetriever'
import PopupForSettingAlert from './popupForSettingAlert'
import RetrievalResponse from '../state/retrievalResponse'
import Stock from '../state/stock'
import StockOrderer from '../stockPriceRetrieval/stockOrderer'
import StockOrderTracker from '../stockPriceRetrieval/stockOrderTracker'
import SelectedStockSymbol from '../stockPriceRetrieval/selectedStockSymbol'

interface Props {
  readonly availableStockSymbols: RetrievalResponse<List<string>>
  readonly stocks: RetrievalResponse<List<Stock>>
  readonly selectedStockSortOrderTracker: StockOrderTracker
  readonly add: (symbol: string) => void
  readonly remove: (symbol: string) => void
  readonly sort: (order: StockOrderer) => void
  readonly updateStockAlert: (stock: SelectedStockSymbol) => void
  readonly reloadSelectedStocks: () => void
  readonly viewAlerts: () => void
}

interface State {
  readonly stocks: RetrievalResponse<List<Stock>>
  readonly availableStockSymbols: RetrievalResponse<List<string>>
  readonly stockToSetAlertFor: SelectedStockSymbol | null
}

export default class StockTracker extends Component<Props, State> {
  render () {
    const symbolToSetAlertFor = StateValueRetriever(this.state, state => state.stockToSetAlertFor)
    return (
      <Fragment>
        <div className='stock-tracker'>
          <header>
            <HeaderMessage title='Stock Viewer' />
            <button onClick={() => this.props.viewAlerts()}>View Alerts</button>
          </header>
          <section className='main'>
            {
              StockTracker.renderRetrievalResponse(
                this.props.stocks,
                stocks =>
                  <Fragment>
                    <StockList
                      stocks={stocks}
                      remove={this.props.remove}
                      sort={this.props.sort}
                      setAlert={stock => this.showAlertPopup(stock)}
                      selectedStockSortOrderTracker={this.props.selectedStockSortOrderTracker} />
                    <button className="reload" onClick={_ => this.props.reloadSelectedStocks()}>Refresh</button>
                  </Fragment>,
                () => <Loading />,
                error => (
                  <Fragment>
                    <ErrorMessage message={`Failed to retrieve selected stocks: ${error.message}`} />
                    <button className="reload" onClick={_ => this.props.reloadSelectedStocks()}>Try to reload</button>
                  </Fragment>
                )
              )
            }
          </section>
          {
            // Don't render the Footer and its StockAdder until the selected stocks
            // data has loaded because trying to add a new stock to an unready list
            // will fail
            StockTracker.renderRetrievalResponse(
              this.props.stocks,
              stocks =>
                <footer>
                  {
                    StockTracker.renderRetrievalResponse(
                      this.props.availableStockSymbols,
                      availableStockSymbols => <StockAdder availableStockSymbols={availableStockSymbols} add={this.props.add} />,
                      null, // Don't show ANOTHER loading symbol - either retrieve the stocks that may be added or show an error
                      error => <ErrorMessage message={`Failed to retrieve available stocks: ${error.message}`} />
                    )
                  }
                </footer>
            )
          }
        </div>
        {
          (symbolToSetAlertFor === null)
            ? null
            : <PopupForSettingAlert
                stockToSetAlertFor={symbolToSetAlertFor}
                ok={priceDeviationPercentageForAlert => this.updateStockAlert(new SelectedStockSymbol(symbolToSetAlertFor.symbol, priceDeviationPercentageForAlert))}
                cancel={this.hideAlertPopup} />
        }
      </Fragment>
    )
  }

  private updateStockAlert (stock: SelectedStockSymbol) {
    this.props.updateStockAlert(stock)
    this.hideAlertPopup()
  }

  private showAlertPopup (stock: SelectedStockSymbol) {
    this.setState({ stockToSetAlertFor: stock })
  }

  private hideAlertPopup () {
    this.setState({ stockToSetAlertFor: null })
  }

  // Would like this to be a generic TypeScript React component, really, but it's
  // SO hard to do! (Rather than duplicate it in a two places)
  private static renderRetrievalResponse<T> (
    value: RetrievalResponse<T>,
    renderer: (value: T) => ReactElement,
    loadingRender: (() => ReactElement) | null = null,
    errorRender: ((e: Error) => ReactElement) | null = null) {
    if (value === null) {
      return (loadingRender === null) ? null : loadingRender()
    } else if (value instanceof Error) {
      return (errorRender === null) ? null : errorRender(value)
    } else {
      return renderer(value)
    }
  }
}
