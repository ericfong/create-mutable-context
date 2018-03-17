import { createElement, Component } from 'react'
import createReactContext from 'create-react-context'

const createMutableContext = globalWithState => {
  const { Provider, Consumer } = createReactContext({})

  const runWithState = (updates, prevState, props) => {
    if (globalWithState) updates = globalWithState(updates, prevState, props)
    const { withState } = props
    if (withState) updates = withState(updates, prevState, props)
    return updates
  }

  const wrapUpdater = updater => {
    return (prevState, props) => {
      const updates = typeof updater === 'function' ? updater(prevState, props) : updater
      return runWithState(updates, prevState, props)
    }
  }

  class MutableProvider extends Component {
    state = runWithState(
      Object.assign({}, this.props.defaultState, {
        // eslint-disable-next-line react/no-unused-state
        setState: (updater, callback) => this.setState(wrapUpdater(updater), callback),
      }),
      {},
      this.props
    )

    render() {
      return createElement(Provider, { value: this.state }, this.props.children)
    }
  }

  return {
    Provider: MutableProvider,
    Consumer,
  }
}

export default createMutableContext
