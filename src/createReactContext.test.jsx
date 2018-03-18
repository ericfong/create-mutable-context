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

test('enhancer', () => {
  const C1 = createMutableContext(1, ctx => {
    ctx.inc1 = () => ctx.set(prevValue => prevValue + 1)
    return ctx
  })

  const App = () => (
    <C1.Provider
      enhancer={ctx => {
        ctx.inc2 = () => ctx.set(prevValue => prevValue + 2)
        return ctx
      }}
    >
      <C1.Consumer>
        {ctx => (
          <button id="btn1" onClick={ctx.inc1}>
            {ctx.value}
          </button>
        )}
      </C1.Consumer>
      <C1.Consumer>
        {ctx => (
          <button id="btn2" onClick={ctx.inc2}>
            {ctx.value}
          </button>
        )}
      </C1.Consumer>
    </C1.Provider>
  )

  const wrap = mount(<App />)
  const btn1 = wrap.find('#btn1')
  const btn2 = wrap.find('#btn2')

  expect(btn1.text()).toBe('1')
  expect(btn2.text()).toBe('1')

  btn1.simulate('click')
  expect(btn1.text()).toBe('2')
  expect(btn2.text()).toBe('2')

  btn2.simulate('click')
  expect(btn1.text()).toBe('4')
  expect(btn2.text()).toBe('4')
})
