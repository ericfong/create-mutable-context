wrap new React.createContext() to provide context with a set function for Consumer

# NOTE

According to [0002-new-version-of-context](https://github.com/reactjs/rfcs/blob/master/text/0002-new-version-of-context.md#relies-on-strict-comparison-of-context-values), mutation is discouraged. But in some situations, Consumer really need a way to update the Provider.

So, I come up with this module.

# Usage

```js
import createMutableContext from 'create-mutable-context'

const { Provider, Consumer } = createMutableContext()

<Provider
  value={this.state.valueA}
>
  <Consumer>
    {(value, ctx) => {
      // second argument is ctx, which contain Provider's props and a set function
      return <button onClick={() => ctx.set(value + 1)}>{value}</button>
    }}
  </Consumer>
</Provider>
```

## ctx.set()

```js
set(updater[, callback])
```

set function interface is similar to react component's setState(), which accept updater as `object` or `function`.

updater as function with the signature:

```js
updater = (prevValue, providerProps) => newValue
```

**set will just replace the value. It will NOT merge newValue to prevValue.**

## keep value in your own state by Provider.onChange

you can also keep value in your own state (like Input)

```js
import createMutableContext from 'create-mutable-context'

const { Provider, Consumer } = createMutableContext()

class App extends React.Component {
  state = { valueA: 1 }
  render() {
    return (
      <Provider value={this.state.valueA} onChange={valueA => this.setState({ valueA })}>
        <Consumer>
          {(value, ctx) => {
            return <button onClick={() => ctx.set(value + 1)}>{value}</button>
          }}
        </Consumer>
      </Provider>
    )
  }
}
```
