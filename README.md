[中文](https://github.com/deskbtm/colorful-monorepo/blob/main/README-zh.md)

<sup>Doc partially translated by deepl</sup>

# Colorful Monorepo

This extension is not free. See [pricing](#pricing). Off cause, it's optional.

`Colorful Monorepo` can help you to improve the development efficiency of your Monorepo project to some extent.

## Usage

### Workspace

Support `npm`,`yarn`, `pnpm`, `lerna`, `rush`.
![png1](./assets/Peek%202022-05-03%2021-16.gif)
You can also add the folder manually that not includes `package.json` by `Monorepo: As Workspace`.

### Drawer

Drawer ensures a crisp presentation of the workbench in the case of multiple Workspaces or with a large number of configurations, allowing you to focus more on the development of business code.

You can add files to the Drawer with `Monorepo: Move to drawer(Glob)`, which supports multiple selections. Note that the added file will take effect on all files of the same name in the project.

<img width="300" src="./assets/Peek 2022-05-15 18-07.gif"/>

**For performance reasons, all folders are displayed in the drawer**

Prompt you to add the default hidden files in first time.

<img width="300" src="./assets/Screenshot%20from%202022-05-15%2017-35-25.png"/>

You can click the `Edit Workspace File` button in DrawerView to fix errors.

### Colorize

Colorful Monorepo categorizes the files in each Workspace and displays them in a different color in the status bar at the bottom.

### Configuration

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
// Experiment
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

To improve the performance, the drawer will show all directories, even if it is not in `files.exclude`.

## Credits

https://github.com/microsoft/workspace-tools MIT license

### What's Next

Auto arrange.

## Pricing

If you have a wonderful experience, don't forgot to buy me a coffee.

**Enjoy !** 🖖

<div>
<a href="https://www.buymeacoffee.com/Nawbc">
  <img src="https://s2.loli.net/2022/04/15/54EHkb2fCrBoFua.png" width="175"/>
</a>
<img width="170" src="https://s2.loli.net/2022/04/24/f1AajJXNVzI4mLR.jpg">
</div>
