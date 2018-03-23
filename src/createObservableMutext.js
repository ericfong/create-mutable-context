import createMutableContext from './createMutableContext'
import getBitmaskTable from './getBitmaskTable'

const MAX_SIGNED_31_BIT_INT = 1073741823

const parseNames = nameStr => nameStr.split(/\s*,\s*/)

const noop = () => {}

const createObservableMutext = (preload, tableConfs, option = {}) => {
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

  const getObservedBits = observe => {
    // observe should be string to recognition
    return parseNames(observe).reduce((r, name) => {
      // eslint-disable-next-line no-bitwise
      return r | bitmaskTable[name]
    }, 0)
  }

  const { Provider, Consumer } = createMutableContext(preload, calcChangedBits, {
    ...option,
    // ensure wrap consumer
    consumerConstruct: option.consumerConstruct || noop,
  })

  class ObservableConsumer extends Consumer {
    componentWillReceiveProps(nextProps) {
      if (this.props.observe !== nextProps.observe) {
        this.observedBits = getObservedBits(nextProps.observe)
      }
    }
    observedBits = getObservedBits(this.props.observe)
    consumerProps(props, consumer) {
      props = super.consumerProps(props, consumer)
      props = {
        ...props,
        observedBits: consumer.observedBits,
      }
      return props
    }
  }

  return { Provider, Consumer: ObservableConsumer }
}

export default createObservableMutext
