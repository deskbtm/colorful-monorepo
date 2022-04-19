const minimatch = require("minimatch");
const micromatch = require("micromatch");

const r = minimatch(
  "C:\\Users\\Nawb\\Desktop\\Workspace\\colorful-monorepo\\node_modules",
  "{**/.git,**/.svn,**/.hg,**/CVS,**/.DS_Store,**/Thumbs.db,**/node_modules,**/node_modules/*,**/.eslintignore,**/.editorconfig,**/.gitignore,**/.gitattributes,**/.github,**/.vscode,**/.yarn,**/.prettierrc,**/.eslintrc.js,**/key}",
  {
    dot: true,
    matchBase: true,
  }
);
console.log(r);

console.log(
  micromatch.isMatch(
    "C:\\Users\\Nawb\\Desktop\\Workspace\\colorful-monorepo\\node_modules\\@babel",
    [
      "**/.git",
      "**/.svn",
      "**/.hg",
      "**/CVS",
      "**/.DS_Store",
      "**/Thumbs.db",
      "**/node_modules/*",
      "**/node_modules",
      "**/.eslintignore",
      "**/.editorconfig",
      "**/.gitignore",
    ]
  )
);

console.log(
  micromatch.isMatch(
    "C:\\Users\\Nawb\\Desktop\\Workspace\\colorful-monorepo\\node_modules\\@babel\\demo",
    [
      "**/.git",
      "**/.svn",
      "**/.hg",
      "**/CVS",
      "**/.DS_Store",
      "**/Thumbs.db",
      "**/node_modules/**/*",
      "**/node_modules",
      "**/.eslintignore",
      "**/.editorconfig",
      "**/.gitignore",
    ],
    {
      ignore: [
        // "C:\\Users\\Nawb\\Desktop\\Workspace\\colorful-monorepo\\node_modules\\@babel",
      ],
    }
  )
);
