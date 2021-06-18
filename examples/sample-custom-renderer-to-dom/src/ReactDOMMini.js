import ReactReconciler from 'react-reconciler';

const rootHostContext = {};
const childHostContext = {};

const hostConfig = {
    now: Date.now,
    getRootHostContext: () => {
        return rootHostContext;
    },
    prepareForCommit: () => {},
    resetAfterCommit: () => {},
    getChildHostContext: () => {
        return childHostContext;
    },
    shouldSetTextContent: (type, props) => {
        return typeof props.children === 'string' || typeof props.children === 'number';
    },
    createInstance: (type, newProps, rootContainerInstance, _currentHostContext, workInProgress) => {
        const domElement = document.createElement(type);
        Object.keys(newProps).forEach(propName => {
        const propValue = newProps[propName];
        if (propName === 'children') {
            if (typeof propValue === 'string' || typeof propValue === 'number') {
            domElement.textContent = propValue;
            }
        } else if (propName === 'onClick') {
            domElement.addEventListener('click', propValue);
        } else if (propName === 'className') {
            domElement.setAttribute('class', propValue);
        } else {
            const propValue = newProps[propName];
            domElement.setAttribute(propName, propValue);
        }
        });
        return domElement;
    },
    createTextInstance: text => {
        return document.createTextNode(text);
    },
    appendInitialChild: (parent, child) => {
        parent.appendChild(child);
    },
    appendChild(parent, child) {
        parent.appendChild(child);
    },
    finalizeInitialChildren: () => {},
    supportsMutation: true,
    appendChildToContainer: (parent, child) => {
        parent.appendChild(child);
    },
    prepareUpdate(domElement, oldProps, newProps) {
        return true;
    },
    commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
        Object.keys(newProps).forEach(propName => {
            const propValue = newProps[propName];
            if (propName === 'children') {
                if (typeof propValue === 'string' || typeof propValue === 'number') {
                    domElement.textContent = propValue;
                }
            } else {
                const propValue = newProps[propName];
                domElement.setAttribute(propName, propValue);
            }
        });
    },
    commitTextUpdate(textInstance, oldText, newText) {
        textInstance.text = newText;
    },
    removeChild(parentInstance, child) {
        parentInstance.removeChild(child);
    },
    clearContainer: () => {}
};
const ReactReconcilerInst = ReactReconciler(hostConfig);

const ReactDOMMini = {
  render: (reactElement, domElement, callback) => {
    if (!domElement._rootContainer) {
      domElement._rootContainer = ReactReconcilerInst.createContainer(domElement, false);
    }

    return ReactReconcilerInst.updateContainer(reactElement, domElement._rootContainer, null, callback);
  }
};

export default ReactDOMMini;