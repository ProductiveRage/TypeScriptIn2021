import React, { PureComponent, ReactElement, Fragment } from 'react'
import { List } from 'immutable'
import HeaderMessage from './headerMessage'
import Loading from './loading'
import ErrorMessage from './errorMessage'
import AlertList from './alertList'
import RetrievalResponse from '../state/retrievalResponse'
import Stock from '../state/stock'

interface Props {
  readonly stocks: RetrievalResponse<List<Stock>>
  readonly removeAlert: (symbol: string) => void
  readonly reloadSelectedStocks: () => void
  readonly viewSelectedStocks: () => void
}

export default class AlertTracker extends PureComponent<Props> {
  render () {
    return (
      <div className='alerts'>
        <header>
          <HeaderMessage title='Stock Alerts' />
          <button onClick={() => this.props.viewSelectedStocks()}>View Selected Stocks</button>
        </header>
        <section className='main'>{this.renderMainContent()}</section>
     </div>
    )
  }

  private renderMainContent () {
    return AlertTracker.renderRetrievalResponse(
      this.props.stocks,
      stocks =>
        <Fragment>
          <AlertList stocks={stocks} removeAlert={symbol => this.props.removeAlert(symbol)} />
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
