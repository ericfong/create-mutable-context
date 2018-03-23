/* eslint-disable react/no-multi-comp, no-bitwise */
import 'raf/polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import createValueMutext, { wrapUpdaterScope } from './createValueMutext'

Enzyme.configure({ adapter: new Adapter() })

export class Indirection extends React.Component {
  shouldComponentUpdate() {
    return false
  }
  render() {
    return this.props.children
  }
}

test('basic', () => {
  const { Provider, Consumer } = createValueMutext()

  class Child extends React.Component {
    shouldComponentUpdate() {
      return false
    }
    render() {
      return (
        <Consumer>
          {ctx => {
            return <button onClick={() => ctx.set(ctx.value + 1)}>{ctx.value}</button>
          }}
        </Consumer>
      )
    }
  }
  const dom = (
    <Provider defaultValue={1}>
      <Child />
    </Provider>
  )

  const button = mount(dom).find('button')
  expect(button.text()).toBe('1')
  button.simulate('click')
  expect(button.text()).toBe('2')
})

test('onChange', () => {
  const { Provider, Consumer } = createValueMutext()

  class App extends React.Component {
    state = { valueA: 1 }
    render() {
      return (
        <Provider
          value={this.state.valueA}
          onChange={(updater, callback) =>
            this.setState(wrapUpdaterScope(updater, 'valueA'), callback)
          }
        >
          <Consumer>
            {ctx => {
              return (
                <button onClick={() => ctx.set(prevValue => prevValue + 1)}>{ctx.value}</button>
              )
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

test('can skip consumers with bitmask', () => {
  const renders = { Foo: 0, Bar: 0 }

  const C = createValueMutext({ foo: 0, bar: 0 }, (a, b) => {
    let result = 0
    if (a.foo !== b.foo) result |= 0b01
    if (a.bar !== b.bar) result |= 0b10
    return result
  })

  function App(props) {
    return (
      <C.Provider value={{ foo: props.foo, bar: props.bar }}>
        <Indirection>
          <Indirection>
            <C.Consumer observedBits={0b01}>
              {({ value }) => {
                renders.Foo += 1
                return <span prop={`Foo: ${value.foo}`} />
              }}
            </C.Consumer>
          </Indirection>
          <Indirection>
            <C.Consumer observedBits={0b10}>
              {({ value }) => {
                renders.Bar += 1
                return <span prop={`Bar: ${value.bar}`} />
              }}
            </C.Consumer>
          </Indirection>
        </Indirection>
      </C.Provider>
    )
  }

  const wrapper = mount(<App foo={1} bar={1} />)
  expect(renders.Foo).toBe(1)
  expect(renders.Bar).toBe(1)
  expect(wrapper.contains(<span prop="Foo: 1" />, <span prop="Bar: 1" />)).toBe(true)

  // Update only foo
  wrapper.setProps({ foo: 2, bar: 1 })
  expect(renders.Foo).toBe(2)
  expect(renders.Bar).toBe(1)
  expect(wrapper.contains(<span prop="Foo: 2" />, <span prop="Bar: 1" />)).toBe(true)

  // Update only bar
  wrapper.setProps({ bar: 2, foo: 2 })
  expect(renders.Foo).toBe(2)
  expect(renders.Bar).toBe(2)
  expect(wrapper.contains(<span prop="Foo: 2" />, <span prop="Bar: 2" />)).toBe(true)

  // Update both
  wrapper.setProps({ bar: 3, foo: 3 })
  expect(renders.Foo).toBe(3)
  expect(renders.Bar).toBe(3)
  expect(wrapper.contains(<span prop="Foo: 3" />, <span prop="Bar: 3" />))
})
