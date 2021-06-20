import React, { useState, createRef, useImperativeHandle } from 'react'
import ReactSwan from './reactSwan'
import createDocument from './dom'

const appInst = createRef()

export function createSwanApp(App) {
  const appElement = createRef();

  const Root = React.forwardRef(
    (props, ref) => {
      const [pages, setPages] = useState([]);

      useImperativeHandle(ref, () => ({
        renderPage(pageInst) {
          setPages([...pages, pageInst])
        },
        unmountPage(pageInst) {
          setPages(pages.filter(page => page !== pageInst))
        }
      }), []);

      return React.createElement(
        App,
        {
          ref: appElement
        },
        pages.length > 0 ? pages[pages.length - 1] : null
      );
    }
  );

  const rootElement = React.createElement(Root, {
    ref: appInst
  });
  ReactSwan.render(rootElement);

  return {
    onLaunch(options) {
      appElement.current?.onLaunch(options)
    },
    onShow(options) {
      appElement.current?.onShow(options)
    },
    onHide() {
      appElement.current?.onHide(options)
    }
  }
}

export function createSwanPage(Page) {
  if (!appInst.current) {
    return null
  }

  const pageElement = React.createElement(Page);

  return {
    data: {
      root: []
    },
    onInit() {
      pageElement.onInit?.();

      const pageInst = ReactSwan.createPage(pageElement, createDocument(this))
      appInst.current.renderPage(pageInst)
    },
    onLoad() {
      pageElement.onLoad?.()
    },
    onReady() {
      pageElement.onReady?.()
    },
    onShow() {
      pageElement.onShow?.()
    },
    onHide() {
      pageElement.onHide?.()
    },
    onUnload() {
      appInst.current.unmountPage(pageInst)
    }
  };
}
