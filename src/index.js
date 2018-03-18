/* eslint-disable react/no-unused-state */
import { createElement, Component } from 'react'
import createReactContext from 'create-react-context'

export const wrapUpdateField = (updater, stateKey) => {
  return typeof updater === 'function'
    ? (prevState, props) => ({ [stateKey]: updater(prevState[stateKey], props) })
    : { [stateKey]: updater }
}

const createMutableContext = (defaultValue, defaultEnhancer) => {
  const { Provider, Consumer } = createReactContext(defaultValue)

  class MutableProvider extends Component {
    constructor(props) {
      super(props)

      let state = {
        set: this.set,
        value: this.props.value || defaultValue,
      }

      if (defaultEnhancer) state = defaultEnhancer(state, props)
      const { enhancer } = props
      if (enhancer) state = enhancer(state, props)

      this.state = state
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.value !== this.props.value) {
        this.setState({ value: nextProps.value })
      }
    }

    set = (newValue, callback) => {
      const { onChange } = this.props
      if (onChange) {
        onChange(newValue, callback)
      } else {
        this.setState(wrapUpdateField(newValue, 'value'), callback)
      }
    }

    render() {
      return createElement(Provider, { value: this.state }, this.props.children)
    }
  }

  const MutableConsumer = props => {
    return createElement(Consumer, props, (state, ...args) =>
      props.children(state.value, state, ...args))
  }

  return {
    Provider: MutableProvider,
    Consumer: MutableConsumer,
  }
}

export default createMutableContext
