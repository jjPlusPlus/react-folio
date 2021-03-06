import React, { Component } from 'react';

import { CSSTransition } from 'react-transition-group';

class Typer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: ""
    }
    this.spacebar = new Audio('https://raw.githubusercontent.com/yingDev/Tickeys/master/Tickeys.app/Contents/Resources/data/Cherry_G80_3494/G80-3494_space.wav');
    this.slowkey = new Audio('https://raw.githubusercontent.com/yingDev/Tickeys/master/Tickeys.app/Contents/Resources/data/Cherry_G80_3494/G80-3494_slow1.wav');
    this.fastkey = new Audio('https://raw.githubusercontent.com/yingDev/Tickeys/master/Tickeys.app/Contents/Resources/data/Cherry_G80_3494/G80-3494_fast1.wav');
    this.midkey = new Audio('https://raw.githubusercontent.com/yingDev/Tickeys/master/Tickeys.app/Contents/Resources/data/Cherry_G80_3494/G80-3494_enter.wav');
    this.mounted = true;
  }

  componentDidMount() {
    const { text, delay, interval } = this.props;
    this._animateType(text, delay, interval);
  }

  componentWillUnmount() {
    this.spacebar.pause();
    this.slowkey.pause();
    this.fastkey.pause();
    this.midkey.pause();
    this.mounted = false;
  }

  async _animateType(text, delay, interval) {
    const timeout = ms => new Promise(res => setTimeout(res, ms));
    await timeout(delay);
    let key;

    for (var i = 0; i < text.length ; i++) {
      await timeout(interval);
      if (!this.mounted) { return; }
      key = Math.floor(Math.random() * 3) + 1;

      if (text[i] === " ") {
        this.spacebar.play()
      } else {
        switch (key) {
          case 1:
            this.slowkey.play();
            break;
          case 2:
            this.fastkey.play();
            break;
          case 3:
            this.midkey.play();
            break;
          default:
            break;
        }
      }


      let show = this.state.show;
      show += text[i];
      this.setState({
        show: show
      })
    }
  }

  render() {
    return (
      <span>
        {this.state.show}
      </span>
    )
  }
}

export default Typer
