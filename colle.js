"use strict";

var _ = require("lodash")

var make = function() {
    var _factories = {}
    var _treated = {}
    var _instances = {}

    var colleError = function(msg) {
        throw "!!! COLLE ERROR !!!\n ->" + msg + "\n";
    }

    var call = function(cb, err) {
        if (_.isFunction(cb))
            cb(err);
    }

    var set = function(name, dependencies, builder) {
        if (!_.isString(name))
            colleError("'colle.set' name parameter must be a string.");
        if (!_.isArray(dependencies))
            colleError("'colle.set' dependencies parameter must be an array.");
        if (!_.isFunction(builder))
            colleError("'colle.set' builder parameter must be a function.");
        _factories[name] = {
            dependencies: dependencies,
            builder: builder,
        }
    }

    var get = function(name) {
        return _instances[name];
    }

    var buildFactory = function(name, cb) {
        if (_.has(_instances, name))
            call(cb, null);
        if (!_.has(_factories, name))
			colleError("unknow factory: '" + name + "'");
        _treated[name] = true;
        var params = []
        var dependencies = _factories[name].dependencies
        for (var d in dependencies) {
            var depName = dependencies[d];
            if(_.has(_treated, depName))
                colleError("cyclic dependency detected: '" + name + "'");
            if(!_.has(_instances, depName)) {
                return buildFactory(depName, function(err) {
					if (err)
						return call(cb, err);
					else
						return buildFactory(name, cb);
					});
            }
            params.push(_instances[depName]);
        }

        var instance = _factories[name].builder.apply(null, params)
        _instances[name] = instance

        var complete = function() {
            delete _factories[name];
            delete _treated[name];
            call(cb, null);
        }

        if (_.isFunction(instance._init)) {
            instance._init(function(err) { 
				if (err) 
					return call(cb, err)
				else
					return complete(); 
			});
            return;
        }
        complete();
    }

    var start = function(cb) {
        if (!_.isFunction(cb))
            colleError("'colle.start' callback is not a function, don't know how to start.")
        if (_.isEmpty(_factories))
            call(cb, null);
        for(var k in _factories) {
            return buildFactory(k, function(err) {
				if (err)
					return call(cb, err);
				return start(cb);});
        }
    }

    return {
        start: start,
        get: get,
        set: set
    }
}

exports.make = make;
