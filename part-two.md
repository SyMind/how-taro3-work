# 第二部分

在上一部分，我们通过 `react-reconciler` 实现了一个用于浏览器环境的自定义渲染器。在该部分，我们来创建一个用于小程序环境的自定义渲染器，让我们开始吧！

## 小程序与浏览器区别

与浏览器不同。小程序使用了双线程模型，包括逻辑层和渲染层。逻辑层执行 JavaSript 代码，控制小程序数据的生成和处理；渲染层执行使用小程序提供的视图层描述语言（如百度智能小程的 SWAN 模板），处理页面的渲染和用户的事件交互行为。

小程序逻辑层并没有一个完整的浏览器对象，因而缺少相关的 DOM API。无法使用 JavaScript 操作页面节点，就无法提供 `host config` 给 React Reconciler 实现自定义渲染器，这是我们首先要解决的问题。

## 突破小程序的限制

Taro3 使用这样的思路来突破小程序的限制，让使用 JavaScript 来控制小程序节点成为可能。

首先，在逻辑层维护一个对象，它是一颗树，用于描述页面中所有目标节点的信息和层次结构，本文称其为`节点树`。然后，在视图层使用小程序提供的描述语言，将逻辑层传来的节点树，通过递归的方式来渲染出所有的节点。

> 为降低复杂性，以下示例均只考虑小程序的 `view` 和 `input` 标签。

### 在逻辑层维护节点树

我们将`节点树`的数据结构定义为，

```typescript
interface Node {
  /**
   * 节点唯一标识。
   */
  uid: string;

  /**
   * 节点名，在我们例子中其值为 `view`、`input` 或 `#text`。
   * 其中 `#text` 表示文本节点，请注意其和 `text` 标签的区别！
   */
  nodeName: 'view' | 'input' | '#text';
 
  /**
   * 节点类名。
   */
  class?: string;。

  /**
   * 子节点。
   * nodeName 为 view 时，childNodes 是一个包含其它节点的数组。
   * nodeName 为 text 时，childNodes 是一段字符串。
   */
  childNodes?: Node[] | string;
}
```

假如我们要渲染这样的一个视图，

```xml
<view>
  请输入：<input />
</view>
```

则逻辑层维护的节点树为：

```javascript
const nodes = [{
  uid: '_n_0',
  nodeName: 'view',
  childNodes: [{
    uid: '_n_1',
    nodeName: '#text',
    childNodes: '输入'
  }, {
    uid: '_n_2',
    nodeName: 'input'
  }]
}];
```

### 将节点树发送到视图层

在小程序中用 `Page` 函数来注册一个页面，它接受一个 object 参数，指定页面的初始数据、生命周期函数、事件处理函数等。我们可以在 `onLoad` 页面加载的这个生命周期中，通过 `setData` 方法将节点树信息从逻辑层发送给视图层。

```javascript
Page({
  data: {
    root: {
      childNodes: []
    }
  },
  onLoad() {
    this.setData({
      'root.childNodes': nodes
    });
  }
});
```

> 注意，页面初始数据中定义了一个 `root` 属性，并将节点树赋给了 `root.childNodes`，这样做的目的是为了方便接下来的视图层遍历操作。

### 在视图层中进行渲染

在视图层中，使用视图层描述语言来遍历节点树，渲染出最终的视图。渲染过程本质是从 `root` 层级开始进行深度优先遍历，根据 `nodeName` 属性来渲染出对应的标签，用其余属性来完善该标签。

```xml
<!-- 从 root 开始 -->
<template is="root" data="{{{ root }}}" />

<!-- 遍历 root 的 children，并根据 type 选择对应的模板进行渲染 -->
<template name="root">
  <block s-for="{{root.children}}" s-key="uid">
    <template is="{{item.type}}" data="{{{ el: item }}}" />
  </block>
</template>

<!-- type 为 view 时使用此模板进行渲染 -->
<template name="view">
  <!-- 渲染 view 标签 -->
  <view class="{{el.class}}" style="{{el.style}}">
    <!-- view 标签为视图容器，需重复遍历 children 的过程，并根据 type 选择对应的模板进行渲染 -->
    <block s-for="{{el.children}}" s-key="uid">
      <template is="{{item.type}}" data="{{{ el: item }}}" />
    </block>
  </view>
</template>

<!-- type 为 input 时使用此模板进行渲染 -->
<template name="input">
  <!-- 渲染 input 标签 -->
  <input value="{= el.value =}" bindinput="invokeEventListeners" />
</template>

<!-- type 为 words 时使用此模板进行渲染 -->
<template name="words">
  <!-- 渲染纯文本 -->
  {{ el.children }}
</template>
```

现在，视图层的渲染完全依赖逻辑层的`节点树`。这使得我们可以通过 JavaScript 调用小程序的 `setData` API 来修改`节点树`，进而控制视图层的渲染。

例如，当我们想在上述的视图末尾插入一个内容为“hello, world!”的 `view` 标签时，可以这样来做，

```javascript
this.setData({
  'root.childNodes[1]': {
    uid: '_n_3',
    nodeName: 'view',
    childNodes: [{
      uid: '_n_4',
      nodeName: '#text',
      childNodes: 'hello, world!'
    }]
  }
});
```

### 抽象！抽象！抽象！

为了让使用更加简便，可以参照我们所熟悉的浏览器 DOM API 将上述的操作进行抽象，来隐藏内部的具体实现。

```typescript
class Document {
  private path = 'root'
  childNodes: Node[] = []
  createElement(name: string): TaroElement
  createTextNode(text: string): TextElement
  appendChild(el: Node): void
  getElementById(id: string): void
}
```
