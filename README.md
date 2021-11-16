# taro3 的内部工作原理

## 介绍

这是试图能够带领你深入了解 taro3 内部工作原理的文章，该文章分为三个部分：

* Part I - 介绍 React reconciler 并使用它实现一个用于浏览器环境的 React 自定义渲染器。
* Part II - 在小程序环境中实现 DOM API 并基于它创建用于小程序环境的 React 自定义渲染器。
* Part III - 使用 webpack 对项目进行打包以产出结构完整的小程序项目。
