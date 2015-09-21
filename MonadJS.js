/**
 * MonadJS
 *
 * Copyright 2015 Steven J. Syrek
 * https://github.com/sjsyrek/MonadJS
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview A JavaScript implementation of various Haskell-style monads.
 * @author steven.syrek@gmail.com (Steven Syrek)
 */

/**
 * Create a new monad object as a wrapper around a value that might be nothing.
 * For the methods defined on this object that could apply to a monad object
 * created using either the Just or Nothing constructor, there are also
 * equivalent prototype methods that provide identical functionality.
 * @param {*} a - Any value.
 * @return {Nothing|Just} The constructor of the monad, Nothing if the argument
 * is null, undefined, or NaN or Just if it is anything else.
 */
function Maybe(a) { return (a === null || a === undefined || a !== a) ? Nothing : new Just(a); }

/**
 * Apply a function to the value inside a Just and return the result or, if
 * the monad passed in is a Nothing, return the default value provided.
 * @param {*} b - A default value.
 * @param {Function} fn - A function.
 * @param {Nothing|Just} a - A Maybe monad.
 * @return {*} The value inside a Just or the default value.
 */
Maybe.maybe = function(b, fn, a) { return this.isNothing(a) ? b : fn(this.fromJust(a)); }

/**
 * Return true if the Maybe monad is a Just and false otherwise.
 * @param {Nothing|Just} a - a Maybe monad.
 * @return {boolean}
 */
Maybe.isJust = function(a) { return a.constructor === Just ? true : false; }

/**
 * Return true if the Maybe monad is a Nothing and false otherwise.
 * @param {Nothing|Just} a - a Maybe monad.
 * @return {boolean}
 */
Maybe.isNothing = function(a) { return a === Nothing ? true : false; }

/**
 * Extract and return the value stored within a Just monad and throw an
 * exception if the monad passed in is a Nothing.
 * @param {Nothing|Just} a - a Maybe monad.
 * @return {boolean}
 */
Maybe.fromJust = function(a) {
  if (this.isJust(a)) {
    return a.bind(function(a) { return a; });
  } else {
    throw a + ' is Nothing';
  }
} // end Maybe.fromJust

/**
 * Extract and return the value stored within a Just monad or the default
 * value provided if the monad passed in is a Nothing.
 * @param {*} b - A default value.
 * @param {Nothing|Just} a - A Maybe monad.
 * @return {*} The value inside a Just or the default value.
 */
Maybe.fromMaybe = function(b, a) { return this.isNothing(a) ? b : this.fromJust(a); }

/**
 * Return a Maybe monad containing the first element of the array passed in
 * or a Nothing if the array is empty or the first element is null, undefined, or NaN.
 * @param {Array} a - An array.
 * @return {Nothing|Just} A Maybe monad.
 */
Maybe.listToMaybe = function(a) { return a.length === 0 ? new Nothing() : Maybe(a[0]); }

/**
 * Return an array containing the value within a Just monad or an empty array
 * if the monad passed in is a Nothing.
 * @param {Nothing|Just} a - A Maybe monad.
 * @return {Array}
 */
Maybe.maybeToList = function(a) { return this.isNothing(a) ? [] : [this.fromJust(a)]; }

/**
 * Take an array of Maybe monads and return a new array containing only the
 * Just monads from the original array.
 * @param {Array} a - An array of Maybe monads.
 * @return {Array}
 */
Maybe.catMaybes = function(a) { return a.filter(function(b) { return Maybe.isJust(b) ? true : false; }).map(function(b) { return Maybe.fromJust(b) }); }

/**
 * Map a function that returns a Maybe monad over an array and return a new
 * array containing only the values from the original array for which the
 * provided function returned a Just.
 * @param {Function} fn - A function to map over a.
 * @param {Array} a - An array.
 */
Maybe.mapMaybe = function(fn, a) { return a.filter(function(b) { return Maybe.isJust(fn(b)) ? true : false; }).map(function(b) { return Maybe.fromJust(fn(b)); }); }

/**
 * Create a Maybe monad wrapping a value that isn't null, undefined, or NaN. Unlike the Nothing monad,
 * which represents all null, undefined, and NaN Maybes with the same object, this function constructs a
 * new object for each Just monad.
 * @constructor {*} a - A value to wrap.
 */
function Just(a) {
  // standard monad operations
  this.inject = function(a) { return Maybe(a); };
  this.bind = function(func) { return func.call(this, a); }; // return Maybe(func.call(this, a));
  this.chain = function(func) { return func.call(this); };
  // this.chain = function(func) { return func.call(this, a); return this; };
  // convenience functions that call methods on Maybe using this object or its contained value as an argument
  this.maybe = function(b, fn) { return Maybe.maybe(b, fn, this); };
  this.isJust = function() { return Maybe.isJust(this); };
  this.isNothing = function() { return Maybe.isNothing(this); };
  this.fromJust = function() { return Maybe.fromJust(this); };
  this.fromMaybe = function(b) { return Maybe.fromMaybe(b, this); };
  this.maybeToList = function() { return Maybe.maybeToList(this); };
};

