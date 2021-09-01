import React, { Fragment, PureComponent } from 'react'
import { List } from 'immutable'

interface Props {
  readonly availableStockSymbols : List<string>
  readonly add: (symbol: string) => void
}

export default class StockAdder extends PureComponent<Props> {
  render () {
    return <div className="stock-adder">{this.renderOptions()}</div>
  }

  private renderOptions () {
    if (this.props.availableStockSymbols.isEmpty()) {
      return <div className="no-options">No options</div>
    }

    const orderedSymbolOptions = this.props.availableStockSymbols.sortBy(symbol => symbol)
    let symbolToAdd = orderedSymbolOptions.get(0)!
    return (
      <Fragment>
        <select onChange={e => { symbolToAdd = e.currentTarget.value }}>
          {
            orderedSymbolOptions.map(symbol => <option key={symbol} value={symbol}>{symbol}</option>)
          }
        </select>
        <button className="add" onClick={_ => this.props.add(symbolToAdd)}>Add</button>
      </Fragment>
    )
  }
}
