import { createElement, Component } from 'react'
import createReactContext from 'create-react-context'

export const wrapUpdateField = (updater, stateKey) => {
  return typeof updater === 'function'
    ? (prevState, props) => ({ [stateKey]: updater(prevState[stateKey], props) })
    : { [stateKey]: updater }
}

const createMutableContext = (globalDefaultValue, calcChangedBits, defaultEnhancer) => {
  const { Provider, Consumer } = createReactContext(
    globalDefaultValue,
    calcChangedBits ? ({ value: a }, { value: b }) => calcChangedBits(a, b) : null
  )

  class MutableProvider extends Component {
    constructor(props) {
      super(props)

      const value = [props.value, props.defaultValue, globalDefaultValue].find(a => a !== undefined)
      let state = this.getStateFromValue(value)

      // basic enhancer
      // TODO ensure state is object?
      state.set = this.set

      // global-level enhancer
      if (defaultEnhancer) state = defaultEnhancer(state, props)
      // provider-level enhancer
      const { enhancer } = props
      if (enhancer) state = enhancer(state, props)

      this.state = state
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.value !== this.props.value) {
        this.setState(this.getStateFromValue(nextProps.value))
      }
    }

    // allow override to change ctx to value relationship
    getStateFromValue(value) {
      return { value }
    }

    getStateUpdater(updater) {
      return wrapUpdateField(updater, 'value')
    }

    set = (newValue, callback) => {
      const { value, onChange } = this.props
      // this is Uncontrolled
      if (value === undefined) this.setState(this.getStateUpdater(newValue), callback)
      // always fire onChange for persist usage
      if (onChange) onChange(newValue, callback)
    }

    render() {
      return createElement(Provider, { value: this.state }, this.props.children)
    }
  }

  return { Provider: MutableProvider, Consumer }
}

export default createMutableContext
