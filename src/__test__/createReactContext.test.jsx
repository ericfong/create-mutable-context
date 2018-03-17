/* eslint-disable react/no-multi-comp */
import 'raf/polyfill'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import createMutableContext from '..'

Enzyme.configure({ adapter: new Adapter() })

const { Provider, Consumer } = createMutableContext()

class Child extends React.Component {
  shouldComponentUpdate() {
    return false
  }
  render() {
    return (
      <Consumer>
        {ctx => (
          <div>
            <h1>
              {this.props.children} {ctx.number} {ctx.withStateNumber}
            </h1>
            <button
              onClick={() => {
                ctx.setState(state => ({
                  number: (state.number || 0) + 1,
                }))
              }}
            >
              Inc
            </button>
          </div>
        )}
      </Consumer>
    )
  }
}

test('with provider', () => {
  const dom = (
    <Provider
      defaultState={{ number: 1 }}
      withState={updates => {
        return { ...updates, withStateNumber: updates.number }
      }}
    >
      <Child>Hi</Child>
    </Provider>
  )
  const wrapper = mount(dom)

  expect(wrapper.find('h1').text()).toBe('Hi 1 1')
  wrapper.find('button').simulate('click')
  expect(wrapper.find('h1').text()).toBe('Hi 2 2')
})
