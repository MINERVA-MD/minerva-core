module.exports = async function () {
  return {
    directories: {
      output: 'dist',
      buildResources: 'resources',
    },
    files: ['out/**'],
    linux: {
      target: 'deb',
    },
  };
};
