'use strict';

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _glob = require('glob');

var _mkdirp = require('mkdirp');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ReactIntlAggregatePlugin(plugin_options) {
  this.plugin_options = plugin_options;
}

ReactIntlAggregatePlugin.prototype.apply = function (compiler) {
  var messagesPattern = this.plugin_options.messagesPattern || '../../i18n/messages/**/*.json';
  var aggregateOutputDir = this.plugin_options.aggregateOutputDir || '../../i18n/aggregate/';
  var aggregateFilename = this.plugin_options.aggregateFilename || 'en-US';
  var compress = this.plugin_options.compress || true;

  compiler.plugin('emit', function (compilation, callback) {
    var MESSAGES_PATTERN = path.resolve(__dirname, messagesPattern);
    var AGGREGATE_DIR = path.resolve(__dirname, aggregateOutputDir);
    var AGGREGATE_FILE = path.resolve(AGGREGATE_DIR, aggregateFilename + '.json');

    console.log('Messages pattern: ' + MESSAGES_PATTERN);
    console.log('Aggregate dir: ' + AGGREGATE_DIR);
    var defaultMessages = (0, _glob.sync)(MESSAGES_PATTERN).map(function (filename) {
      return fs.readFileSync(filename, 'utf8');
    }).map(function (file) {
      return JSON.parse(file);
    }).reduce(function (collection, descriptors) {
      descriptors.forEach(function (_ref) {
        var id = _ref.id,
            defaultMessage = _ref.defaultMessage,
            description = _ref.description;

        if (!compress) {
          if (collection.hasOwnProperty(id) && collection[id].defaultMessage) {
            throw new Error('Duplicate message id: ' + id);
          }

          collection[id] = {};
          collection[id]["message"] = defaultMessage;
          if (description) {
            collection[id].description = description;
          }
        } else if (defaultMessage) {
          collection[id] = defaultMessage;
        }
      });
      return collection;
    }, {});

    console.log('Creating directory: ' + AGGREGATE_DIR);
    (0, _mkdirp.sync)(AGGREGATE_DIR);
    console.log('Writing file: ' + AGGREGATE_FILE + ' with ' + Object.keys(defaultMessages).length + ' keys');
    var aggregateTranslations = JSON.stringify(defaultMessages, null, 2);
    fs.writeFileSync(AGGREGATE_FILE, aggregateTranslations);
    console.log('Aggregating translations JSON complete!');
    callback();
  });
};

module.exports = ReactIntlAggregatePlugin;