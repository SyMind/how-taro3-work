class EventTarget {
  constructor() {
    this._eventListeners = Object.create(null);
  }

  addEventListener(type, callback) {
    if (callback === null) {
      return;
    }

    if (!this._eventListeners[type]) {
      this._eventListeners[type] = [];
    }

    this._eventListeners[type].push(callback);
  }

  invokeEventListeners(type, event) {
    const callbacks = this._eventListeners[type];
    if (!callbacks) {
      return
    }

    callbacks.slice().forEach(callback => callback(event))
  }
}

class Node extends EventTarget {
  childNodes = []

  constructor(pageInst) {
    super(pageInst)
    this.pageInst = pageInst;
  }

  get value() {
    return {
      type: this.type,
      children: this.childNodes.map(child => child.value)
    };
  }

  get path() {
    if (!this.parentEl) {
      return ''
    }

    const index = this.parentEl.childNodes.indexOf(this)
    return `${this.parentEl.path}.children[${index}]`
  }

  _replaceAll(el) {
    el.parentEl = this;
    this.childNodes = [el]

    if (this.parentEl) {
      const key = `${this.path}.children[${this.childNodes.length - 1}]`;
      this.pageInst.setData({
        [key]: el.value
      });
    }
  }

  appendChild(el) {
    el.parentEl = this;
    this.childNodes.push(el);

    if (this.parentEl) {
      const key = `${this.path}.children[${this.childNodes.length - 1}]`;
      this.pageInst.setData({
        [key]: el.value
      });
    }
  }

  setAttribute() {
    
  }
}

class WordsElement extends Node {
  get value() {
    return {
      type: this.type,
      children: this.text
    };
  }

  constructor(pageInst, text) {
    super(pageInst)
    this.type = 'words';
    this.text = text;
  }
}

class ViewElement extends Node {
  constructor(pageInst) {
    super(pageInst)
    this.type = 'view';
  }

  set textContent(text) {
    this._replaceAll(new WordsElement(this.pageInst, text))
  }
}

class InputElement extends Node {
  constructor(pageInst) {
    super(pageInst)
    this.type = 'input';
  }
}

class Document {
  path = 'root'

  childNodes = []

  constructor(pageInst) {
    this.pageInst = pageInst
  }

  createElement(name) {
    if (name === 'view') {
      return new ViewElement(this.pageInst);
    } else if (name === 'input') {
      this.tempInput = new InputElement(this.pageInst)
      return this.tempInput
    }
    throw new Error(`not support element type: ${name}`);
  }

  createTextNode(text) {
    return new WordsElement(this.pageInst, text);
  }

  appendChild(el) {
    el.parentEl = this;
    this.childNodes.push(el);

    this.pageInst.setData({
      [`${this.path}.children[${this.childNodes.length - 1}]`]: el.value
    });
  }

  getElementById(id) {
    return this.tempInput;
  }
}

export default function createDocument(pageInst) {
  return new Document(pageInst)
}
