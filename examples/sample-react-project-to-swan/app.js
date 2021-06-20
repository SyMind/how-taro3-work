import { Component } from 'react';

class App extends Component {
  onLaunch(options) {
    console.log('onLaunch', options)
  }

  onShow(options) {
    console.log('onShow', options)
  }

  onHide() {
    console.log('onHide')
  }

  render() {
    return this.props.children;
  }
}

export default App;
