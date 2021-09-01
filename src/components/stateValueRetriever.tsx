// Try to access a value on a state reference if that state reference has been
// defined (on first render, it may well not have been) - if not, return null
export default function fromStateIfDefined<TState, TValue> (state: TState, item: ((state: TState) => TValue)) {
  return state ? item(state) : null
}
