import mutableContext from './mutableContext'

const stateMutableContext = (gDefaultValue, calcChangedBits, gEnhancer) => {
  const { Provider, Consumer } = mutableContext(gDefaultValue, calcChangedBits, gEnhancer)

  class StateMutableProvider extends Provider {
    getStateFromValue(value) {
      // prevent overwrite set or enhanced functions? in componentWillReceiveProps
      return value || {}
    }
    getStateUpdater(updater) {
      // prevent overwrite set or enhanced functions? in set function
      return updater
    }
  }

  return { Provider: StateMutableProvider, Consumer }
}

export default stateMutableContext
