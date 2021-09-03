import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { StockSelectionTracker, changeListener } from '../../src/state/stockViewerState'

interface Props {
  readonly tracker: StockSelectionTracker
  readonly unmounted: () => void
}

// Used by the the test below to ensure that the slightly-unusual un/registerChangeListener
// code in the StockSelectionTracker works as expected (and could act as a regression
// test if it was felt that that logic was not actually required)
class StockSelectionTrackerListener extends PureComponent<Props> {
  readonly onChangeBound: changeListener
  constructor (props: {tracker: StockSelectionTracker, unmounted: () => void}) {
    super(props)
    this.onChangeBound = this.onChange.bind(this) // bind so can onChange can access this.state
    props.tracker.registerChangeListener(this.onChangeBound)
  }

  render () {
    return null // Test component only - will never be rendered
  }

  componentWillUnmount () {
    this.props.tracker.unregisterChangeListener(this.onChangeBound)
    this.props.unmounted()
  }

  private onChange () { }
}

// This test only exists to confirm that the funky logic in the StockSelectionTracker
// works correctly - the un/registerChangeListener callbacks will be bound to the React
// component and so they unregistering won't work without that re-binding approach
describe('StockSelectionTracker', () => {
  describe('ChangeListeners', () => {
    it('should successfully be unbound', done => {
      const tracker = new StockSelectionTracker(
        symbol => Promise.reject(new Error('Retrieval not required for this test'))
      )
      expect(tracker.areThereAnyRegisteredChangeListeners()).toEqual(false)

      const container = document.createElement('div')
      document.body.appendChild(container)

      const unmounted = function () {
        // Require a callback from the component's componentWillUnmount method to
        // confirm that the unmounting process has completed
        expect(tracker.areThereAnyRegisteredChangeListeners()).toEqual(false)
        done()
      }

      ReactDOM.render(
        <StockSelectionTrackerListener
          tracker={tracker}
          unmounted={unmounted} />,
        container,
        () => {
          // Use the ReactDOM.render callback to be sure that the component has been mounted
          expect(tracker.areThereAnyRegisteredChangeListeners()).toEqual(true)
          ReactDOM.unmountComponentAtNode(container)
        }
      )
    })
  })
})
