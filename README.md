colle
=====

[![Build Status](https://travis-ci.org/fdelbos/colle.png?branch=master)](https://travis-ci.org/fdelbos/colle)

A Nodejs dependency injection library 

### Installation

`npm install colle`

### Usage

#### Create an injector
call the make function, the result should be reused globally.
```
colle = require('colle').make();
```

#### Add dependencies
call the `set` function passing a name for the dependency, an array of dependencies and a constructor function.
The result of the function is what will be injected.

An exemple for an injector that create a counter that do not take dependencies:

```
colle.set("counter", [], function() {
    var a = 0;
    return {
        more: function() {
            a += 1;
            return a;
        },
        value: a
    }
});
```

A injector to print the counter

```
colle.set("print", ["counter"], function(counter) {
    return function() {
      console.log(counter.value);
    }
});
```

Sometimes contruction can failed (like the connection to a database), you can return an object with an `_init` method that take a callback to report the error:

```
colle.set("db", [], function() {
    var db = null;
    
    var _init = function(cb) {
        connectDb(function(error, instance) {
            if (error)
                return cb(error);
            db = instance;
        });
    }
    
    return {
        db: db
        _init: _init
    };
});
```
