/* eslint-disable react/no-multi-comp, no-bitwise */
import 'raf/polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { stateMutableContext } from '.'

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
  const C = stateMutableContext({ foo: 1 })

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
