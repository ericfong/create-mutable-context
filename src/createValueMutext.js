import createMutableContext from './createMutableContext'

export const wrapUpdaterScope = (updater, stateKey) => {
  return typeof updater === 'function'
    ? (prevState, props) => ({ [stateKey]: updater(prevState[stateKey], props) })
    : { [stateKey]: updater }
}

const createValueMutext = (confDefaultValue, calcChangedBits) => {
  const { Provider, Consumer } = createMutableContext(
    confDefaultValue,
    calcChangedBits ? ({ value: a }, { value: b }) => calcChangedBits(a, b) : undefined
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
