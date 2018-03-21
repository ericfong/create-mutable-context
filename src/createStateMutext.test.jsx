/* eslint-disable react/no-multi-comp, no-bitwise */
import 'raf/polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { createStateMutext } from '.'

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
  const C = createStateMutext({ foo: 1 })

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
  const C = createStateMutext(null, (a, b) => {
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
