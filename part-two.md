# Part-II

在上一节中，我们介绍了 React reconciler 并实现了一个极简的 React 自定义渲染器。

在本节中我们将参考 taro3 的实现，先在在小程序环境中实现一套精简的 DOM API，然后再依赖它实现一个用于渲染小程序的 React 自定义渲染器。在我们的这个例子中，只考虑小程序 `view` 和 `text` 标签。

## 在逻辑层中维护 DOM 树信息

整个小程序框架系统分为两部分：逻辑层（App Service）和 视图层（View）。无法在逻辑层使用 JavaScript 来直接操作视图层的 DOM，为此小程序提供了自己的视图层描述语言，如百度智能小程的 SWAN 模板。

为了在逻辑层使用 JavaScript 来操作视图层的 DOM，taro3 在逻辑层中维护用于渲染页面或组件的 DOM 树信息，然后通过小程序的 `setData` 方法将 DOM 树信息从逻辑层发送至视图层，最终通过小程序的视图层描述语言编写的逻辑渲染出最终的视图。

> 我们在一个 taro3 项目中使用 `taro build` 命令生成小程序端的代码后，可以在产出目录下的 `taro.js` 文件中搜索 `setData` 方法，在其调用前使用 `console.log` 方法打印其 `data` 参数，你就会看到形如下方结构的数据，这就是 taro3 在逻辑层中维护的 DOM 树信息。
> ```javascript
> {
>   'root.cn.0': {
>     cl: '',
>     cn: [],
>     nn: '',
>     uid: ''
>   }
> }
> ```

taro3 在 @tarojs/runtime 包中定义了 DOM 树具体的数据结构，如下所示。

```typescript
interface MiniElementData {
  uid: string
  [Shortcuts.Childnodes]: MiniData[]
  [Shortcuts.NodeName]: string
  [Shortcuts.Class]?: string
  [Shortcuts.Style]?: string
  [key: string]: unknown
}

interface MiniTextData {
  [Shortcuts.Text]: string
  [Shortcuts.NodeName]: string
}

type MiniData = MiniElementData | MiniTextData
```

其中的部分属性键名使用 Shortcuts 枚举，是为了减小生成的小程序模板体积和调用 `setData` 方法传输数据的大小，在之后我们编写小程序模板来渲染 DOM 时你就会明白了。

为了简化问题，我们的实现不考虑前面所说的优化，数据结构简化为：

```typescript
interface MiniData {
  uid: string;
  childNodes: MiniData[] | string;
  nodeName: string;
  class?: string;
  style?: string;
}
```

## 在视图层中对 DOM 树信息进行渲染

确定了维护在逻辑层 DOM 树的数据结构后，当要渲染如下这个视图时，对应的逻辑层 DOM 树信息也可以被我们确定了。

```xml
<view>
  输入：<input />
</view>
```

在逻辑层小程序页面使用 `Page` 方法，来进行页面的逻辑管理，其中 `data` 参数指定页面的初始数据，我们在此初始化 DOM 树信息，如下所示。

```javascript
Page({
  data: {
    root: {
      children: [{
        type: 'view',
        children: [{
          type: 'words',
          children: '输入：'
        }, {
          type: 'input'
        }]
      }]
    }
  }
})
```

现在让我们来关注视图层，用小程序自己的视图层描述语言将在逻辑层初始化的 DOM 树信息渲染为小程序的节点。渲染过程本质上是从 `root` 开始，对 DOM 树信息进行深度优先遍历，代码如下：

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

到这里，视图层将完全按照逻辑层的 DOM 树信息进行渲染。

## 实现精简的 DOM API

```typescript
class Document {
  path = 'root'
  childNodes = []
  createElement(name: string): Node
  createTextNode(text: string): TextElement
  appendChild(el: Node): void
}
```
