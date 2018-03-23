/* eslint-disable react/no-multi-comp, no-bitwise */
import 'raf/polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import createMutableContext from './createMutableContext'

Enzyme.configure({ adapter: new Adapter() })

class Indirection extends React.Component {
  shouldComponentUpdate() {
    return false
  }
  render() {
    return this.props.children
  }
}

test('basic', () => {
  const C = createMutableContext({ foo: 1 })

  const App = () => (
    <C.Provider>
      <Indirection>
        <C.Consumer>
          {ctx => <button onClick={() => ctx.set({ foo: ctx.foo + 1 })}>{ctx.foo}</button>}
        </C.Consumer>
      </Indirection>
    </C.Provider>
  )

  const button = mount(<App />).find('button')
  expect(button.text()).toBe('1')
  button.simulate('click')
  expect(button.text()).toBe('2')
})

test('controlled', () => {
  let calcChangeA
  let calcChangeB
  const C = createMutableContext(null, (a, b) => {
    calcChangeA = a
    calcChangeB = b
    return 0b1111111111
  })

  const App = props => (
    <C.Provider value={{ foo: props.foo }}>
      <Indirection>
        <C.Consumer>{ctx => <span prop={`Foo: ${ctx.foo}`} />}</C.Consumer>
      </Indirection>
    </C.Provider>
  )

  const wrapper = mount(<App foo={1} />)
  expect(wrapper.contains(<span prop="Foo: 1" />)).toBe(true)

  wrapper.setProps({ foo: 2 })
  expect(wrapper.contains(<span prop="Foo: 2" />)).toBe(true)

  expect(calcChangeA).toMatchObject({ foo: 1 })
  expect(calcChangeB).toMatchObject({ foo: 2 })
})

test('enhancer', () => {
  const C1 = createMutableContext({ foo: 1 }, null, {
    providerConstruct(provider) {
      provider.state.inc1 = () => provider.set(prev => ({ foo: prev.foo + 1 }))
    },
  })

  const App = () => (
    <C1.Provider>
      <C1.Consumer>
        {ctx => {
          return (
            <button id="btn1" onClick={ctx.inc1}>
              {ctx.foo}
            </button>
          )
        }}
      </C1.Consumer>
    </C1.Provider>
  )

  const wrap = mount(<App />)
  const btn1 = wrap.find('#btn1')

  expect(btn1.text()).toBe('1')
  btn1.simulate('click')
  expect(btn1.text()).toBe('2')
})
