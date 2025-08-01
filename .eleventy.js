module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src');

  return {
    dir: {
      input: '.',
      includes: '_includes',
      output: '_site'
    }
  };
};