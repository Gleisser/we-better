module.exports = {
  multipass: true, // multiple passes to optimize SVG
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false, // don't remove the viewBox attribute
          removeTitle: false, // keep the title element
          // customize other optimization options
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
