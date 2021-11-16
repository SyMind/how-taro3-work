# Part-II

在上一节中，我们介绍了 React reconciler 并实现了一个极简的 React 自定义渲染器。

在本节中我们将参照 taro3 的实现，先在小程序环境中实现一套精简的 DOM API，然后再依赖它实现一个用于渲染小程序的 React 自定义渲染器。在我们的这个例子中，只考虑小程序 `view` 和 `text` 标签。

## 在逻辑层中维护节点树数据

整个小程序框架分为两部分：逻辑层（App Service）和 视图层（View）。我们无法在逻辑层使用 JavaScript 直接操作视图层的节点，只能使用小程序提供的视图层描述语言（如百度智能小程的 SWAN 模板）来构建视图。

为了能逻辑层使用 JavaScript 来操作视图层的节点，taro3 在逻辑层中维护用于渲染页面或组件的节点树数据，然后通过小程序的 `setData` 方法将数据从逻辑层发送至视图层，最终用小程序的视图层描述语言编写的逻辑来渲染出最终的视图。

> 在一个 taro3 项目中使用 `taro build` 命令生成小程序端的代码后，在产出目录下的 `taro.js` 文件中搜索 `setData` 方法，打印它的 `data` 参数，你会看到形如下方结构的数据，这就是 taro3 在逻辑层中维护的节点树数据。
> ```javascript
> {
>   root: { // 根节点
>     cn: [ // 子节点数组 Childnodes
>       {
>         cl: '', // 类名 class
>         cn: [], // 子节点数组 Childnodes
>         nn: '', // 节点名 NodeName
>         uid: '' // 节点唯一标识
>       }
>     ]
>   }
> }
> ```
> 具体的数据结构定义位于 taro3 的 `@tarojs/runtime` 包中。

我们将节点树定义为如下的结构。

```typescript
interface MPNode {
  uid: string;
  type: 'view' | 'input' | 'words';
  class?: string;
  style?: string;
  children: MPNode[] | string;
}
```

## 在视图层中对节点树信息进行渲染

确定了维护在逻辑层节点树的数据结构后，当要渲染如下这个视图时，对应的逻辑层节点树信息也可以被我们确定了。

```xml
<view>
  输入：<input />
</view>
```

在逻辑层小程序页面使用 `Page` 方法，来进行页面的逻辑管理，其中 `data` 参数指定页面的初始数据，我们在此初始化节点树信息，如下所示。

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

现在让我们来关注视图层，用小程序自己的视图层描述语言将在逻辑层初始化的节点树信息渲染为小程序的节点。渲染过程本质上是从 `root` 开始，对节点树信息进行深度优先遍历，代码如下：

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
  getElementById(id: string): void
}
```
