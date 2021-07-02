class Node {
  childNodes = []

  constructor(pageInst) {
    this.pageInst = pageInst;
  }

  get value() {
    return {
      type: this.type,
      children: this.childNodes.map(child => child.value)
    };
  }

  appendChild(el) {
    el.parentEl = this;
    this.childNodes.push(el);

    if (this.parentEl) {
      this.pageInst.setData({
        key: `${this.parentEl.path}[${this.childNodes.length - 1}]`,
        value: el.value
      });
    }
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
    this.appendChild(new WordsElement(this.pageInst, text))
  }
}

class Document {
  path = 'root'

  childNodes = []

  constructor(pageInst) {
    this.pageInst = pageInst
  }

  createElement(localName) {
    if (localName === 'view') {
      return new ViewElement(this.pageInst);
    }
    throw new Error(`not support element type: ${localName}`);
  }

  createTextNode(text) {
    return new WordsElement(this.pageInst, text);
  }

  appendChild(el) {
    el.parentEl = this;
    this.childNodes.push(el);

    this.pageInst.setData({
      [`${this.path}[${this.childNodes.length - 1}]`]: el.value
    });
  }
}

export default function createDocument(pageInst) {
  return new Document(pageInst)
}
