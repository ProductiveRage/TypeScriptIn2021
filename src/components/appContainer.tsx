import React, { Component, Fragment } from 'react'
import { List } from 'immutable'
import { StockSelectionTracker, State as StockViewerState, changeListener } from '../state/stockViewerState'
import RetrievalResponse from '../state/retrievalResponse'
import Stock from '../state/stock'
import StockOrderTracker from '../stockPriceRetrieval/stockOrderTracker'
import SelectedStockSymbol from '../stockPriceRetrieval/selectedStockSymbol'
import StockTracker from './stockTracker'
import StateValueRetriever from './stateValueRetriever'
import AlertTracker from './alertTracker'

interface Props {
  readonly stateTracker: StockSelectionTracker
  readonly selectedStockSortOrderTracker: StockOrderTracker
  readonly reloadSelectedStocks: () => void
}

interface State {
  readonly stocks: RetrievalResponse<List<Stock>>
  readonly availableStockSymbols: RetrievalResponse<List<string>>
  readonly showingAlerts: boolean
}

// This is the only stateful container component that pushes state changes down the tree,
// all other components are Pure/Functional components for simple presentation only
export default class AppContainer extends Component<Props, State> {
  // This is a trackedStockChangedListener that is bound to this instance so that we can
  // successfully unregister it in componentWillUnmount (using an anonymous function would
  // result in a new function reference being created and the original one would not be
  // removed from the callback registration list)
  readonly onChangeBound: changeListener
  constructor (props: Props) {
    super(props)
    this.onChangeBound = this.onChange.bind(this) // bind so can onChange can access this.state
    props.stateTracker.registerChangeListener(this.onChangeBound)
  }

  render () {
    return (
      <Fragment>
        {
          StateValueRetriever(this.state, state => state.showingAlerts)
            ? <AlertTracker
                stocks={StateValueRetriever(this.state, state => state.stocks)}
                removeAlert={symbol => this.updateStockAlert(new SelectedStockSymbol(symbol, 0))}
                reloadSelectedStocks={() => this.tryToReloadSelectedStocks()}
                viewSelectedStocks={() => this.setState({ showingAlerts: false })} />
            : <StockTracker
                stocks={StateValueRetriever(this.state, state => state.stocks)}
                availableStockSymbols={StateValueRetriever(this.state, state => state.availableStockSymbols)}
                selectedStockSortOrderTracker={this.props.selectedStockSortOrderTracker}
                add={this.props.stateTracker.addStockSelection}
                remove={this.props.stateTracker.removeStockSelection}
                sort={this.props.stateTracker.sortStockSelection}
                updateStockAlert={stock => this.updateStockAlert(stock)}
                reloadSelectedStocks={() => this.tryToReloadSelectedStocks()}
                viewAlerts={() => this.setState({ showingAlerts: true })} />
        }
      </Fragment>
    )
  }

  private onChange (state: StockViewerState) {
    this.setState({
      stocks: state.get('trackedStocks'),
      availableStockSymbols: state.get('availableStockSymbols')
    })
  }

  private tryToReloadSelectedStocks () {
    this.setState({ stocks: null })
    this.props.reloadSelectedStocks()
  }

  private updateStockAlert (updatedStock: SelectedStockSymbol) {
    const stocks = StateValueRetriever(this.state, state => state.stocks)
    if ((stocks === null) || (stocks instanceof Error)) {
      return
    }

    this.props.stateTracker.replaceStockSelections(
      stocks.map(stock => (stock.symbol === updatedStock.symbol)
        ? stock.withPriceDeviationPercentageForAlert(updatedStock.priceDeviationPercentageForAlert)
        : stock)
    )
  }

  componentWillUnmount () {
    this.props.stateTracker.unregisterChangeListener(this.onChangeBound)
  }
}
