wrap new React.createContext() to provide context with setState function for Consumer

# NOTE

According to [0002-new-version-of-context](https://github.com/reactjs/rfcs/blob/master/text/0002-new-version-of-context.md#relies-on-strict-comparison-of-context-values), mutation should be discouraged. But in some situations, Consumer really need a way to update the Provider.

So, I come up with this module, which is a bit hacky by just inject a setState function to Provider value.

# Usage

```js
import createMutableContext from 'create-mutable-context'

const { Provider, Consumer } = createMutableContext()

<Provider defaultState={{ number: 1 }}>
  <Consumer>
    {state => (
      <button
        onClick={() => {
          // state should be a plain js object
          // setState will be injected to state
          // setState has exactly some interface as normal react component's setState
          state.setState(state => ({
            number: state.number + 1,
          }))
        }}
      >
        {state.number}
      </button>
    )}
  </Consumer>
</Provider>
```

can use withState function to process updates before actually pass to setState

```js
<Provider
  defaultState={{ number: 1 }}
  withState={updates => {
    return { ...updates, withStateNumber: updates.number }
  }}
>
  <Consumer>
    {state => (
      <div>
        {ctx.withStateNumber}
      </button>
    )}
  </Consumer>
</Provider>
```
