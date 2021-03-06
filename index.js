'use strict';

const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: 'ember-angle-bracket-invocation-polyfill',

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this.project);
    let emberVersion = checker.forEmber();

    this.shouldPolyfill = emberVersion.lt('3.4.0-alpha.1');

    let parentChecker = new VersionChecker(this.parent);
    let precompileVersion = parentChecker.for('ember-cli-htmlbars-inline-precompile');

    if (precompileVersion.exists() && precompileVersion.lt('1.0.3')) {
      this.ui.writeWarnLine(
        'Detected a version of ember-cli-htmlbars-inline-precompile that does not' +
          ' support angle bracket invocation, please update to at least 1.0.3.'
      );
    }
  },

  setupPreprocessorRegistry(type, registry) {
    if (this.shouldPolyfill) {
      registry.add('htmlbars-ast-plugin', {
        name: 'component-attributes',
        plugin: require('./lib/ast-transform'),
        baseDir() {
          return __dirname;
        },
      });
    }
  },

  included() {
    this._super.included.apply(this, arguments);

    if (!this.shouldPolyfill) {
      return;
    }

    this.import('vendor/angle-bracket-invocation-polyfill/runtime-polyfill.js');
  },

  treeForVendor(rawVendorTree) {
    if (!this.shouldPolyfill) {
      return;
    }

    let babelAddon = this.addons.find(addon => addon.name === 'ember-cli-babel');

    let transpiledVendorTree = babelAddon.transpileTree(rawVendorTree, {
      babel: this.options.babel,

      'ember-cli-babel': {
        compileModules: false,
      },
    });

    return transpiledVendorTree;
  },
};