//Just.prototype.maybe = function(b, fn) { return this.isNothing() ? b : fn(this.fromJust()); }

//Just.prototype.isJust = function() { return Maybe.isJust(this) ? true : false; }

//Just.prototype.isNothing = function() { return Maybe.isNothing(this) ? true : false; }

//Just.prototype.fromMaybe = function(b) { return this.isNothing() ? b : this.fromJust(); }

//Just.prototype.maybeToList = function() { return this.isNothing() ? [] : [this.fromJust()]; }

/**
 * Create a Maybe monad wrapping a value that is null, undefined, or NaN. Unlike the Just monad, which
 * constructs a new object for each Just monad, this object represents all null, undefined, and NaN
 * Maybes with the same object, because "nothing will come of nothing." -- King Lear, I.i.90
 * @type {Object}
 */
var Nothing = {
  // standard monad operations
  inject: function(a) { return Maybe(a); },
  bind: function() { return this; },
  chain: function(func) { return func.call(this); },
  // convenience functions that call methods on Maybe using this object or its contained value as an argument
  maybe: function(b, fn) { return Maybe.maybe(b, fn, this); },
  isJust: function() { return Maybe.isJust(this); },
  isNothing: function() { return Maybe.isNothing(this); },
  fromJust: function() { return Maybe.fromJust(this); },
  fromMaybe: function(b) { return Maybe.fromMaybe(b, this); },
  maybeToList: function() { return Maybe.maybeToList(this); }
};

function testMaybe() {
  var aJ = Maybe(1); // Just(1)
  var aN = Maybe(null); // Nothing
  var b = -1; // default value
  var list = [2, 4, 6, null, null, 12, NaN, 16, 18, undefined];
  var listN = [null, null, 1, 2, 3]; // list beginning with null value
  var listM = [Maybe(5), Maybe(10), Maybe(15), Maybe(null), Maybe(undefined), Maybe(NaN), Maybe(20)]; // list of Maybes
  var fn = function(a) { return a * 2 };
  var fnM = function(a) { var b = Maybe(a); if (b.isJust()) { return b.inject(a * 2); } return b; }; // function that returns a Maybe
  var testSuite = {
    Maybe: {
      maybe: {
        Just: Maybe.maybe(b, fn, aJ), // 2.0
        Nothing: Maybe.maybe(b, fn, aN) // -1.0
      },
      isJust: {
        Just: Maybe.isJust(aJ), // true
        Nothing: Maybe.isJust(aN) // false
      },
      isNothing: {
        Just: Maybe.isNothing(aN), // false
        Nothing: Maybe.isNothing(aJ) // true
      },
      fromJust: {
        Just: Maybe.fromJust(aJ), // 1.0
        Nothing: function() { try { Maybe.fromJust(aN); } catch(e) { return e; } }() // exception
      },
      fromMaybe: {
        Just: Maybe.fromMaybe(b, aJ), // 1.0
        Nothing: Maybe.fromMaybe(b, aN) // -1.0
      },
      listToMaybe: {
        Just: Maybe.listToMaybe(list).isJust(), // true
        Nothing: Maybe.listToMaybe(listN).isNothing() // true
      },
      maybeToList: {
        Just: Maybe.maybeToList(aJ), // [1.0]
        Nothing: Maybe.maybeToList(aN) // []
      },
      catMaybes: Maybe.catMaybes(listM), // [5.0, 10.0, 15.0, 20.0]
      mapMaybe: {
        Just: Maybe.mapMaybe(fnM, list), // [4.0, 8.0, 12.0, 24.0, 32.0, 36.0]
        Nothing: Maybe.mapMaybe(fnM, listN) // [1.0, 2.0, 3.0]
      }
    },
    Just: {
      inject: aJ.inject(100).fromJust(), // 100.0
      bind: aJ.bind(function(a) { return a + 1000; }), // 1001.0
      chain: aJ.chain(function() { return Logger.log('Just chain'); }), // Logs 'Just chain' and returns
      maybe: aJ.maybe(b, fn), // 2.0
      isJust: aJ.isJust(), // true
      isNothing: aJ.isNothing(), // false
      fromJust: aJ.fromJust(), // 1.0
      fromMaybe: aJ.fromMaybe(b), // 1.0
      maybeToList: aJ.maybeToList() // [1.0]
    },
    Nothing: {
      inject: aN.inject(100).fromJust(), // 100.0
      bind: aN.bind(function(a) { return a + 1000; }), // 1000.0
      chain: aN.chain(function() { return Logger.log('Just chain'); }), // Logs 'Just chain' and returns
      maybe: aN.maybe(b, fn), // -1.0
      isJust: aN.isJust(), // false
      isNothing: aN.isNothing(), // true
      fromJust: function() { try { aN.fromJust(); } catch(e) { return e; } }(), // exception
      fromMaybe: aN.fromMaybe(b), // -1.0
      maybeToList: aN.maybeToList() // []
    }
  }
  Logger.log(testSuite.Maybe);
  Logger.log(testSuite.Just);
  Logger.log(testSuite.Nothing);
}