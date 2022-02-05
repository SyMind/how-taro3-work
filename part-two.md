# 第二部分

在上一部分，我们通过 React Reconciler 实现了一个用于浏览器环境的自定义渲染器。在该部分，我们将创建一个用于小程序环境的自定义渲染器，让我们开始吧！

## 小程序与浏览器区别

与浏览器不同。小程序使用了双线程模型，包括逻辑层和渲染层。逻辑层执行 JavaSript 代码，控制小程序数据的生成和处理；渲染层执行使用小程序提供的视图层描述语言（如百度智能小程的 SWAN 模板），处理页面的渲染和用户的事件交互行为。

小程序逻辑层并没有一个完整的浏览器对象，因而缺少相关的 DOM API。无法使用 JavaScript 操作页面节点，就无法提供 `host config` 给 React Reconciler 实现自定义渲染器，这是我们第一个需要解决的问题。

## 用 JavaScript 来操作小程序页面中的节点

Taro3 使用这样的思路来解决这个问题。首先，在逻辑层维护一个描述整个页面的节点树信息。其次，在视图层使用小程序提供的描述语言，根据逻辑层传来的节点树信息，通过一系列的递归操作来渲染出视图。

注意，在以下的例子，都只考虑小程序的 `view` 和 `input` 标签。

### 在逻辑层维护节点树信息

为了在逻辑层维护节点树信息，我们需要先确定使用的数据结构：

```typescript
interface Node {
  uid: string;
  nodeName: 'view' | 'input' | '#text';
  class?: string;
  childNodes?: Node[] | string;
}
```

让我们来关注一下该结构中各个属性：

**`uid`**

节点的唯一标识。

**`nodeName`**

节点名，在我们例子中其值为 `view`、`input` 或 `#text`。其中 `#text` 标识文本节点，请注意其和 `text` 标签的区别！

**`class`**

节点类名。

**`childNodes`**

子节点。nodeName 为 view 时，childNodes 是一个包含其它节点的数组。nodeName 为 text 时，childNodes 是一段字符串。

确定了数据结构之后，如果我们要渲染如下视图，

```xml
<view>
  请输入：<input />
</view>
```

则逻辑层维护的节点树信息为：

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

在小程序中用 `Page` 函数来注册一个页面，它接受一个 object 参数，其指定页面的初始数据、生命周期函数、事件处理函数等。我们可以在 `onLoad` 页面加载的这个生命周期中，通过 `setData` 方法将节点树信息从逻辑层发送给视图层。

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

注意，上述代码的初始数据中定义了一个 `root` 属性，`onLoad` 生命周期中将节点树信息赋给了 `root.childNodes`。其目的有二，一是为了方便接下来的视图层进行遍历，二是为了与 Taro3 中定义的数据结构保持一致。

### 在视图层中对节点树信息进行渲染

在视图层中，我们将用小程序自己的视图层描述语言根据逻辑层传来的节点树信息来渲染小程序的标签。渲染过程本质上是对节点树信息进行深度优先遍历，根据 `nodeName` 属性渲染出相应的标签，并添加上其余属性。

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

### 抽象！抽象！抽象！

在此基础上封装用于小程序的 DOM API.

```typescript
class Document {
  private path = 'root'
  childNodes: Node[] = []
  createElement(name: string): Node
  createTextNode(text: string): TextElement
  appendChild(el: Node): void
  getElementById(id: string): void
}
```
