colle
=====

[![Build Status](https://travis-ci.org/fdelbos/colle.png?branch=master)](https://travis-ci.org/fdelbos/colle)

A simple Nodejs dependency injection framework inspired by [Angularjs](http://docs.angularjs.org/guide/di).
I build this framework to be used in conjunction with coffescript's programs where everything is compiled in a single js file; so I don't have to worry about compilation order.
Also I believe it can be reused for other cases...

### Installation

`npm install colle`

### Usage

#### Create an injector
call the make function, the result should be reused globally.

```js
colle = require('colle').make();
```


#### Add dependencies

call the `set` function with the following parameters to create a dependency:
 1. a name
 2. an array of dependencies
 3. a constructor function taking denpendecies as parameters
The result of the constructor will be injected.

An exemple for an injector that create a counter that do not take dependencies:

```js
colle.set("counter", [], function() {
    var _value = 0;
    return {
        addOne: function() {
            _value += 1;
        },
        value: _value
    };
});
```

A injector to print the `counter` dependency.

```js
colle.set("print", ["counter"], function(counter) {
    return function() {
      console.log(counter.value);
    };
});
```

#### Init function

Sometimes construction can fail (like the connection to a database). You can define an `_init`
function that takes a callback to report the error:

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

Note that when a dependency failed to start properly the whole process is halted.

#### Starting

At the end of the program call the `start` method to setup all the contructors in the right order
(if a cyclic dependency is detected, an exception will be thown):

```js
colle.start(function(err) {
    if (err)
    	return console.log "something wrong happend: " + err;
    console.log "dependencies are ready!";
    counter = colle.get("counter");
    counter.addOne();
    console.log(counter.value);
};
```

Inside the `start` function call the `get` method to get a dependency.
