import React, { Component } from 'react'
import Popup from './popup'
import SelectedStockSymbol from '../stockPriceRetrieval/selectedStockSymbol'

interface Props {
  readonly stockToSetAlertFor: SelectedStockSymbol
  readonly ok: (priceDeviationPercentageForAlert: number) => void
  readonly cancel: () => void
}

interface State {
  readonly priceDeviationPercentageForAlert: number
}

export default class PopupForSettingAlert extends Component<Props, State> {
  render () {
    return (
      <Popup className="add-alert">
        <div className="main">
          <h3>EdiAlert: <span className="symbol">{this.props.stockToSetAlertFor.symbol}</span></h3>
          <span>Percentage change</span>
          <input
            className="alert-point"
            type="number"
            step="any"
            autoFocus={true}
            onKeyDown={e => { if (e.key === 'Escape') { this.props.cancel() } }} // Need key-down, not key-press, to capture [Esc]
            value={this.getPriceDeviationPercentageForAlert()}
            onChange={e => {
              this.setState({ priceDeviationPercentageForAlert: PopupForSettingAlert.toNumber(e.currentTarget.value) })
            }} />
            <span className="notes">Set to zero to disable alert</span>
        </div>
        <div className="buttons">
          <button onClick={_ => this.props.ok(this.getPriceDeviationPercentageForAlert()) }>Ok</button>
          <button onClick={_ => this.props.cancel()}>Cancel</button>
        </div>
      </Popup>
    )
  }

  private getPriceDeviationPercentageForAlert () {
    return (this.state !== null)
      ? this.state.priceDeviationPercentageForAlert
      : this.props.stockToSetAlertFor.priceDeviationPercentageForAlert
  }

  // Don't try to use e.currentTarget.valueAsNumber in PopupForSettingAlert's onChange
  // because it will throw for a blank value - so be more forgiving of that
  private static toNumber (value: string) {
    const numericString = parseFloat(value)
    return isFinite(numericString) ? numericString : 0
  }
}
