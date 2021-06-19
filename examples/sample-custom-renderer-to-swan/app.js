import React, {Component} from 'react';
import {createSwanApp} from '../../lib/runtime';

class ReactApp extends Component {
    constructor() {
        super()
        console.log('App constructor')
    }

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

App(createSwanApp(ReactApp))
