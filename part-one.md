# Part-I

这是文章的第一部分，我们将以 taro3 的自定义 React 渲染为起点。先介绍 [`react-reconciler`](https://github.com/facebook/react/tree/master/packages/react-reconciler) 包，然后去看 taro3 是如何使用这个库来创建自己的自定义渲染器，来将组件渲染到小程序中。

当我们初次遇到 React 时，它是作为一个用于构建用户界面的 JavaScript 库被引入的。当你深入研究其内部原理后，很快便发现它不仅适用于 Web 应用，还适用于 iOS 和 Android 等。事实上，任何支持绘图的系统都可以作为 React 的渲染目标。

![react-blocks](./images/react-blocks.png)

React 中有3个基本块。

1. React Component API：提供组件 API 和生命周期。
2. React-Reconciler：它是核心 diff 算法，管理声明式 UI 背后的命令式更新。Reconciler 找出应用程序 UI 在不同状态之间的变化并在幕后应用这些变化。
3. React Renderer：渲染器不过是实现了一些 react-reconciler 所需要的函数。react-reconciler 将根据需要调用这些函数，以对最终目标更新变化。如果使用 DOM API 实现这些函数，则目标是 Web 应用。如果你使用 iOS UI Kit API 实现这些函数，目标是 iOS。如果使用 Android UI API 实现这些函数，则目标是 Android。

我们可以从 [`react-reconciler`](https://github.com/facebook/react/tree/master/packages/react-reconciler) 的文档中了解到它的基本使用。

```javascript
const Reconciler = require('react-reconciler');

const HostConfig = {
  // 您在这里需要实现一些方法。
  // 以下有更多信息和示例。
};

const MyRenderer = Reconciler(HostConfig);

const RendererPublicAPI = {
  render(element, container, callback) {
    // 调用 MyRenderer.updateContainer() 来调度根节点上的更改。
    // 请参阅 ReactDOM、React Native 或 React ART 实际案例。
  }
};
```

您需要实现 `HostConfig` 对象，它描述了如何在目标环境（例如 DOM、canvas、控制台或任何您的渲染目标）中处理一些事情。它看起来是这样的：

```javascript
const HostConfig = {
  createInstance(type, props) {
    // 例如，DOM 渲染器返回一个 DOM 节点
  },
  // ...
  supportsMutation: true, // it works by mutating nodes
  appendChild(parent, child) {
    // 例如，DOM 渲染器将调用  .appendChild() 方法
  },
  // ...
};
```

现在，我们对 `react-reconciler` 有了一个基本的认识，实现一个 React 的自定义渲染器，其实就是实现 `HostConfig` 中的一些方法。让我们看看 taro3 实现的 `HostConfig` 对象，taro3 用于小程序的自定义渲染器位于 `@tarojs/react` 中，以下为其 `HostConfig` 部分代码：

```typescript
const HostConfig = {
  // 这个方法应该返回一个新创建的节点。例如，DOM 渲染器会在这里调用 document.createElement(type)，然后从 props 设置属性。
  createInstance(type) {
    return document.createElement(type)
  },
  // 与 `createInstance` 相同，但是用于文本节点。如果您的渲染器不支持文本节点，您可以在这里抛出异常。
  createTextInstance(text) {
    return document.createTextNode(text)
  },
  // 这个方法应该改变父实例，并将子对象添加到它的子对象列表中。例如，在 DOM 中，这将调用 `parentInstance.appendChild(child)` 方法。
  // 这个方法发生在渲染阶段。它可以修改父实例和子对象，但不能修改任何其他节点。它是在树还在构建时调用的，并没有渲染到屏幕上的实际树。
  appendInitialChild(parent, child) {
    parent.appendChild(child)
  },
  // 这个方法应该改变父实例，并从它的子对象列表中删除子对象。
  removeChild(parent, child) {
    parent.removeChild(child)
  },
  // 这个方法应该改变文本实例并将其文本内容更新为 `nextText`。这里的文本实例是由 `createTextInstance` 方法创建的节点。
  commitTextUpdate(textInst, oldText, nextText) {
    textInst.nodeValue = newText
  }
}
```

我想你们可能会有这样的疑问，小程序中哪里来的 `document` 对象，这不是浏览器的 DOM API 么？

是的，小程序环境并不对外提供 DOM API，而 taro3 是自己在小程序环境中实现了一套类 DOM API，其位于 `@tarojs/runtime` 中。这不是本节的内容，我会在下一节中详细讲述。

```typescript
import { document } from '@tarojs/runtime'
```

现在，不必关心 taro3 是如何在小程序环境中实现了 `document` 对象，我们直接将其替换为浏览器的 DOM API，就是一个极简的 `ReactDOM` 渲染器了。

具体的示例位于 `examples/sample-custom-renderer-to-dom` 目录中，该示例使用 [`create-react-app`](https://github.com/facebook/create-react-app) 创建，然后将其中的 `ReactDOM` 替换为由我们自己实现的 `ReactDOMMini`。

[跳转到 Part-II](./part-two.md)
