# Part-II

在上一节中，我们提到了 taro3 是自己在小程序环境中实现了一套类 DOM API，然后依赖它来实现了用于小程序的 React 自定义渲染器。

在本节中我们就先在小程序的基础上实现一套极简的 DOM API，然后依赖它实现一个用于小程序的 React 自定义渲染器。对于我们的例子，将只考虑小程序的 `view` 和 `text` 标签。

为了可以使用 JavaScript 来控制小程序的节点渲染，taro3 的解决方案是将节点树信息存放到小程序页面的 data 中，在小程序模板中使用 template 标签来递归地将 data 中描述的节点渲染出来。

taro3 在 @tarojs/runtime 包中，定义了节点树的数据结构，如下：

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

其中的部分属性键值使用 Shortcuts 枚举，是为了减小生成的小程序模板体积和 setData 的数据大小，在之后我们编写小程序模板来渲染节点树数据时您就会明白。

小程序将数据从逻辑层发送至视图层，总是需要调用 `setData` API 的。当我们使用 Taro 的 `build` 命令将 Taro 代码编译为小程序端的代码时，在产出目录下的 `taro.js` 文件中搜索 `setData` API，并使用 console.log 在方法调用前将 data 变量打印出来，您会看到如下的数据：

```javascript
{
  'root.cn.0': {
    cl: '',
    cn: [],
    nn: '',
    uid: ''
  }
}
```

我们的实现不考虑生成模板的体积，现在让我们自己来定义一下节点树的类型定义：

```typescript
interface MiniElementData {
  uid: string;
  childNodes: MiniData[] | string;
  nodeName: string;
  class?: string;
  style?: string;
}
```

```javascript
Page({
  data: {
    root: {
      children: []
    }
  }
})
```
