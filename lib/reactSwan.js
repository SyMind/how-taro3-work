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
        const domElement = rootContainerInstance.createElement(type);
        Object.keys(newProps).forEach(propName => {
        const propValue = newProps[propName];
        if (propName === 'children') {
            if (typeof propValue === 'string' || typeof propValue === 'number') {
            domElement.textContent = propValue;
            }
        } else if (propName === 'onClick') {
            domElement.addEventListener('click', propValue);
        } else if (propName === 'onInput') {
            domElement.addEventListener('input', propValue);
        } else if (propName === 'className') {
            domElement.setAttribute('class', propValue);
        } else {
            const propValue = newProps[propName];
            domElement.setAttribute(propName, propValue);
        }
        });
        return domElement;
    },
    createTextInstance: (text, rootContainer) => {
        return rootContainer.createTextNode(text);
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
    clearContainer: () => {},
    preparePortalMount: () => {}
};

const ReactReconcilerInst = ReactReconciler(hostConfig);

let appContainer = null;

const ReactSwan = {
  render(appElement, callback) {
    if (!appContainer) {
        appContainer = ReactReconcilerInst.createContainer(null, false);
    }
    return ReactReconcilerInst.updateContainer(appElement, appContainer, null, callback);
  },
  createPage(children, container, key) {
    return ReactReconcilerInst.createPortal(children, container, null, key);
  }
};

export default ReactSwan;
