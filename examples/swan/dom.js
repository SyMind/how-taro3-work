class Node {
    nodes = []

    constructor(instance) {
        this.instance = instance;
    }

    get value() {
        return {
            type: this.type,
            children: this.nodes.map(child => child.value)
        };
    }

    appendChild(el) {
        el.parentEl = this;
        this.nodes.push(el);

        if (this.parentEl) {
            this.instance.setData({
                key: `${this.parentEl.path}[${this.nodes.length - 1}]`,
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

    constructor(instance, text) {
        super(instance)
        this.type = 'words';
        this.text = text;
    }
}

class ViewElement extends Node {
    constructor(instance) {
        super(instance)
        this.type = 'view';
    }
}

class Document {
    path = 'root'

    nodes = []

    constructor(instance) {
        this.instance = instance
    }

    createElement(localName) {
        if (localName === 'view') {
            return new ViewElement(this.instance);
        }
        throw new Error('not support element type');
    }

    createTextNode(text) {
        return new WordsElement(this.instance, text);
    }

    appendChild(el) {
        el.parentEl = this;
        this.nodes.push(el);

        this.instance.setData({
            [`${this.path}[${this.nodes.length - 1}]`]: el.value
        });
    }
}

export default function createDocument(instance) {
    return new Document(instance)
}
