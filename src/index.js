const React = require('react');
const { Provider } = require('react-redux');
const importJsx = require('import-jsx');

const App = importJsx('./app');
const store = require('./store');

function UI () {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

module.exports = UI;
