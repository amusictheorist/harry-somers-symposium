module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src');
  eleventyConfig.addPassthroughCopy('public');

  return {
    dir: {
      input: '.',
      includes: '_includes',
      output: '_site'
    }
  };
};