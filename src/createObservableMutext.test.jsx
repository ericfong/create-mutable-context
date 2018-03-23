/* eslint-disable react/no-multi-comp, no-bitwise */
// import 'raf/polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import createObservableMutext from './createObservableMutext'

Enzyme.configure({ adapter: new Adapter() })

class Indirection extends React.Component {
  shouldComponentUpdate() {
    return false
  }
  render() {
    return this.props.children
  }
}

test('can skip consumers with bitmask', () => {
  const renders = { Foo: 0, Bar: 0, BarOrFoo: 0 }
  const C = createObservableMutext({ foo: 0, bar: 0 }, { foo: {}, bar: {} })

  const App = props => (
    <C.Provider value={{ foo: props.foo, bar: props.bar }}>
      <Indirection>
        <Indirection>
          <C.Consumer observe="foo">
            {ctx => {
              renders.Foo += 1
              return <span prop={`Foo: ${ctx.foo}`} />
            }}
          </C.Consumer>
        </Indirection>
        <Indirection>
          <C.Consumer observe="bar">
            {ctx => {
              renders.Bar += 1
              return <span prop={`Bar: ${ctx.bar}`} />
            }}
          </C.Consumer>
        </Indirection>
        <Indirection>
          <C.Consumer observe="bar,foo">
            {ctx => {
              renders.BarOrFoo += 1
              return <span prop={`BarOrFoo: ${ctx.bar} ${ctx.foo}`} />
            }}
          </C.Consumer>
        </Indirection>
      </Indirection>
    </C.Provider>
  )

  const wrapper = mount(<App foo={1} bar={1} />)
  expect(renders.Foo).toBe(1)
  expect(renders.Bar).toBe(1)
  expect(renders.BarOrFoo).toBe(1)
  expect(wrapper.contains(<span prop="Foo: 1" />, <span prop="Bar: 1" />)).toBe(true)

  // Update only foo
  wrapper.setProps({ foo: 2, bar: 1 })
  expect(renders.Foo).toBe(2)
  expect(renders.Bar).toBe(1)
  expect(renders.BarOrFoo).toBe(2)
  expect(wrapper.contains(<span prop="Foo: 2" />, <span prop="Bar: 1" />)).toBe(true)

  // Update only bar
  wrapper.setProps({ bar: 2, foo: 2 })
  expect(renders.Foo).toBe(2)
  expect(renders.Bar).toBe(2)
  expect(renders.BarOrFoo).toBe(3)
  expect(wrapper.contains(<span prop="Foo: 2" />, <span prop="Bar: 2" />)).toBe(true)

  // Update both
  wrapper.setProps({ bar: 3, foo: 3 })
  expect(renders.Foo).toBe(3)
  expect(renders.Bar).toBe(3)
  expect(renders.BarOrFoo).toBe(4)
  expect(wrapper.contains(<span prop="Foo: 3" />, <span prop="Bar: 3" />))
})
