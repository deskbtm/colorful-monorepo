# Colorful Monorepo

 <a href="https://github.com/deskbtm/colorful-monorepo/issues">
      <img src="https://img.shields.io/bitbucket/issues/deskbtm/colorful-monorepo?style=flat" alt="chat on Discord">
</a>

这个插件不是免费的，请看 [价格](#价格)。当然这是自愿的。

`Colorful Monorepo` 可以在一定程度上帮助你提高 Monorepo 项目的开发效率。

## 使用

### Workspace

支持 `npm`,`yarn`, `pnpm`, `lerna`, `rush`。
![png1](https://s2.loli.net/2022/05/16/PV1iEJAOf3KS8yC.gif)
当然也可以右击`Monorepo: As Workspace`手动添加，不包含`package.json`的文件夹。

### Drawer

保证在多个 Workspace 或具有较多配置的情况下，让工作台有一个清爽的展示，让你更加专注业务代码的开发。

你可以通过`Monorepo: Move to drawer(Glob)`将文件添加到 Drawer，支持多选。这里要注意下，添加的文件会会对项目中所有同名文件生效。

在 Drawer 中通过`Move out`将文件移出，同样支持多选。

<a href="https://sm.ms/image/6aqes9G8UjCbK4z" target="_blank"><img width="300" src="https://s2.loli.net/2022/05/16/6aqes9G8UjCbK4z.gif" ></a>

**注意 出于对性能的考虑 drawer 中会显示所有的文件夹**

在初次打开的项目中本插件会提示你添加默认隐藏的文件。

<a href="https://sm.ms/image/7UVxQepwirJk9tW" target="_blank"><img width="300" src="https://s2.loli.net/2022/05/16/7UVxQepwirJk9tW.png" ></a>

如果遇到问题可以点击 Drawer 视图右上角的编辑 Workspace File 按钮, 手动修复。

### Colorize

Colorful Monorepo 会将每个 Workspace 的文件归类， 并在底部的状态栏通过不同的颜色表现出来。

### 配置

```json
"ColorfulMonorepo.workspaces.prefix.root": {
  "type": "string",
  "default": "🌱 ",
  "description": "Folder prefix for the root folder"
},
"ColorfulMonorepo.workspaces.custom": {
  "type": "array",
  "default": [],
  "description": "Custom workspace prefix icon e.g [{regex:'foo', prefix:'🥳 '}, {regex:'bar', prefix:' 🖖🏻'}]"
},
"ColorfulMonorepo.colorize.enabled": {
  "type": "boolean",
  "default": true,
  "description": "The files dose not change frequently will move to Drawer"
},
// 实验性功能
"ColorfulMonorepo.arrange.enabled": {
  "type": "boolean",
  "default": false,
  "description": "Enable auto arrange the editor by workspace"
},
"ColorfulMonorepo.drawer.exclude": {
  "type": "object",
  "default": {
    "**/.git": true,
    "**/.gitignore": true,
    "**/.gitattributes": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/Thumbs.db": true,
    "**/.editorconfig": true,
    "**/.github": true,
    "**/.yarn": true,
    "**/.prettierrc": true,
    "**/.eslintrc*": true,
    "**/LICENSE": true,
    "**/.eslintignore": true,
    "**/node_modules": true,
    "**/tsconfig.json": true,
    "**/jsconfig.json": true,
    "**/package.json": true,
    "**/.vscode": true,
    "**/.next": true,
    "**/.gitmodules": true,
    "**/.yarnrc*": true,
    "**/.babelrc*": true,
    "**/.npmrc": true,
    "**/README.*": true,
    "**/dist": true,
    "**/build": true,
    "**/yarn.lock": true,
    "**/pnpm-lock.yaml": true,
    "**/package-lock.json": true
  },
  "description": "Default exclude files"
}

```

## License

Colorful Monorepo is available under the [AGPL license](https://github.com/deskbtm/colorful-monorepo/blob/main/LICENSE).

## Credits

https://github.com/microsoft/workspace-tools MIT license

## 下一步

自动编排窗口功能。

## 价格

如果你获得了一个良好的体验请支付 3 ￥, 本插件会持续迭代。

## My other extensions

[android-adb-wlan](https://marketplace.visualstudio.com/items?itemName=HanWang.android-adb-wlan)

**Enjoy !** 🖖

<div>
<a href="https://www.buymeacoffee.com/Nawbc">
  <img src="https://s2.loli.net/2022/04/15/54EHkb2fCrBoFua.png" width="175"/>
</a>
<img width="170" src="https://s2.loli.net/2022/05/16/ikM3QeuOAWaP4dR.jpg">
</div>
