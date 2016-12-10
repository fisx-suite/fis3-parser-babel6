/**
 * @file fis3 babel6 parser 模块
 * @author sparklewhy@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var qrequire = require('qrequire');

/**
 * 读取 babel 配置
 *
 * @return {?Object}
 */
function readBabelConfig() {
    var _ = fis.util;
    var currDir = process.cwd();
    var babelRcFile = path.resolve(currDir, '.babelrc');
    if (_.isFile(babelRcFile)) {
        return JSON.parse(fs.readFileSync(babelRcFile, 'utf-8'));
    }

    var pkgMetaFile = path.resolve(currDir, 'package.json');
    if (_.isFile(pkgMetaFile)) {
        return require(pkgMetaFile).babel;
    }
}

/**
 * 使用 babel6 编译代码文件
 *
 * @param {string} content 代码内容
 * @param {Object} file 文件对象
 * @param {Object} conf 定制配置
 * @return {string}
 */
function compile(content, file, conf) {
    if (file.disableBabel) {
        return content;
    }

    // init options
    var _ = fis.util;
    var options = _.assign({
        filename: file.subpath.substr(1) // remove start slash
    }, readBabelConfig() || {}, conf);

    var parser = options.parser || exports.parser;
    delete options.parser;

    // hook require when enable speed
    options.speed || qrequire.hook();

    // transform code
    var result = parser.transform(content, options);

    // extract used babel helper api
    if (result.metadata
        && result.metadata.usedHelpers
    ) {
        // cache the used babel helper information
        var usedHelpers = result.metadata.usedHelpers;
        file.extras.babelHelpers = usedHelpers;

        // all used babel helper inform cached to `fis.babelHelpers`
        var helpers = fis.babelHelpers || (fis.babelHelpers = []);
        usedHelpers.forEach(function (item) {
            if (helpers.indexOf(item) === -1) {
                helpers.push(item);
            }
        });
    }

    options.speed || qrequire.unhook();

    // init source map
    var needSourceMap = options.sourceMaps;
    if (needSourceMap && result.map) {
        var sourceMapPath = file.realpath + '.map';
        var sourceMapFile = fis.file.wrap(sourceMapPath);

        sourceMapFile.setContent(JSON.stringify(result.map, null, 2));
        file.derived.push(sourceMapFile);
    }

    return result.code;
}

module.exports = exports = compile;

/**
 * 使用的 parser，从外部传入，不直接集成到该插件里，或者通过插件 conf 传人
 *
 * @type {Object}
 */
exports.parser = null;

