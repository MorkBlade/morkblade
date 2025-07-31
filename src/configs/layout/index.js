
const files = import.meta.glob('./modules/*.json', { eager: true });

const modules = {};

const keys = Object.keys(files);
keys.forEach((key) => {
  const fileName = key.replace(/^\.\/modules\/(.*)\.\w+$/, '$1');
  modules[fileName] = files[key].default;
});

export default modules;
