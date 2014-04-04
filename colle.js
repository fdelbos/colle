/* jslint node: true */
"use strict";

var _ = require("lodash");

var make = function () {
    var _factories = {},
        _treated = {},
        _instances = {},
        colleError, // throw when something go wrong
        call, // call start construction callback with or without err
        set, // set a dependency
        get, // get a dependency (after start)
        genDoNext, // call buildFactory with the next dependency
        buildFactory, // build the factory
        complete,// complete start function, by cleaning temporary stuffs and call cb with success
        start; // take care of building everything and execute a call back for success or error

    colleError = function (msg) {
        throw "!!! COLLE ERROR !!!\n ->" + msg + "\n";
    };

    call = function (cb, err) {
        if (_.isFunction(cb)) {
            cb(err);
        }
    };

    set = function (name, dependencies, builder) {
        if (!_.isString(name)) {
            colleError("'colle.set' name parameter must be a string.");
        }
        if (!_.isArray(dependencies)) {
            colleError("'colle.set' dependencies parameter must be an array.");
        }
        if (!_.isFunction(builder)) {
            colleError("'colle.set' builder parameter must be a function.");
        }
        _factories[name] = {
            dependencies: dependencies,
            builder: builder
        };
    };

    get = function (name) {
        return _instances[name];
    };

    genDoNext = function (name, endCb) {
        return function (err) {
            if (err) {
                return call(endCb, err);
            }
            return buildFactory(name, endCb);
        };
    };

    complete = function (name, startCb) {
        delete _factories[name];
        delete _treated[name];
        call(startCb, null);
    };

    buildFactory = function (name, cb) {
        if (_.has(_instances, name)) {
            call(cb, null);
        }
        if (!_.has(_factories, name)) {
            colleError("unknow factory: '" + name + "'");
        }
        _treated[name] = true;

        var params = [],
            dependencies = _factories[name].dependencies,
            i;
        for (i = 0; i < dependencies.length; i += 1) {
            if (_.has(_treated, dependencies[i])) {
                colleError("cyclic dependency detected: '" + name + "'");
            }
            if (!_.has(_instances, dependencies[i])) {
                return buildFactory(dependencies[i], genDoNext(name, cb));
            }
            params.push(_instances[dependencies[i]]);
        }

        _instances[name] = _factories[name].builder.apply(null, params);

        if (_.isFunction(_instances[name]._init)) {
            _instances[name]._init(function (err) {
                if (err) {
                    return call(cb, err);
                }
                return complete(name, cb);
            });
            return;
        }
        complete(name, cb);
    };

    start = function (cb) {
        if (!_.isFunction(cb)) {
            colleError("'colle.start' callback is not a function, don't know how to start.");
        }
        if (_.isEmpty(_factories)) {
            call(cb, null);
        }

        var startNext = function (err) {
                if (err) {
                    return call(cb, err);
                }
                return start(cb);
            },
            name;
        for (name in _factories) {
            if (_factories.hasOwnProperty(name)) {
                return buildFactory(name, startNext);
            }
        }
    };

    return {
        start: start,
        get: get,
        set: set
    };
}

exports.make = make;
