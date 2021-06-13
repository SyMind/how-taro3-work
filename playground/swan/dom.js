const {nextUid} = new class {
    uid = 0
    nextUid = () => this.uid++
}

class Node {
    set textContent(text) {
        const words = new WordsNode(text);
        words.parentNode = this;
        this.appendChild(words);
    }

    insertBefore() {

    }

    appendChild(node) {
        this.mNode.children.push(node.mNode);
    }

    replaceChild() {

    }

    removeChild() {

    }
}

class WordsNode extends Node {
    constructor(words) {
        super()

        this.mNode = {
            uid: nextUid(),
            type: 'words',
            children: words
        }
    }
}

class ViewNode extends Node {
    constructor() {
        super()

        this.mNode = {
            uid: nextUid(),
            type: 'view',
            children: []
        }
    }
}

// https://dom.spec.whatwg.org/#document-trees
class Document extends Node {
    constructor(instance) {
        super()
        this.parentNode = null
        this.instance = instance
    }

    createElement(localName) {
        let node;
        switch (localName) {
            case 'view':
                node = new ViewNode(this);
                break;
            default:
                break;
        }

        node.parentNode = this;
        return node;
    }

    appendChild(node) {
        const root = [...this.instance.data.root];
        root.push(node.mNode)
        this.instance.setData({root})
    }
}

export default function createDocument(instance) {
    return new Document(instance)
}
