import { createElement, Component } from 'react'

import createStateMutext from './createStateMutext'
import getBitmaskTable from './getBitmaskTable'

const MAX_SIGNED_31_BIT_INT = 1073741823

const parseNames = nameStr => nameStr.split(/\s*,\s*/)

const createObservableMutext = (preload, tableConfs, gEnhancer) => {
  const tableNames = Object.keys(tableConfs).sort()
  const bitmaskTable = getBitmaskTable(tableNames)

  const calcChangedBits = (a, b) => {
    const result = tableNames.reduce((r, name) => {
      // eslint-disable-next-line no-bitwise
      return a[name] !== b[name] ? r | bitmaskTable[name] : r
    }, 0)
    // changed on somethings that not in names
    return result === 0 && a !== b ? MAX_SIGNED_31_BIT_INT : result
  }

  const { Provider, Consumer } = createStateMutext(preload, calcChangedBits, gEnhancer)

  const getObservedBits = observe => {
    // observe should be string to recognition
    return parseNames(observe).reduce((r, name) => {
      // eslint-disable-next-line no-bitwise
      return r | bitmaskTable[name]
    }, 0)
  }
  class ObservableMutextConsumer extends Component {
    componentWillReceiveProps(nextProps) {
      if (this.props.observe !== nextProps.observe) {
        this.observedBits = getObservedBits(nextProps.observe)
      }
    }
    observedBits = getObservedBits(this.props.observe)
    render() {
      return createElement(Consumer, {
        ...this.props,
        observedBits: this.observedBits,
      })
    }
  }

  return { Provider, Consumer: ObservableMutextConsumer }
}

export default createObservableMutext
