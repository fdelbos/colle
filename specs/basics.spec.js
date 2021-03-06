
describe("Basics ->", function() {

    it("create a factory and start it", function(done) {
        colle = require('../colle').make();

        colle.set("test", [], function() {
            var a = 0;
            return {
                more: function() {
                    a += 1;
                    return a;
                }
            }
        });
        colle.start(
            function(err) {
				expect(err).toBe(null);
                expect(colle.get("test").more()).toBe(1);
                expect(colle.get("test").more()).toBe(2);
                done();
            }
        );
    });

    it("re do it and see that they don't collide", function(done) {
        colle = require('../colle').make();

        colle.set("test", [], function() {
            var a = 0;
            return {
                more: function() {
                    a += 1;
                    return a;
                }
            }
        });
        colle.start(
            function(err) {
				expect(err).toBe(null);
                var test = colle.get("test")
                expect(test.more()).toBe(1);
                test.more()
                expect(colle.get("test").more()).toBe(3);
                done();
            }
        );
    });

    it("should have 2 factories", function(done) {
        colle = require('../colle').make();

        colle.set("dependent", ["test"], function(test) {
            return {
                add1: test.more
                }
        });

        colle.set("test", [], function() {
            var a = 0;
            return {
                more: function() {
                    a += 1;
                    return a;
                }
            };
        });

        colle.start(
            function(err) {
				expect(err).toBe(null);
                expect(colle.get("test").more()).toBe(1);
                expect(colle.get("dependent").add1()).toBe(2);
                done();
            }
        );
    });

    it("cyclic dependency", function() {
        colle = require('../colle').make();

        colle.set("dependent", ["test"], function(test) {
            return {
                add1: test.more
            }
        });

        colle.set("test", ["dependent"], function() {
            var a = 0;
            return {
                more: function() {
                    a += 1;
                    return a;
                }
            };
        });

        expect(function() {
                colle.start(
                    function(err) {
						expect(err).toBe(null);
                        expect(colle.get("test").more()).toBe(1);
                        expect(colle.get("dependent").add1()).toBe(2);
                        done();
                    });
                }).toThrow();
    });

    it("unknow dependency", function() {
        colle = require('../colle').make();

        colle.set("dependent", ["unknow"], function(test) {
            return {
                add1: test.more
            }
        });

        colle.set("test", [], function() {
            var a = 0;
            return {
                more: function() {
                    a += 1;
                    return a;
                },
                _init: function() {
                    a = 42;
                }
            };
        });

        expect(function() {
			colle.start(function(err) {
				expect(err).toBe(null);
			})}).toThrow();
    });

    it("error in init phase", function() {
        colle = require('../colle').make();

        colle.set("dependent", ["unknow"], function(test) {
            return {
                add1: test.more
            }
        });

        colle.set("test", [], function() {
            var a = 0;
            return {
                more: function() {
                    a += 1;
                    return a;
                },
                _init: function(cb) {
                    cb(true)
                }
            };
        });

        expect(function() {
			colle.start(function(err) {
				expect(err).toBe(true);
			})}).toThrow();
    });

    it("should throw if wrong parameter type", function() {
        colle = require('../colle').make();
        expect(function() {colle.set(42, [], function(err) {})}).toThrow();
        expect(function() {colle.set("name", null, function(err) {})}).toThrow();
        expect(function() {colle.set("name", [])}).toThrow();

    })

});

