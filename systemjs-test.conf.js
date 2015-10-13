System.config({
  traceurOptions: {
    modules: "register",
    script: false,
    types: true,
    symbols: true,
    annotations: true,
    memberVariables: true,
    sourceMaps: "file"
  },
  babelOptions: {
    sourceMaps: true,
    stage: 0
  },
  map: {
    a1atscript: "node_modules/a1atscript/dist/a1atscript.js",
    "xing-inflector": "node_modules/xing-inflector/dist/xing-inflector.js"
  }
});
