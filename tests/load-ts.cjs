const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
module.exports = function load(relativePath, dependencies = {}) {
    const filename = path.resolve(relativePath);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const loadedModule = { exports: {} };
    const customRequire = (id) => {
        if (Object.hasOwn(dependencies, id)) return dependencies[id];
        if (id === 'server-only') return {};
        throw new Error('Unexpected dependency: ' + id);
    };
    new Function('require', 'module', 'exports', source)(customRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
};
