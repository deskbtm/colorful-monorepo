const glob = require("glob");

glob(
  "**/*.{js,ts}",
  {
    // ignore: [
    //   "**/dist/*/**",
    //   "**/build/*/**",
    //   "**/node_modules/*/**",
    //   "**/.git/objects/**",
    //   "**/.git/subtree-cache/**",
    //   "**/.hg/store/**",
    // ],
  },
  (e, r) => {
    console.log(r);
  }
);
