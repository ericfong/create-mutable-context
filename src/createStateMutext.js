import { createElement, Component } from 'react'
import createReactContext from 'create-react-context'

const createMutableContext = (confDefaultValue, calcChangedBits, confEnhancer) => {
  const { Provider, Consumer } = createReactContext(confDefaultValue, calcChangedBits)

  class StateMutextProvider extends Component {
    constructor(props) {
      super(props)

      const value = [props.value, props.defaultValue, confDefaultValue].find(a => a !== undefined)
      let state = this.getStateFromValue(value) || {}

      // basic enhancer
      state.set = this.set

      // global-level enhancer
      if (confEnhancer) state = confEnhancer(state, props)
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
      // prevent overwrite set or enhanced functions? in componentWillReceiveProps
      return value
    }

    getStateUpdater(updater) {
      // prevent overwrite set or enhanced functions? in set function
      return updater
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

  return { Provider: StateMutextProvider, Consumer }
}

export default createMutableContext
