import { createElement, Component } from 'react'
import createReactContext from 'create-react-context'

/* eslint-disable react/no-multi-comp */

const wrapConsumer = (Consumer, { consumerConstruct, consumerProps, consumerCtx }) => {
  class MutextConsumer extends Component {
    constructor(props) {
      super(props)
      this.consumerConstruct(this)
    }
    consumerConstruct(consumer) {
      if (consumerConstruct) consumerConstruct(consumer)
    }
    consumerProps(props, consumer) {
      return consumerProps ? consumerProps(props, consumer) : props
    }
    consumerCtx(ctx, consumer) {
      return consumerCtx ? consumerCtx(ctx, consumer) : ctx
    }
    render() {
      const props = this.consumerProps(this.props, this)
      return createElement(Consumer, {
        ...props,
        // children: ctx => this.consumerCtx(ctx, this),
        children: ctx => props.children(this.consumerCtx(ctx, this)),
      })
    }
  }
  return MutextConsumer
}

const createMutableContext = (confDefaultValue, calcChangedBits, option = {}) => {
  const { Provider, Consumer } = createReactContext(confDefaultValue, calcChangedBits)

  const { providerConstruct } = option

  class MutextProvider extends Component {
    constructor(props) {
      super(props)

      const value = [props.value, props.defaultValue, confDefaultValue].find(a => a !== undefined)
      const state = this.getStateFromValue(value) || {}

      state.set = this.set
      this.state = state

      if (providerConstruct) providerConstruct(this)
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

  return { Provider: MutextProvider, Consumer: wrapConsumer(Consumer, option) }
}

export default createMutableContext
