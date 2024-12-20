module.exports = {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          removeTitle: false,
          cleanupIds: true,
          removeEmptyAttrs: true,
          removeEmptyContainers: true,
          mergePaths: true,
          removeUnusedNS: true,
          sortAttrs: true,
          removeUselessStrokeAndFill: true,
          removeUnknownsAndDefaults: true,
          removeNonInheritableGroupAttrs: true,
        },
      },
    },
  ],
};
