# MonadJS
## An implementation of various Haskell-style monads for use in JavaScript

I originally wrote this library for use in Google Apps Script code, which requires frequent API calls that return data from an extremely unpredictable state. I decided to make it as comprehensive as possible in respectful imitation of the Haskell implementation of monads. The `Maybe` monad, in particular, was the inspiration for the library as a whole, as rendering this rather simple monad into uncooperative (but, fortunately, highly functional) JavaScript was an excellent exercise in finally figuring out the essence of monads, how they operate, and what they're good for. This is, and will likely remain, a preliminary investigation, so I cannot guarantee the correctness, goodness, or usefulness of either my code or my explanations. I did my best to learn about monads and design JavaScript equivalents on the basis of [Learn You A Haskell](http://www.learnyouahaskell.com), [Real World Haskell](http://book.realworldhaskell.org), and the "less gentle" section on monads from [A Gentle Introduction to Haskell](https://www.haskell.org/tutorial/monads.html). I found [this Gist](https://gist.github.com/igstan/5735974) useful, as well. Corrections, feedback, and contributions are welcome.

### What is a Monad?
The problem with monads, as everybody says, is that once you figure them out you lose the ability to explain them to anybody else. To figure them out, myself, I decided to implement monads in JavaScript. To be more precise, I am trying to implement certain specific instances of the Haskell monad type class. Since JavaScript doesn't have anything comparable to type classes, it didn't seem worth implementing a general abstraction of a monad type as a superclass. Instead, I am going to implement the more useful monad instances one at a time.

A monad, in JavaScript terms, is an object that serves as a context (or wrapper) for some data you don't want to expose to the "real world" and an interface for manipulating that data safely. Instead of working with this data directly, which could result in dangerous side effects, you work with it indirectly through the monad. The monad itself really just serves as a convenient mechanism for chaining together a series of functions. If any of those functions happens to fail along the way, you can protect the rest of your program from crashing by isolating the error event inside a monad. You might think of a monad chain as a mini-program within a larger application, one that steps through its function calls within its closed-off environment and then ends up with a value you can use. Or, if you're visual, a monad is like an arrow that points from one thing to another thing of the same type—it performs some tasks in between, but ultimately winds up in a similar (in fact, formally identical) place. Or, if you're mathematical, you can look up [Category Theory](https://en.wikipedia.org/wiki/Category_theory) in Wikipedia. Like most things in programming worth knowing about, it's a useful abstraction.

I copied the monads in this library from the Haskell basic library. They follow the usual pattern for Haskell monads by implementing four, basic functions:

```javascript
/**
 * Inject or return a value into a monad. This is the value the monadic wrapper is hiding.
 * @param {*} a - Any value.
 * @return {Monad} A monad.
 */
function inject(a) { return Monad(a); }; // equivalent to Haskell return

/**
 * Bind a function to the value wrapped in a monad and return a monad, for chaining.
 * @param {Function} fn - A function that takes a normal value, a, and returns a monad in the context of an existing (i.e. this) monad.
 * @return {Function|Function} Return a monad from function fn with argument a and thisVal set to the monad on which this function is defined, or call a failure method if there's a problem.
 */
function bind(fn) { try { return fn.call(this, a); } catch(e) { return this.fail(e) } }; // equivalent to Haskell >>=

/**
 * Chain a function to a monad without using its wrapped value, useful for adding a procedure to the function chain that doesn't need to operate on the monadic value.
 * @param {Function} fn - A function that returns a monad in the context of an existing (i.e. this) monad.
 * @return {Function} Return a monad from calling function fn with argument a and thisVal set to the monad on which this function is defined.
 */
function chain(fn) { return fn.call(this); }; // equivalent to Haskell >>

/**
 * Handle error cases in the event a bind() operation fails.
 */
function fail(e) { /* error handling code */ }; // equivalent to Haskell fail
```

The best way to get acquainted with monads is probably to see specific examples. I will document these as best I can as I create them. At this point, it's probably worth mentioning that I developed these monads on the Google Apps Script platform, where I originally planned to use them. The `Maybe` monad, for example, is useful for encapsulating values derived from calls to the Apps Script APIs, which can return unpredictable results. For scripts bound to documents such as Google Sheets, the spreadsheet represents a "state" that is especially difficult to control or plan around, and monads are one way to deal with this situation elegantly. I believe Apps Script supports most, but not all, features of ECMAScript 5. Logging, specifically, works differently than in a typical JavaScript console, and you may have to adjust the test code accordingly. Finally, I am not a professional programmer, so comments for improving this code are welcome. I am actually a scholar of English literature, so I almost have more fun writing comments than actual code... almost!

#### Maybe
The `Maybe` monad provides an easy way to encapsulate a value that can be either something or nothing. `Maybe`s are used liberally in Haskell and were one of the likely sources of inspiration for Swift optionals. They may be especially useful in JavaScript, which has numerous values that approximate the idea of "nothing" even though none of them are exactly equivalent to a null pointer. Use them wherever you need to fetch a value from the "real world" that could be either something or nothing (`null`, `undefined`, or `NaN`, specifically), and where you'd like to avoid potentially passing around "nothing" values or having to do repetitive checks against them.

Construct a new `Maybe` by passing any value to the `Maybe()` function:

```javascript
var maybe = Maybe(2);
```

This function tests the argument value and returns either a `Just` or `Nothing` object. A `Just` is created using an object constructor function. A `Nothing` simply points to the `Nothing` object that represents all of them, as no value is wrapped inside nothing. Now that you have a `Maybe` monad, you can apply functions to it using the `bind()` and `chain()` methods:

```javascript
var m = Maybe(2); // create the monad
var fn = function(a) { return Maybe(a * 2); }; // define a callback function that takes a value from a Maybe monad and returns a Maybe monad, for testing bind()
var log = function() { console.log('Value is ' + this.fromJust()); return this; }; // define a callback function that logs some text and returns the calling monad, for testing chain()
var ch = function() { return this.fromJust(); }; // define a callback function for returning a raw value from the calling Maybe monad (this will throw an exception if the monad is Nothing)
var b = m.bind(fn).chain(log).bind(fn).chain(log).bind(fn).chain(log).bind(fn).chain(log).chain(ch); // chain together a series of operations, alternating between calls to fn() and calls to log() and concluding with ch()
console.log(b); // logs 'Value is 4', 'Value is 8', 'Value is 16', 'Value is 32', 32
var nothing = function() { return Maybe(null); }; // define a callback function to test failure cases in chained function calls
var c = m.bind(fn).chain(log).bind(nothing).chain(log).bind(fn).chain(log).bind(fn).chain(log).bind(fn).chain(ch); // logs 'Value is 4' before failing -- in Haskell, none of these would evaluate, but JavaScript doesn't have lazy evaluation, so we just do everything in order
console.log(c.isNothing()); // logs 'true' and verifies that the value of the entire monadic sequence is Nothing
```

There are, in addition, a number of utility functions defined on `Maybe` itself and, where appropriate on `Just` and `Nothing`. These are documented in the code itself and follow as closely as possible the functionality described in the Haskell library documentation: https://downloads.haskell.org/~ghc/6.12.2/docs/html/libraries/base-4.2.0.1/Data-Maybe.html#t%3AMaybe

Changelog

- 2015-09-21: Initial commit and testing in Google Apps Script environment