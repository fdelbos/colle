"use strict";

var _ = require("lodash")

var make = function() {
    var _factories = {}
    var _treated = {}
    var _instances = {}

    var call = function(cb) {
        if (_.isFunction(cb))
            cb();
    }

    var set = function(name, dependencies, builder) {
        _factories[name] = {
            dependencies: dependencies,
            builder: builder,
        }
    }

    var get = function(name) {
        return _instances[name];
    }

    var buildFactory = function(name, success, failure) {
        if (_.has(_instances, name))
            call(success);
        if (!_.has(_factories, name))
			throw "COLLE ERROR !\n -> unknow factory: '" + name + "'";
        _treated[name] = true;
        var params = []
        var dependencies = _factories[name].dependencies
        for (var d in dependencies) {
            var depName = dependencies[d];
            if(_.has(_treated, depName))
                throw "COLLE ERROR !\n -> cyclic dependency detected: '" + name + "'";
            if(!_.has(_instances, depName)) {
                return buildFactory(depName,
                    function() {buildFactory(name, success, failure);},
                    function() { failure(); })
            }
            params.push(_instances[depName]);
        }

        var instance = _factories[name].builder.apply(null, params)
        _instances[name] = instance

        var complete = function() {
            delete _factories[name];
            delete _treated[name];
            call(success);
        }

        if (_.isFunction(instance._init)) {
            instance._init(
                function() { complete(); },
                function() { call(failure); });
            return;
        }
        complete();
    }

    var start = function(success, failure) {
        if (_.isEmpty(_factories))
            call(success);
        for(var k in _factories) {
            return buildFactory(k,
                function() { start(success, failure); },
                function() { call(failure); });
        }
    }

    return {
        start: start,
        get: get,
        set: set
    }
}

exports.make = make;
