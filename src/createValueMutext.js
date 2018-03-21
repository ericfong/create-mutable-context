import createStateMutext from './createStateMutext'

export const wrapUpdateField = (updater, stateKey) => {
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

  class StateMutableProvider extends Provider {
    getStateFromValue(value) {
      return { value }
    }
    getStateUpdater(updater) {
      return wrapUpdateField(updater, 'value')
    }
  }

  return { Provider: StateMutableProvider, Consumer }
}

export default createValueMutext
