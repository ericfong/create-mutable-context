/* eslint-disable react/no-multi-comp */
import 'raf/polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import createMutableContext, { wrapUpdateField } from '.'

Enzyme.configure({ adapter: new Adapter() })

const { Provider, Consumer } = createMutableContext()

test('basic', () => {
  class Child extends React.Component {
    shouldComponentUpdate() {
      return false
    }
    render() {
      return (
        <Consumer>
          {(value, ctx) => {
            return <button onClick={() => ctx.set(value + 1)}>{value}</button>
          }}
        </Consumer>
      )
    }
  }
  const dom = (
    <Provider value={1}>
      <Child />
    </Provider>
  )

  const button = mount(dom).find('button')
  expect(button.text()).toBe('1')
  button.simulate('click')
  expect(button.text()).toBe('2')
})

test('onChange', () => {
  class App extends React.Component {
    state = { valueA: 1 }
    render() {
      return (
        <Provider
          value={this.state.valueA}
          onChange={(updater, callback) =>
            this.setState(wrapUpdateField(updater, 'valueA'), callback)
          }
        >
          <Consumer>
            {(value, ctx) => {
              return <button onClick={() => ctx.set(prevValue => prevValue + 1)}>{value}</button>
            }}
          </Consumer>
        </Provider>
      )
    }
  }

  const button = mount(<App />).find('button')
  expect(button.text()).toBe('1')
  button.simulate('click')
  expect(button.text()).toBe('2')
})
