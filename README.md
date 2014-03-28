colle
=====

[![Build Status](https://travis-ci.org/fdelbos/colle.png?branch=master)](https://travis-ci.org/fdelbos/colle)

A Nodejs dependency injection library 

### Installation

`npm install colle`

### Usage

#### Create an injector
call the make function, the result should be reused globally.

```js
colle = require('colle').make();
```

#### Add dependencies
call the `set` function passing a name for the dependency, an array of dependencies and a constructor function.
The result of the function is what will be injected.

An exemple for an injector that create a counter that do not take dependencies:

```js
colle.set("counter", [], function() {
    var a = 0;
    return {
        more: function() {
            a += 1;
            return a;
        },
        value: a
    };
});
```

A injector to print the counter.

```js
colle.set("print", ["counter"], function(counter) {
    return function() {
      console.log(counter.value);
    };
});
```
Notice that the dependencies are declared in an array and received as paremeters to the constructor.


Sometimes contruction can failed (like the connection to a database), you can return an object with an `_init` method that take a callback to report the error:

```js
colle.set("db", [], function() {
    var db = null;
    
    var _init = function(cb) {
        connectDb(function(error, instance) {
            if (error)
                return cb(error); // some error!
            db = instance;
            cb(null); // ok, everything is fine!
        });
    };
    
    return {
        db: db
        _init: _init
    };
});
```

#### Starting
At the end of the program call the `start` method to setup all the contructors in the right order (if a cyclic dependency is found, an exception will be thown):

```js
colle.start(function(err) {
	if (err)
	    return console.log "something wrong happend: " + err;
	console.log "dependencies are ready!";
	counter = colle.get("counter");
	console.log(counter.more());
};
```

Call the `get` method to get a dependency.
