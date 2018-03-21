import createStateMutext from './createStateMutext'

export const wrapUpdaterScope = (updater, stateKey) => {
  return typeof updater === 'function'
    ? (prevState, props) => ({ [stateKey]: updater(prevState[stateKey], props) })
    : { [stateKey]: updater }
}

const createValueMutext = (confDefaultValue, calcChangedBits, confEnhancer) => {
  const { Provider, Consumer } = createStateMutext(
    confDefaultValue,
    calcChangedBits ? ({ value: a }, { value: b }) => calcChangedBits(a, b) : undefined,
    confEnhancer
  )

  class ValueMutextProvider extends Provider {
    getStateFromValue(value) {
      return { value }
    }
    getStateUpdater(updater) {
      return wrapUpdaterScope(updater, 'value')
    }
  }

  return { Provider: ValueMutextProvider, Consumer }
}

export default createValueMutext
