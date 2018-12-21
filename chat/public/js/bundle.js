/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(5);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() {
  return this || (typeof self === "object" && self);
})() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = __webpack_require__(6);

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}


/***/ }),
/* 6 */
/***/ (function(module, exports) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() {
    return this || (typeof self === "object" && self);
  })() || Function("return this")()
);


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(8);

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {// MIT License
//
// Copyright (c) 2018 KONSTANTIN Y. RYBAKOV
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
//     The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
//     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


class CuteSet{
    constructor(input){
        if(typeof input === "string" || typeof input === "number"){
            input = [input];
        }

        this._set = new Set(input);

        this[Symbol.iterator] = function * (){
            for(let i of this._set){
                yield i;
            }
        }
    }

    forEach(cb){
        for (let i of this._set){
            cb(i, i, this)
        }
    }

    static _formatInput(input){
        if (!(input instanceof CuteSet)){
            return new CuteSet(input)
        } else{
            return input;
        }
    }

    static fromString(input, delimiter = " ", parseNumbers = false){
        if(!input || input === " "){
            return new CuteSet()
        } else if(typeof(input) !== "string"){
            throw "CuteSet error: input format is invalid, expecting string"
        }

        input = input.split(delimiter);

        if(parseNumbers){
            input = input.map(val =>{
                return parseFloat(val);
            })
        }
        return new CuteSet(input);
    }

    union(set){
        set = CuteSet._formatInput(set);
        return new CuteSet([...this.toArray(), ...set.toArray()]);
    }

    join(set){
        return this.union(set)
    }

    difference(set){
        set = CuteSet._formatInput(set);
        return new CuteSet(this.toArray().filter(x => !set.has(x)))
    }

    complement(set){
        set = CuteSet._formatInput(set);
        return set.minus(this);
    }

    minus(set){
        return this.difference(set);
    }

    symmetricDifference(set){
        set = CuteSet._formatInput(set);
        return this.union(set).difference(this.intersection(set));
    }

    intersection(set){
        set = CuteSet._formatInput(set);
        return new CuteSet(this.toArray().filter(x => set.has(x)))
    }

    equal(set){
        set = CuteSet._formatInput(set);
        return this.symmetricDifference(set).length() === 0
    }

    subsetOf(set){
        set = CuteSet._formatInput(set);
        return this.intersection(set).equal(this)
    }

    sort(fn){
        this._set = new Set(this.toArray().sort(fn))
    }

    powerSet(){
        let set = this.toArray();
        if(set.length > 21){
            throw "Maximum supported length for generating powerset is exceeded."
        }
        let numCombinations = parseInt(this._getStringOfSymbols(set.length, "1").split('').reverse().join(''), 2 )+1;
        let res = [];
        for (let i=0; i<numCombinations; ++i){
            let num = i.toString(2);
            num = this._padWithZeroes(num, set.length);
            res.push(new CuteSet(set.filter((val, i) =>{
                return num[i] == 1;
            })));
        }
        return new CuteSet(res);
    }

    permutations(){
        if(this.size() > 9){
            throw "Maximum supported length for generating permutations is exceeded."
        }
        let set = this.toArray();
        let n = set.length;
        let res = new CuteSet();
        let c = Array.apply(null, {length: n}).map(Function.call, ()=>{return 0});
        let i=0;
        res.add(new CuteSet(set));
        let swap = (i, j, arr)=>{
            let t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
        };
        while (i<n){
            if(c[i] < i){
                (i%2===0) ? swap(0, i, set) : swap(c[i], i, set);
                res.add(new CuteSet(set));
                c[i]+=1;
                i=0
            }else{
                c[i] = 0;
                i += 1;
            }
        }
        return res
    }

    has(x){
        return this._set.has(x)
    }

    length(){
        return this._set.size
    }

    size(){
        return this.length();
    }

    empty(){
        return this._set.size === 0
    }

    add(x){
        this._set.add(x);
    }

    remove(x){
        return this._set.delete(x);
    }

    delete(x){
        return this.remove(x)
    }

    toArray(){
        return Array.from(this._set)
    }

    toString(delimiter = " "){
        return this.toArray().join(delimiter);
    }

    print(delimiter){
        console.log(this.toString(delimiter) +"\n");
    }

    _padWithZeroes(str, length){
        if(str.length < length){
            return this._getStringOfSymbols(length - str.length, "0") + str
        }
        return str;
    }

    _getStringOfSymbols(length, char){
        return char.repeat(length);
    }

}

if( true && module.hasOwnProperty('exports')){
    module.exports = CuteSet;
}



/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(9)(module)))

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(process, global, module) {/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);


/*
 * [hi-base32]{@link https://github.com/emn178/hi-base32}
 *
 * @version 0.3.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2017
 * @license MIT
 */

/*jslint bitwise: true */
(function () {
  'use strict';

  var root = (typeof window === "undefined" ? "undefined" : _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(window)) === 'object' ? window : {};
  var NODE_JS = !root.HI_BASE32_NO_NODE_JS && (typeof process === "undefined" ? "undefined" : _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(process)) === 'object' && process.versions && process.versions.node;

  if (NODE_JS) {
    root = global;
  }

  var COMMON_JS = !root.HI_BASE32_NO_COMMON_JS && ( false ? undefined : _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(module)) === 'object' && module.exports;
  var AMD = typeof define === 'function' && __webpack_require__(14);
  var BASE32_ENCODE_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('');
  var BASE32_DECODE_CHAR = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3,
    'E': 4,
    'F': 5,
    'G': 6,
    'H': 7,
    'I': 8,
    'J': 9,
    'K': 10,
    'L': 11,
    'M': 12,
    'N': 13,
    'O': 14,
    'P': 15,
    'Q': 16,
    'R': 17,
    'S': 18,
    'T': 19,
    'U': 20,
    'V': 21,
    'W': 22,
    'X': 23,
    'Y': 24,
    'Z': 25,
    '2': 26,
    '3': 27,
    '4': 28,
    '5': 29,
    '6': 30,
    '7': 31
  };
  var blocks = [0, 0, 0, 0, 0, 0, 0, 0];

  var toUtf8String = function toUtf8String(bytes) {
    var str = '',
        length = bytes.length,
        i = 0,
        followingChars = 0,
        b,
        c;

    while (i < length) {
      b = bytes[i++];

      if (b <= 0x7F) {
        str += String.fromCharCode(b);
        continue;
      } else if (b > 0xBF && b <= 0xDF) {
        c = b & 0x1F;
        followingChars = 1;
      } else if (b <= 0xEF) {
        c = b & 0x0F;
        followingChars = 2;
      } else if (b <= 0xF7) {
        c = b & 0x07;
        followingChars = 3;
      } else {
        throw 'not a UTF-8 string';
      }

      for (var j = 0; j < followingChars; ++j) {
        b = bytes[i++];

        if (b < 0x80 || b > 0xBF) {
          throw 'not a UTF-8 string';
        }

        c <<= 6;
        c += b & 0x3F;
      }

      if (c >= 0xD800 && c <= 0xDFFF) {
        throw 'not a UTF-8 string';
      }

      if (c > 0x10FFFF) {
        throw 'not a UTF-8 string';
      }

      if (c <= 0xFFFF) {
        str += String.fromCharCode(c);
      } else {
        c -= 0x10000;
        str += String.fromCharCode((c >> 10) + 0xD800);
        str += String.fromCharCode((c & 0x3FF) + 0xDC00);
      }
    }

    return str;
  };

  var decodeAsBytes = function decodeAsBytes(base32Str) {
    base32Str = base32Str.replace(/=/g, '');
    var v1,
        v2,
        v3,
        v4,
        v5,
        v6,
        v7,
        v8,
        bytes = [],
        index = 0,
        length = base32Str.length; // 4 char to 3 bytes

    for (var i = 0, count = length >> 3 << 3; i < count;) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v8 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
      bytes[index++] = (v4 << 4 | v5 >>> 1) & 255;
      bytes[index++] = (v5 << 7 | v6 << 2 | v7 >>> 3) & 255;
      bytes[index++] = (v7 << 5 | v8) & 255;
    } // remain bytes


    var remain = length - count;

    if (remain === 2) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
    } else if (remain === 4) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
    } else if (remain === 5) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
      bytes[index++] = (v4 << 4 | v5 >>> 1) & 255;
    } else if (remain === 7) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
      bytes[index++] = (v4 << 4 | v5 >>> 1) & 255;
      bytes[index++] = (v5 << 7 | v6 << 2 | v7 >>> 3) & 255;
    }

    return bytes;
  };

  var encodeAscii = function encodeAscii(str) {
    var v1,
        v2,
        v3,
        v4,
        v5,
        base32Str = '',
        length = str.length;

    for (var i = 0, count = parseInt(length / 5) * 5; i < count;) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i++);
      v3 = str.charCodeAt(i++);
      v4 = str.charCodeAt(i++);
      v5 = str.charCodeAt(i++);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] + BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] + BASE32_ENCODE_CHAR[v4 >>> 2 & 31] + BASE32_ENCODE_CHAR[(v4 << 3 | v5 >>> 5) & 31] + BASE32_ENCODE_CHAR[v5 & 31];
    } // remain char


    var remain = length - count;

    if (remain === 1) {
      v1 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[v1 << 2 & 31] + '======';
    } else if (remain === 2) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[v2 << 4 & 31] + '====';
    } else if (remain === 3) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i++);
      v3 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] + BASE32_ENCODE_CHAR[v3 << 1 & 31] + '===';
    } else if (remain === 4) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i++);
      v3 = str.charCodeAt(i++);
      v4 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] + BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] + BASE32_ENCODE_CHAR[v4 >>> 2 & 31] + BASE32_ENCODE_CHAR[v4 << 3 & 31] + '=';
    }

    return base32Str;
  };

  var encodeUtf8 = function encodeUtf8(str) {
    var v1,
        v2,
        v3,
        v4,
        v5,
        code,
        end = false,
        base32Str = '',
        index = 0,
        i,
        start = 0,
        bytes = 0,
        length = str.length;

    do {
      blocks[0] = blocks[5];
      blocks[1] = blocks[6];
      blocks[2] = blocks[7];

      for (i = start; index < length && i < 5; ++index) {
        code = str.charCodeAt(index);

        if (code < 0x80) {
          blocks[i++] = code;
        } else if (code < 0x800) {
          blocks[i++] = 0xc0 | code >> 6;
          blocks[i++] = 0x80 | code & 0x3f;
        } else if (code < 0xd800 || code >= 0xe000) {
          blocks[i++] = 0xe0 | code >> 12;
          blocks[i++] = 0x80 | code >> 6 & 0x3f;
          blocks[i++] = 0x80 | code & 0x3f;
        } else {
          code = 0x10000 + ((code & 0x3ff) << 10 | str.charCodeAt(++index) & 0x3ff);
          blocks[i++] = 0xf0 | code >> 18;
          blocks[i++] = 0x80 | code >> 12 & 0x3f;
          blocks[i++] = 0x80 | code >> 6 & 0x3f;
          blocks[i++] = 0x80 | code & 0x3f;
        }
      }

      bytes += i - start;
      start = i - 5;

      if (index === length) {
        ++index;
      }

      if (index > length && i < 6) {
        end = true;
      }

      v1 = blocks[0];

      if (i > 4) {
        v2 = blocks[1];
        v3 = blocks[2];
        v4 = blocks[3];
        v5 = blocks[4];
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] + BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] + BASE32_ENCODE_CHAR[v4 >>> 2 & 31] + BASE32_ENCODE_CHAR[(v4 << 3 | v5 >>> 5) & 31] + BASE32_ENCODE_CHAR[v5 & 31];
      } else if (i === 1) {
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[v1 << 2 & 31] + '======';
      } else if (i === 2) {
        v2 = blocks[1];
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[v2 << 4 & 31] + '====';
      } else if (i === 3) {
        v2 = blocks[1];
        v3 = blocks[2];
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] + BASE32_ENCODE_CHAR[v3 << 1 & 31] + '===';
      } else {
        v2 = blocks[1];
        v3 = blocks[2];
        v4 = blocks[3];
        base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] + BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] + BASE32_ENCODE_CHAR[v4 >>> 2 & 31] + BASE32_ENCODE_CHAR[v4 << 3 & 31] + '=';
      }
    } while (!end);

    return base32Str;
  };

  var encodeBytes = function encodeBytes(bytes) {
    var v1,
        v2,
        v3,
        v4,
        v5,
        base32Str = '',
        length = bytes.length;

    for (var i = 0, count = parseInt(length / 5) * 5; i < count;) {
      v1 = bytes[i++];
      v2 = bytes[i++];
      v3 = bytes[i++];
      v4 = bytes[i++];
      v5 = bytes[i++];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] + BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] + BASE32_ENCODE_CHAR[v4 >>> 2 & 31] + BASE32_ENCODE_CHAR[(v4 << 3 | v5 >>> 5) & 31] + BASE32_ENCODE_CHAR[v5 & 31];
    } // remain char


    var remain = length - count;

    if (remain === 1) {
      v1 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[v1 << 2 & 31] + '======';
    } else if (remain === 2) {
      v1 = bytes[i++];
      v2 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[v2 << 4 & 31] + '====';
    } else if (remain === 3) {
      v1 = bytes[i++];
      v2 = bytes[i++];
      v3 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] + BASE32_ENCODE_CHAR[v3 << 1 & 31] + '===';
    } else if (remain === 4) {
      v1 = bytes[i++];
      v2 = bytes[i++];
      v3 = bytes[i++];
      v4 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] + BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] + BASE32_ENCODE_CHAR[v2 >>> 1 & 31] + BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] + BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] + BASE32_ENCODE_CHAR[v4 >>> 2 & 31] + BASE32_ENCODE_CHAR[v4 << 3 & 31] + '=';
    }

    return base32Str;
  };

  var encode = function encode(input, asciiOnly) {
    var notString = typeof input !== 'string';

    if (notString && input.constructor === ArrayBuffer) {
      input = new Uint8Array(input);
    }

    if (notString) {
      return encodeBytes(input);
    } else if (asciiOnly) {
      return encodeAscii(input);
    } else {
      return encodeUtf8(input);
    }
  };

  var decode = function decode(base32Str, asciiOnly) {
    if (!asciiOnly) {
      return toUtf8String(decodeAsBytes(base32Str));
    }

    var v1,
        v2,
        v3,
        v4,
        v5,
        v6,
        v7,
        v8,
        str = '',
        length = base32Str.indexOf('=');

    if (length === -1) {
      length = base32Str.length;
    } // 8 char to 5 bytes


    for (var i = 0, count = length >> 3 << 3; i < count;) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v8 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) + String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255) + String.fromCharCode((v4 << 4 | v5 >>> 1) & 255) + String.fromCharCode((v5 << 7 | v6 << 2 | v7 >>> 3) & 255) + String.fromCharCode((v7 << 5 | v8) & 255);
    } // remain bytes


    var remain = length - count;

    if (remain === 2) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255);
    } else if (remain === 4) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) + String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255);
    } else if (remain === 5) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) + String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255) + String.fromCharCode((v4 << 4 | v5 >>> 1) & 255);
    } else if (remain === 7) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) + String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255) + String.fromCharCode((v4 << 4 | v5 >>> 1) & 255) + String.fromCharCode((v5 << 7 | v6 << 2 | v7 >>> 3) & 255);
    }

    return str;
  };

  var exports = {
    encode: encode,
    decode: decode
  };
  decode.asBytes = decodeAsBytes;

  if (COMMON_JS) {
    module.exports = exports;
  } else {
    root.base32 = exports;

    if (AMD) {
      define(function () {
        return exports;
      });
    }
  }
})();
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(11), __webpack_require__(12), __webpack_require__(13)(module)))

/***/ }),
/* 11 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 12 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = function(originalModule) {
	if (!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 14 */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(this, {}))

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/typeof.js
var helpers_typeof = __webpack_require__(4);
var typeof_default = /*#__PURE__*/__webpack_require__.n(helpers_typeof);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(0);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/asyncToGenerator.js
var asyncToGenerator = __webpack_require__(3);
var asyncToGenerator_default = /*#__PURE__*/__webpack_require__.n(asyncToGenerator);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/classCallCheck.js
var classCallCheck = __webpack_require__(1);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/createClass.js
var createClass = __webpack_require__(2);
var createClass_default = /*#__PURE__*/__webpack_require__.n(createClass);

// CONCATENATED MODULE: ./src/js/chat/ChatMessage.js



/**
 * Represents chat message
 * Signature hashes only header + body of the message
 *
 * Recipient:
 * */
var ChatMessage_ChatMessage =
/*#__PURE__*/
function () {
  function ChatMessage(blob) {
    classCallCheck_default()(this, ChatMessage);

    if (typeof blob === "string") {
      blob = JSON.parse(blob);
    }

    this.signature = blob ? blob.signature : "";
    this.header = blob ? blob.header : {
      id: this.generateNewID(),
      timestamp: new Date(),
      metadataID: "",
      author: "",
      nickname: "",
      //AUTHOR PKFP
      recipient: "all" //RCIPIENT PKFP

    };
    this.body = blob ? blob.body : "";
    this.attachments = blob ? blob.attachments : undefined;
  }
  /**
   * encrypts and replaces the body of the message with its cipher
   * @param key Should be SYM AES key in form of a string
   */


  createClass_default()(ChatMessage, [{
    key: "encryptMessage",
    value: function encryptMessage(key) {
      var self = this;
      var ic = new iCrypto();
      ic.setSYMKey("k", key).addBlob("body", self.body).AESEncrypt("body", "k", "bodycip", true, "CBC", 'utf8');

      if (self.attachments) {
        ic.addBlob("attachments", JSON.stringify(self.attachments)).AESEncrypt("attachments", "k", "attachmentscip", true, undefined, "utf8");
        self.attachments = ic.get("attachmentscip");
      }

      if (self.header.nickname) {
        ic.addBlob("nname", self.header.nickname).AESEncrypt("nname", "k", "nnamecip", true);
        self.header.nickname = ic.get("nnamecip");
      }

      self.body = ic.get("bodycip");
    }
  }, {
    key: "encryptPrivateMessage",
    value: function encryptPrivateMessage(keys) {
      var self = this;
      var ic = new iCrypto();
      ic.sym.createKey("sym").addBlob("body", self.body).AESEncrypt("body", "sym", "bodycip", true, "CBC", 'utf8');

      if (self.header.nickname) {
        ic.addBlob("nname", self.header.nickname).AESEncrypt("nname", "sym", "nnamecip", true);
        self.header.nickname = ic.get("nnamecip");
      }

      self.body = ic.get("bodycip");
      self.header.keys = {};
      self.header.private = true;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;
          var icn = new iCrypto();
          icn.asym.setKey("pubk", key, "public").addBlob("sym", ic.get("sym")).asym.encrypt("sym", "pubk", "symcip", "hex").getPublicKeyFingerprint("pubk", "pkfp");
          self.header.keys[icn.get("pkfp")] = icn.get("symcip");
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "decryptPrivateMessage",
    value: function decryptPrivateMessage(privateKey) {
      try {
        var ic = new iCrypto();
        ic.asym.setKey("priv", privateKey, "private").publicFromPrivate("priv", "pub").getPublicKeyFingerprint("pub", "pkfp").addBlob("symcip", this.header.keys[ic.get("pkfp")]).asym.decrypt("symcip", "priv", "sym", "hex").addBlob("bodycip", this.body).sym.decrypt("bodycip", "sym", "body", true);
        this.body = ic.get("body");

        if (this.header.nickname) {
          ic.addBlob("nnamecip", this.header.nickname).AESDecrypt("nnamecip", "sym", "nname", true);
          this.header.nickname = ic.get("nname");
        }
      } catch (err) {
        console.log("Error decrypting private message: " + err);
      }
    }
    /**
     * Decrypts body and replaces the cipher with raw text
     * @param key
     */

  }, {
    key: "decryptMessage",
    value: function decryptMessage(key) {
      try {
        var ic = new iCrypto();
        ic.sym.setKey("k", key).addBlob("bodycip", this.body).sym.decrypt("bodycip", "k", "body", true);
        this.body = ic.get("body");

        if (this.attachments) {
          ic.addBlob("attachmentscip", this.attachments).AESDecrypt("attachmentscip", "k", "attachments", true);
          this.attachments = JSON.parse(ic.get("attachments"));
        }

        if (this.header.nickname) {
          ic.addBlob("nnamecip", this.header.nickname).AESDecrypt("nnamecip", "k", "nname", true);
          this.header.nickname = ic.get("nname");
        }
      } catch (err) {
        console.log("Error decrypting message: " + err);
      }
    }
    /**
     * Adds attachment metadata to the message
     * @param {Attachment} attachment
     */

  }, {
    key: "addAttachmentInfo",
    value: function addAttachmentInfo(attachment) {
      var self = this;

      if (!self.attachments) {
        self.attachments = [];
      }

      AttachmentInfo.verifyFileInfo(attachment);
      self.attachments.push(attachment);
    }
  }, {
    key: "sign",
    value: function sign(privateKey) {
      var ic = new iCrypto();
      var requestString = JSON.stringify(this.header) + JSON.stringify(this.body);

      if (this.attachments) {
        requestString += JSON.stringify(this.attachments);
      }

      ic.addBlob("body", requestString).setRSAKey("priv", privateKey, "private").privateKeySign("body", "priv", "sign");
      this.signature = ic.get("sign");
    }
  }, {
    key: "verify",
    value: function verify(publicKey) {
      var ic = new iCrypto();
      var requestString = JSON.stringify(this.header) + JSON.stringify(this.body);

      if (this.attachments) {
        requestString += JSON.stringify(this.attachments);
      }

      ic.setRSAKey("pubk", publicKey, "public").addBlob("sign", this.signature).addBlob("b", requestString).publicKeyVerify("b", "sign", "pubk", "v");
      return ic.get("v");
    }
  }, {
    key: "getNonce",
    value: function getNonce(size) {
      var ic = new iCrypto();
      ic.createNonce("n", size ? parseInt(size) : 8).bytesToHex("n", "nh");
      return ic.get("nh");
    }
  }, {
    key: "generateNewID",
    value: function generateNewID() {
      return this.getNonce(8);
    }
  }, {
    key: "toBlob",
    value: function toBlob() {
      return JSON.stringify(this);
    }
  }]);

  return ChatMessage;
}();
// CONCATENATED MODULE: ./src/js/chat/ChatUtility.js


var ChatUtility_ChatUtility =
/*#__PURE__*/
function () {
  function ChatUtility() {
    classCallCheck_default()(this, ChatUtility);
  }

  createClass_default()(ChatUtility, null, [{
    key: "decryptStandardMessage",

    /**
     * Standard message referred to string of form [payload] + [sym key cipher] + [const length sym key length encoded]
     * All messages in the system encrypted and decrypted in the described way except for chat messages files and streams.
     * Sym key generated randomly every time
     * @param blob - cipher blob
     * @param lengthSymLengthEncoded number of digits used to encode length of the sym key
     * @param privateKey
     * @returns {}
     */
    value: function decryptStandardMessage() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
      var privateKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
      var lengthSymLengthEncoded = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
      var symKeyLength = parseInt(blob.substr(blob.length - lengthSymLengthEncoded));
      var symKeyCipher = blob.substring(blob.length - lengthSymLengthEncoded - symKeyLength, blob.length - lengthSymLengthEncoded);
      var payloadCipher = blob.substring(0, blob.length - lengthSymLengthEncoded - symKeyLength);
      var ic = new iCrypto();
      ic.addBlob("blobcip", payloadCipher).addBlob("symkcip", symKeyCipher).asym.setKey("privk", privateKey, "private").privateKeyDecrypt("symkcip", "privk", "symk", "hex").AESDecrypt("blobcip", "symk", "blob-raw", true, "CBC", "utf8");
      return ic.get("blob-raw");
    }
  }, {
    key: "encryptStandardMessage",
    value: function encryptStandardMessage() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
      var publicKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
      var lengthSymLengthEncoded = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
      var ic = new iCrypto();
      ic.sym.createKey("symk").addBlob("payload", blob).asym.setKey("pubk", publicKey, "public").sym.encrypt("payload", "symk", "blobcip", true, "CBC", "utf8").asym.encrypt("symk", "pubk", "symcip", "hex").encodeBlobLength("symcip", lengthSymLengthEncoded, "0", "symciplength").merge(["blobcip", "symcip", "symciplength"], "res");
      return ic.get("res");
    }
  }, {
    key: "publicKeyEncrypt",
    value: function publicKeyEncrypt() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Err.required();
      var publicKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Err.required();
      var ic = new iCrypto();
      ic.addBlob("blob", blob).asym.setKey("pubk", publicKey, "public").publicKeyEncrypt("blob", "pubk", "blobcip", "hex");
      return ic.get("blobcip");
    }
  }, {
    key: "privateKeyDecrypt",
    value: function privateKeyDecrypt(blob, privateKey) {
      var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "hex";
      var ic = new iCrypto();
      ic.addBlob("blobcip", blob).asym.setKey("priv", privateKey, "private").privateKeyDecrypt("blobcip", "priv", "blob", encoding);
      return ic.get("blob");
    }
  }, {
    key: "symKeyEncrypt",
    value: function symKeyEncrypt(blob, key) {
      var hexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var ic = new iCrypto();
      ic.addBlob("b", blob).sym.setKey("sym", key).AESEncrypt("b", "sym", "cip", hexify, "CBC", "utf8");
      return ic.get("cip");
    }
  }, {
    key: "symKeyDecrypt",
    value: function symKeyDecrypt(cip, key) {
      var dehexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var ic = new iCrypto();
      ic.addBlob("cip", cip).sym.setKey("sym", key).AESDecrypt("cip", "sym", "b", dehexify, "CBC", "utf8");
      return ic.get("b");
    }
  }]);

  return ChatUtility;
}();
// CONCATENATED MODULE: ./src/js/chat/Invite.js


var Invite_Invite =
/*#__PURE__*/
function () {
  createClass_default()(Invite, null, [{
    key: "objectValid",
    value: function objectValid(obj) {
      if (typeof obj === "string") {
        return false;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Invite.properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var i = _step.value;

          if (!obj.hasOwnProperty(i)) {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return true;
    }
  }, {
    key: "decryptInvite",
    value: function decryptInvite(cipher, privateKey) {
      var symLengthEncoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
      var ic = new iCrypto();
      var symlength = parseInt(cipher.substr(cipher.length - symLengthEncoding));
      var symkcip = cipher.substring(cipher.length - symlength - symLengthEncoding, cipher.length - symLengthEncoding);
      var payloadcip = cipher.substring(0, cipher.length - symlength - symLengthEncoding);
      ic.addBlob("symciphex", symkcip).hexToBytes("symciphex", "symcip").addBlob("plcip", payloadcip).setRSAKey("privk", privateKey, "private").privateKeyDecrypt("symcip", "privk", "sym").AESDecrypt("plcip", "sym", "pl", true);
      return JSON.parse(ic.get("pl"));
    }
  }, {
    key: "setInviteeName",
    value: function setInviteeName(invite, name) {
      invite.inviteeName = name;
    }
  }]);

  function Invite() {
    var onionAddress = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.pRequired();
    var pubKeyFingerprint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.pRequired();
    var hsPrivateKey = arguments.length > 2 ? arguments[2] : undefined;

    classCallCheck_default()(this, Invite);

    var ic = new iCrypto();
    ic.createNonce("n").bytesToHex("n", "id");
    this.set('onionAddress', onionAddress);
    this.set('pkfp', pubKeyFingerprint);
    this.set('inviteID', ic.get('id'));

    if (hsPrivateKey) {
      var _ic = new iCrypto();

      _ic.setRSAKey("k", hsPrivateKey, "private");

      this.hsPrivateKey = _ic.get("k");
    }
  }

  createClass_default()(Invite, [{
    key: "toBlob",
    value: function toBlob(encoding) {
      var result = this.get("onionAddress") + "/" + this.get("pkfp") + "/" + this.get("inviteID");

      if (encoding) {
        var ic = new iCrypto();

        if (!ic.encoders.hasOwnProperty(encoding)) {
          throw "WRONG ENCODING";
        }

        ic.addBlob("b", result).encode("b", encoding, "bencoded");
        result = ic.get("bencoded");
      }

      return result;
    }
  }, {
    key: "stringifyAndEncrypt",
    value: function stringifyAndEncrypt(publicKey) {
      if (!publicKey || !Invite.objectValid(this)) {
        throw "Error at stringifyAndEncrypt: the object is invalid or public key is not provided";
      }

      var ic = new iCrypto();
      var invite = {
        inviteCode: this.toBlob("base64"),
        hsPrivateKey: this.hsPrivateKey
      };

      if (this.inviteeName) {
        invite.inviteeName = this.inviteeName;
      }

      ic.addBlob("invite", JSON.stringify(invite)).sym.createKey("sym").setRSAKey("pubk", publicKey, "public").AESEncrypt("invite", "sym", "invitecip", true).publicKeyEncrypt("sym", "pubk", "symcip", "hex").encodeBlobLength("symcip", 4, "0", "symlength").merge(["invitecip", "symcip", "symlength"], "res");
      return ic.get("res");
    }
  }, {
    key: "get",
    value: function get(name) {
      if (this.keyExists(name)) return this[name];
      throw "Property not found";
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (!Invite.properties.includes(name)) {
        throw 'Invite: invalid property "' + name + '"';
      }

      this[name] = value;
    }
  }, {
    key: "keyExists",
    value: function keyExists(key) {
      if (!key) throw "keyExists: Missing required arguments";
      return Object.keys(this).includes(key.toString());
    }
  }, {
    key: "pRequired",
    value: function pRequired() {
      var functionName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Invite";
      throw functionName + ": missing required parameter!";
    }
  }], [{
    key: "constructFromExisting",
    value: function constructFromExisting(invite) {
      var ic = new iCrypto();
      ic.addBlob("i", invite.inviteCode).base64Decode("i", "ir");
      var onion = ic.get("ir").split("/")[0];
      var newInvite = new Invite(onion, chat.session.publicKeyFingerprint, invite.hsPrivateKey);
      newInvite.set('inviteID', invite.inviteID);
      return newInvite;
    }
  }]);

  return Invite;
}();
Invite_Invite.properties = ["onionAddress", "hsPrivateKey", "pkfp", "inviteID"];
// CONCATENATED MODULE: ./src/js/chat/Message.js



/**
 *
 *
 * Possible headers:
 *  command: used mainly between browser and island
 *  response: island response to browser. This is an arbitrary string by which
 *         sender identifies the outcome of the request. Can be an error code like login_error
 *  error: error message if something goes wrong it should be set. If it is set -
 *              the response treated as an error code
 *  pkfpSource: public key fingerprint of the sender
 *  pkfpDest: public key fingerprint of the recipient
 *
 *
 */
var Message_Message =
/*#__PURE__*/
function () {
  function Message(request) {
    classCallCheck_default()(this, Message);

    if (typeof request === "string") {
      request = JSON.parse(request);
    }

    this.headers = request ? this.copyHeaders(request.headers) : {
      command: "",
      response: ""
    };
    this.body = request ? request.body : {};
    this.signature = request ? request.signature : "";
  }

  createClass_default()(Message, [{
    key: "setError",
    value: function setError(error) {
      this.headers.error = error || "Unknown error";
    }
  }, {
    key: "setResponse",
    value: function setResponse(response) {
      this.headers.response = response;
    }
  }, {
    key: "copyHeaders",
    value: function copyHeaders(headers) {
      var result = {};
      var keys = Object.keys(headers);

      for (var i = 0; i < keys.length; ++i) {
        result[keys[i]] = headers[keys[i]];
      }

      return result;
    }
  }, {
    key: "signMessage",
    value: function signMessage(privateKey) {
      var ic = new iCrypto();
      var requestString = JSON.stringify(this.headers) + JSON.stringify(this.body);
      ic.addBlob("body", requestString).setRSAKey("priv", privateKey, "private").privateKeySign("body", "priv", "sign");
      this.signature = ic.get("sign");
    }
  }, {
    key: "setSource",
    value: function setSource(pkfp) {
      this.headers.pkfpSource = pkfp;
    }
  }, {
    key: "setDest",
    value: function setDest(pkfp) {
      this.headers.pkfpDest = pkfp;
    }
  }, {
    key: "setCommand",
    value: function setCommand(command) {
      this.headers.command = command;
    }
  }, {
    key: "addNonce",
    value: function addNonce() {
      var ic = new iCrypto();
      ic.createNonce("n").bytesToHex("n", "nhex");
      this.headers.nonce = ic.get("nhex");
    }
  }, {
    key: "get",
    value: function get(name) {
      if (this.keyExists(name)) return this[name];
      throw "Property not found";
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (!Message.properties.includes(name)) {
        throw 'Invite: invalid property "' + name + '"';
      }

      this[name] = value;
    }
  }], [{
    key: "verifyMessage",
    value: function verifyMessage(publicKey, message) {
      var ic = new iCrypto();
      var requestString = JSON.stringify(message.headers) + JSON.stringify(message.body);
      ic.setRSAKey("pubk", publicKey, "public").addBlob("sign", message.signature).hexToBytes('sign', "signraw").addBlob("b", requestString);
      ic.publicKeyVerify("b", "sign", "pubk", "v");
      return ic.get("v");
    }
  }]);

  return Message;
}();
Message_Message.properties = ["headers", "body", "signature"];
// CONCATENATED MODULE: ./src/js/chat/Metadata.js


var Metadata_Metadata =
/*#__PURE__*/
function () {
  function Metadata() {
    classCallCheck_default()(this, Metadata);
  }

  createClass_default()(Metadata, null, [{
    key: "parseMetadata",
    value: function parseMetadata(blob) {
      if (typeof blob === "string") {
        return JSON.parse(blob);
      } else {
        return blob;
      }
    }
  }, {
    key: "extractSharedKey",
    value: function extractSharedKey(pkfp, privateKey, metadata) {
      var keyCipher = metadata.body.participants[pkfp].key;
      var ic = new iCrypto();
      ic.addBlob("symcip", keyCipher).asym.setKey("priv", privateKey, "private").asym.decrypt("symcip", "priv", "sym", "hex");
      return ic.get("sym");
    }
  }, {
    key: "isMetadataValid",
    value: function isMetadataValid(metadata, taPublicKey) {}
  }]);

  return Metadata;
}();
// CONCATENATED MODULE: ./src/js/chat/Participant.js


var Participant_Participant =
/*#__PURE__*/
function () {
  createClass_default()(Participant, null, [{
    key: "objectValid",
    value: function objectValid(obj) {
      if (typeof obj === "string") {
        return false;
      }

      for (var i = 0; i < Participant.properties.length; ++i) {
        if (!obj.hasOwnProperty(Participant.properties[i])) {
          return false;
        }
      }

      return Object.keys(obj).length === Participant.properties.length;
    }
  }]);

  function Participant(blob) {
    classCallCheck_default()(this, Participant);

    if (blob) {
      this.parseBlob(blob);
    }
  }

  createClass_default()(Participant, [{
    key: "toBlob",
    value: function toBlob() {
      var stringify = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!this.readyForExport()) {
        throw "Object participant has some properties uninitialized";
      }

      var result = {};

      for (var i = 0; i < Participant.properties.length; ++i) {
        var key = Participant.properties[i];
        var value = this[Participant.properties[i]];
        console.log("Key: " + key + "; Value: " + value);
        result[Participant.properties[i]] = this[Participant.properties[i]];
      }

      return stringify ? JSON.stringify(result) : result;
    }
  }, {
    key: "parseBlob",
    value: function parseBlob(blob) {
      if (!blob) {
        throw "missing required parameter";
      }

      if (typeof blob === "string") {
        blob = JSON.parse(blob);
      }

      if (!this.objectValid(blob)) {
        throw "Participant blob is invalid";
      }

      for (var i = 0; i < Participant.properties.length; ++i) {
        this[Participant.properties[i]] = blob[Participant.properties[i]];
      }
    }
  }, {
    key: "keyExists",
    value: function keyExists(key) {
      if (!key) throw "keyExists: Missing required arguments";
      return Object.keys(this).includes(key.toString());
    }
  }, {
    key: "readyForExport",
    value: function readyForExport() {
      for (var i = 0; i < Participant.properties; ++i) {
        if (!this[Participant.properties[i]]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "get",
    value: function get(name) {
      if (this.keyExists(name)) return this[name];
      throw "Property not found";
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (!Participant.properties.includes(name)) {
        throw 'Participant: invalid property "' + name + '"';
      }

      this[name] = value;
    }
  }]);

  return Participant;
}();
Participant_Participant.properties = ["nickname", "publicKey", "publicKeyFingerprint", "residence", "rights"];
// CONCATENATED MODULE: ./src/js/chat/AttachmentInfo.js



/**
 * Implements files attachments functionality
 * Constructor accepts a file element
 */
var AttachmentInfo_AttachmentInfo =
/*#__PURE__*/
function () {
  function AttachmentInfo(file, onion, pkfp, metaID, privKey, messageID, hashEncrypted, hashUnencrypted) {
    var hashAlgo = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : "sha256";

    classCallCheck_default()(this, AttachmentInfo);

    var self = this;
    self.name = file.name;
    self.size = file.size;
    self.type = file.type;
    self.lastModified = file.lastModified;
    self.pkfp = pkfp;
    self.metaID = metaID;
    self.hashAlgorithm = hashAlgo;
    self.messageID = messageID;
    self.hashEncrypted = hashEncrypted;
    self.hashUnencrypted = hashUnencrypted;
    self.link = self.buildLink(onion, pkfp, self.hashUnencrypted);
    self.signHashes(privKey);
  }

  createClass_default()(AttachmentInfo, [{
    key: "get",
    value: function get() {
      var self = this;
      return {
        name: self.name,
        size: self.size,
        type: self.type,
        lastModified: self.lastModified,
        pkfp: self.pkfp,
        hashEncrypted: self.hashEncrypted,
        hashUnencrypted: self.hashUnencrypted,
        signEncrypted: self.signEncrypted,
        signUnencrypted: self.signUnencrypted,
        metaID: self.metaID,
        messageID: self.messageID,
        link: self.link,
        hashAlgorithm: self.hashAlgorithm
      };
    }
  }, {
    key: "getLink",
    value: function getLink() {
      return this.link;
    }
  }, {
    key: "buildLink",
    value: function buildLink(onion, pkfp, hash) {
      if (!onion || !pkfp || !hash) {
        throw "Attachment buildLink: missing required parameters";
      }

      var rawLink = onion + "/" + pkfp + "/" + hash;
      var ic = new iCrypto();
      ic.addBlob("l", rawLink).base64Encode("l", "l64");
      return ic.get("l64");
    }
  }, {
    key: "signHashes",
    value: function signHashes(privKey) {
      if (!privKey) {
        throw "Attachment signAttachmentHash: privKey is undefined";
      }

      var self = this;
      var ic = new iCrypto();
      ic.addBlob("hu", self.hashUnencrypted).addBlob("he", self.hashEncrypted).asym.setKey("pk", privKey, "private").asym.sign("hu", "pk", "sign_u").asym.sign("he", "pk", "sign_e");
      self.signUnencrypted = ic.get("sign_u");
      self.signEncrypted = ic.get("sign_e");
    }
  }], [{
    key: "verifyFileInfo",
    value: function verifyFileInfo(info) {
      var required = ["name", "size", "pkfp", "hashUnencrypted", "hashEncrypted", "signUnencrypted", "signEncrypted", "link", "metaID", "messageID", "hashAlgorithm"];

      for (var _i = 0; _i < required.length; _i++) {
        var i = required[_i];

        if (!info.hasOwnProperty(i)) {
          throw "Attachment verifyFileInfo: Missing required property: " + i;
        }
      }
    }
  }, {
    key: "parseLink",
    value: function parseLink(link) {
      var ic = new iCrypto();
      ic.addBlob("l", link).base64Decode("l", "lres");
      var elements = ic.get("lres").split("/");
      return {
        residence: elements[0],
        pkfp: elements[1],
        name: elements[2]
      };
    }
  }]);

  return AttachmentInfo;
}();
AttachmentInfo_AttachmentInfo.properties = ["name", "size", "type", "lastModified", "hashUnencrypted", "signUnencrypted", "hashEncrytped", "signEncrypted", "link", "metaID", "messageID", "hashAlgorithm"];
// CONCATENATED MODULE: ./src/js/chat/ClientSettings.js

var ClientSettings_ClientSettings = function ClientSettings() {
  classCallCheck_default()(this, ClientSettings);

  this.nicknames = {};
  this.invites = {};
};
// CONCATENATED MODULE: ./src/js/chat/ChatClient.js














var ChatClient_ChatClient =
/*#__PURE__*/
function () {
  function ChatClient(opts) {
    classCallCheck_default()(this, ChatClient);

    this.islandConnectionStatus = false;
    this.allMessagesLoaded = false;
    this.chatSocket = null;
    this.fileSocket = null;
    this.session = null; //can be "active", "off"

    this.newTopicPending = {};
    this.pendingTopicJoins = {};
    this.outgoingMessageQueue = {};
    this.attachmentsUploadQueue = {};
    this.setClientHandlers();
    WildEmitter.mixin(this);
  }
  /*************************************************************
   * =====  Request Response and Notidication processing ======*
   *************************************************************/


  createClass_default()(ChatClient, [{
    key: "setClientHandlers",
    value: function setClientHandlers() {
      this.responseHandlers = {
        init_topic_get_token_success: this.initTopicContinueAfterTokenReceived,
        init_topic_success: this.initTopicSuccess,
        login_decryption_required: this.loginDecryptData,
        join_topic_success: this.notifyJoinSuccess,
        login_success: this.finalizeLogin,
        update_settings_success: this.onSuccessfullSettingsUpdate,
        load_more_messages_success: this.loadMoreMessagesSuccess,
        request_invite_success: this.processInviteCreated,
        request_invite_error: this.requestInviteError,
        sync_invites_success: this.syncInvitesSuccess,
        save_invite_success: this.saveInviteSuccess,
        update_invite_success: this.updateInviteSuccess,
        send_success: this.messageSendSuccess,
        del_invite_success: this.delInviteSuccess,
        boot_participant_failed: this.bootParticipantFailed,
        send_fail: this.messageSendFail,
        default: this.processInvalidResponse
      };
      this.serviceMessageHandlers = {
        metadata_issue: this.processMetadataUpdate,
        meta_sync: this.processMetadataUpdate,
        u_booted: this.uWereBooted,
        whats_your_name: this.processNicknameRequest,
        my_name_response: this.processNicknameResponse,
        nickname_change_broadcast: this.processNicknameChangeNote,
        default: this.processUnknownNote
      };
      this.messageHandlers = {
        shout_message: this.processIncomingMessage,
        whisper_message: this.processIncomingMessage
      };
      this.requestHandlers = {
        new_member_joined: this.processNewMemberJoined
      };
      this.requestErrorHandlers = {
        login_error: this.loginFail,
        init_topic_error: this.initTopicFail,
        request_invite_error: this.requestInviteError,
        sync_invites_error: this.syncInvitesError,
        default: this.unknownError
      };
    }
  }, {
    key: "processServiceMessage",
    value: function processServiceMessage(message) {
      this.serviceMessageHandlers.hasOwnProperty(message.headers.command) ? this.serviceMessageHandlers[message.headers.command](message, this) : this.serviceMessageHandlers.default(message, this);
    }
  }, {
    key: "processServiceRecord",
    value: function processServiceRecord(record, self) {
      //TODO decrypt body
      console.log("New service record arrived!");
      record.body = ChatUtility_ChatUtility.decryptStandardMessage(record.body, self.session.privateKey);
      self.emit("service_record", record);
    }
  }, {
    key: "processResponse",
    value: function processResponse(response) {
      response = new Message_Message(response);

      if (response.headers.error) {
        this.requestErrorHandlers.hasOwnProperty(response.headers.response) ? this.requestErrorHandlers[response.headers.response](response, this) : this.requestErrorHandlers.default(response, this);
        return;
      }

      this.responseHandlers.hasOwnProperty(response.headers.response) ? this.responseHandlers[response.headers.response](response, this) : this.responseHandlers.default(response, this);
    }
  }, {
    key: "processRequest",
    value: function processRequest(request) {
      this.requestHandlers.hasOwnProperty(request.headers.command) ? this.requestHandlers[request.headers.command](request, this) : this.requestErrorHandlers.default(request, this);
    }
    /**
     * Processes unknown note
     * @param note
     * @param self
     */

  }, {
    key: "processUnknownNote",
    value: function processUnknownNote(note, self) {
      console.log("UNKNOWN NOTE RECEIVED!\n" + JSON.stringify(note));
      self.emit("unknown_note", note);
    }
    /**************************************************
     * ======  TOPIC LOGIN AND REGISTRATION ==========*
     **************************************************/

    /**
     * Called initially on topic creation
     * @param {String} nickname
     * @returns {Promise<any>}
     */

  }, {
    key: "initTopic",
    value: function initTopic(nickname, topicName) {
      var _this = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee(resolve, reject) {
          var _self, ic, newTopic, request, body;

          return regenerator_default.a.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _self = _this;
                  nickname = String(nickname).trim();

                  if (!(!nickname || nickname.length < 3)) {
                    _context.next = 6;
                    break;
                  }

                  reject("Nickname entered is invalid");
                  return _context.abrupt("return");

                case 6:
                  //CREATE NEW TOPIC PENDING
                  ic = new iCrypto(); //Generate keypairs one for user, other for topic

                  _context.next = 9;
                  return ic.asym.asyncCreateKeyPair('owner-keys');

                case 9:
                  ic = _context.sent;
                  _context.next = 12;
                  return ic.asym.asyncCreateKeyPair('topic-keys');

                case 12:
                  ic = _context.sent;
                  ic.getPublicKeyFingerprint("owner-keys", "owner-pkfp");
                  ic.getPublicKeyFingerprint("topic-keys", "topic-pkfp");
                  newTopic = {
                    ownerKeyPair: ic.get("owner-keys"),
                    topicKeyPair: ic.get("topic-keys"),
                    ownerPkfp: ic.get("owner-pkfp"),
                    topicID: ic.get("topic-pkfp"),
                    ownerNickName: nickname,
                    topicName: topicName
                  }; //Request island to init topic creation and get one-time key.

                  request = new Message_Message();
                  request.headers.command = "new_topic_get_token";
                  body = {
                    topicID: newTopic.topicID,
                    ownerPublicKey: ic.get('owner-keys').publicKey
                  };
                  request.set("body", body);
                  _self.newTopicPending[newTopic.topicID] = newTopic;
                  _context.next = 23;
                  return _this.establishIslandConnection();

                case 23:
                  _this.chatSocket.emit("request", request);

                  resolve();
                  _context.next = 30;
                  break;

                case 27:
                  _context.prev = 27;
                  _context.t0 = _context["catch"](0);
                  throw _context.t0;

                case 30:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this, [[0, 27]]);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
    /**
     * New token on init topic received. Proceeding with topic creation
     * @param response
     * @param self
     */

  }, {
    key: "initTopicContinueAfterTokenReceived",
    value: function initTopicContinueAfterTokenReceived(response, self) {
      console.log("Token received, continuing creating topic");
      var pendingTopic = self.newTopicPending[response.body.topicID];
      var token = response.body.token; // Token is 1-time disposable public key generated by server
      //Forming request

      var newTopicData = {
        topicKeyPair: pendingTopic.topicKeyPair,
        ownerPublicKey: pendingTopic.ownerKeyPair.publicKey
      };
      var newTopicDataCipher = ChatUtility_ChatUtility.encryptStandardMessage(JSON.stringify(newTopicData), token); //initializing topic settings

      var settings = self.prepareNewTopicSettings(pendingTopic.ownerNickName, pendingTopic.topicName, pendingTopic.ownerKeyPair.publicKey); //Preparing request

      var request = new Message_Message();
      request.headers.command = "init_topic";
      request.headers.pkfpSource = pendingTopic.ownerPkfp;
      request.body.topicID = pendingTopic.topicID;
      request.body.settings = settings;
      request.body.ownerPublicKey = pendingTopic.ownerKeyPair.publicKey;
      request.body.newTopicData = newTopicDataCipher; //Sending request

      self.chatSocket.emit("request", request);
    }
  }, {
    key: "prepareNewTopicSettings",
    value: function prepareNewTopicSettings(nickname, topicName, publicKey) {
      var encrypt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      //Creating and encrypting topic settings:
      var settings = {
        membersData: {},
        soundsOn: true
      };

      if (nickname) {
        var ic = new iCrypto();
        ic.asym.setKey("pubk", publicKey, "public").getPublicKeyFingerprint("pubk", "pkfp");
        settings.nickname = nickname;
        settings.membersData[ic.get("pkfp")] = {
          nickname: nickname
        };
      }

      if (topicName) {
        settings.topicName = topicName;
      }

      if (encrypt) {
        return ChatUtility_ChatUtility.encryptStandardMessage(JSON.stringify(settings), publicKey);
      } else {
        return settings;
      }
    }
  }, {
    key: "initTopicSuccess",
    value: function initTopicSuccess(request, self) {
      var data = self.newTopicPending[request.body.topicID];
      var pkfp = data.pkfp;
      var privateKey = data.privateKey;
      var nickname = data.nickname;
      self.emit("init_topic_success", {
        pkfp: data.ownerPkfp,
        nickname: data.ownerNickName,
        privateKey: data.ownerKeyPair.privateKey
      });
      delete self.newTopicPending[request.body.topicID];
    }
  }, {
    key: "topicLogin",
    value: function () {
      var _topicLogin = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee2(privateKey) {
        var success, error, ic, body, request;
        return regenerator_default.a.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                success = true;
                privateKey = String(privateKey).trim();

                if (!(this.session && this.session.status === "active" && this.islandConnectionStatus)) {
                  _context2.next = 5;
                  break;
                }

                this.emit("login_success");
                return _context2.abrupt("return");

              case 5:
                _context2.prev = 5;
                _context2.next = 8;
                return this.establishIslandConnection();

              case 8:
                ic = new iCrypto();
                ic.setRSAKey('pk', privateKey, "private").publicFromPrivate('pk', 'pub').getPublicKeyFingerprint('pub', 'pkfp').createNonce('nonce').bytesToHex('nonce', "noncehex");
                this.session = {
                  sessionID: ic.get("noncehex"),
                  publicKey: ic.get("pub"),
                  privateKey: ic.get('pk'),
                  publicKeyFingerprint: ic.get("pkfp"),
                  status: 'off'
                };
                body = {
                  publicKey: ic.get("pub"),
                  sessionID: ic.get("noncehex")
                };
                request = new Message_Message();
                request.set("body", body);
                request.headers.command = "init_login";
                request.headers.pkfpSource = ic.get("pkfp");
                request.signMessage(ic.get("pk"));
                this.chatSocket.emit("request", request);
                _context2.next = 24;
                break;

              case 20:
                _context2.prev = 20;
                _context2.t0 = _context2["catch"](5);
                success = false;
                error = _context2.t0.message;

              case 24:
                if (success) {
                  _context2.next = 36;
                  break;
                }

                _context2.prev = 25;
                _context2.next = 28;
                return this.terminateIslandConnection();

              case 28:
                _context2.next = 33;
                break;

              case 30:
                _context2.prev = 30;
                _context2.t1 = _context2["catch"](25);
                console.log("ERROR terminating island connection: " + _context2.t1);

              case 33:
                _context2.prev = 33;
                this.emit("login_fail", error);
                return _context2.finish(33);

              case 36:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[5, 20], [25, 30, 33, 36]]);
      }));

      function topicLogin(_x3) {
        return _topicLogin.apply(this, arguments);
      }

      return topicLogin;
    }()
    /**
     * Islnad request to decrypt data while logging in
     * data must be in request.body.loginData and it can contain
     *    clientHSPrivateKey,
     *    TAprivateKey
     *    TAHSPrivateKey
     *
     * @param response
     * @param self
     */

  }, {
    key: "loginDecryptData",
    value: function loginDecryptData(request, self) {
      var decryptBlob = function decryptBlob(privateKey, blob) {
        var lengthChars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
        var icn = new iCrypto();
        var symLength = parseInt(blob.substr(-lengthChars));
        var blobLength = blob.length;
        var symk = blob.substring(blobLength - symLength - lengthChars, blobLength - lengthChars);
        var cipher = blob.substring(0, blobLength - symLength - lengthChars);
        icn.addBlob("symcip", symk).addBlob("cipher", cipher).asym.setKey("priv", privateKey, "private").asym.decrypt("symcip", "priv", "sym", "hex").sym.decrypt("cipher", "sym", "blob-raw", true);
        return icn.get("blob-raw");
      };

      var encryptBlob = function encryptBlob(publicKey, blob) {
        var lengthChars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
        var icn = new iCrypto();
        icn.createSYMKey("sym").asym.setKey("pub", publicKey, "public").addBlob("blob-raw", blob).sym.encrypt("blob-raw", "sym", "blob-cip", true).asym.encrypt("sym", "pub", "symcip", "hex").encodeBlobLength("symcip", 4, "0", "symcipl").merge(["blob-cip", "symcip", "symcipl"], "res");
        return icn.get("res");
      };

      if (!self.session) {
        console.log("invalid island request");
        return;
      }

      var clientHSPrivateKey, taPrivateKey, taHSPrivateKey;
      var token = request.body.token;
      var loginData = request.body.dataForDecryption;
      var ic = new iCrypto();
      ic.asym.setKey("priv", self.session.privateKey, "private"); //Decrypting client Hidden service key

      if (loginData.clientHSPrivateKey) {
        clientHSPrivateKey = decryptBlob(self.session.privateKey, loginData.clientHSPrivateKey);
      }

      if (loginData.topicAuthority && loginData.topicAuthority.taPrivateKey) {
        taPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taPrivateKey);
      }

      if (loginData.topicAuthority && loginData.topicAuthority.taHSPrivateKey) {
        taHSPrivateKey = decryptBlob(self.session.privateKey, loginData.topicAuthority.taHSPrivateKey);
      }

      var preDecrypted = {};

      if (clientHSPrivateKey) {
        preDecrypted.clientHSPrivateKey = encryptBlob(token, clientHSPrivateKey);
      }

      if (taPrivateKey || taHSPrivateKey) {
        preDecrypted.topicAuthority = {};
      }

      if (taPrivateKey) {
        preDecrypted.topicAuthority.taPrivateKey = encryptBlob(token, taPrivateKey);
      }

      if (taHSPrivateKey) {
        preDecrypted.topicAuthority.taHSPrivateKey = encryptBlob(token, taHSPrivateKey);
      }

      var decReq = new Message_Message();
      decReq.headers.pkfpSource = self.session.publicKeyFingerprint;
      decReq.body = request.body;
      decReq.body.preDecrypted = preDecrypted;
      decReq.headers.command = "login_decrypted_continue";
      decReq.signMessage(self.session.privateKey);
      console.log("Decryption successfull. Sending data back to Island");
      self.chatSocket.emit("request", decReq);
    }
  }, {
    key: "finalizeLogin",
    value: function finalizeLogin(response, self) {
      var metadata = Metadata_Metadata.parseMetadata(response.body.metadata);
      var sharedKey = Metadata_Metadata.extractSharedKey(self.session.publicKeyFingerprint, self.session.privateKey, metadata);
      var messages = self.decryptMessagesOnMessageLoad(response.body.messages);
      var settings = metadata.body.settings ? metadata.body.settings : {};
      self.session.status = "active";
      self.session.metadata = metadata.body;
      self.session.metadata.sharedKey = sharedKey;
      self.session.metadataSignature = metadata.signature;
      self.session.settings = JSON.parse(ChatUtility_ChatUtility.decryptStandardMessage(settings, self.session.privateKey));
      self.emit("login_success", messages);
      self.checkNicknames();
    }
  }, {
    key: "checkNicknames",
    value: function checkNicknames() {
      var _arr = Object.keys(this.session.metadata.participants);

      for (var _i = 0; _i < _arr.length; _i++) {
        var pkfp = _arr[_i];

        if (!this.getMemberNickname(pkfp)) {
          this.requestNickname(pkfp);
        }
      }
    }
  }, {
    key: "getMemberNickname",
    value: function getMemberNickname(pkfp) {
      if (!this.session || !pkfp) {
        return;
      }

      var membersData = this.session.settings.membersData;

      if (membersData[pkfp]) {
        return membersData[pkfp].nickname;
      }
    }
  }, {
    key: "getMemberAlias",
    value: function getMemberAlias(pkfp) {
      if (!this.session || !pkfp) {
        return;
      }

      var membersData = this.session.settings.membersData;

      if (membersData[pkfp] && membersData[pkfp].alias) {
        return membersData[pkfp].alias;
      } else {
        return pkfp.substring(0, 8);
      }
    }
  }, {
    key: "deleteMemberAlias",
    value: function deleteMemberAlias(pkfp) {
      var membersData = this.session.settings.membersData;

      if (membersData[pkfp]) {
        delete membersData[pkfp].alias;
      }
    }
  }, {
    key: "getMemberRepr",
    value: function getMemberRepr(pkfp) {
      var membersData = this.session.settings.membersData;

      if (membersData[pkfp]) {
        return this.getMemberAlias(pkfp) || this.getMemberNickname(pkfp) || "Anonymous";
      }
    }
  }, {
    key: "deleteMemberData",
    value: function deleteMemberData(pkfp) {
      var membersData = this.session.settings.membersData;
      delete membersData[pkfp];
    }
  }, {
    key: "setMemberNickname",
    value: function setMemberNickname(pkfp, nickname, settings) {
      if (settings) {
        settings.membersData[pkfp] = {
          joined: new Date(),
          nickname: nickname
        };
        return;
      }

      if (!pkfp) {
        throw "Missing required parameter";
      }

      var membersData = this.session.settings.membersData;

      if (!membersData[pkfp]) {
        this.addNewMemberToSettings(pkfp);
      }

      membersData[pkfp].nickname = nickname;
    }
  }, {
    key: "setMemberAlias",
    value: function setMemberAlias(pkfp, alias) {
      if (!pkfp) {
        throw "Missing required parameter";
      }

      if (!this.session) {
        return;
      }

      var membersData = this.session.settings.membersData;

      if (!membersData[pkfp]) {
        membersData[pkfp] = {};
      }

      if (!alias) {
        delete membersData[pkfp].alias;
      } else {
        membersData[pkfp].alias = alias;
      }
    }
  }, {
    key: "requestNickname",
    value: function requestNickname(pkfp) {
      if (!pkfp) {
        throw "Missing required parameter";
      }

      var request = new Message_Message();
      request.setCommand("whats_your_name");
      request.setSource(this.session.publicKeyFingerprint);
      request.setDest(pkfp);
      request.addNonce();
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "broadcastNameChange",
    value: function broadcastNameChange() {
      var self = this;
      var message = new Message_Message();
      message.setCommand("nickname_change_broadcast");
      message.setSource(this.session.publicKeyFingerprint);
      message.addNonce();
      message.body.nickname = ChatUtility_ChatUtility.symKeyEncrypt(self.session.settings.nickname, self.session.metadata.sharedKey);
      message.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", message);
    }
  }, {
    key: "processNicknameResponse",
    value: function processNicknameResponse(request, self) {
      self._processNicknameResponseHelper(request, self);
    }
  }, {
    key: "processNicknameChangeNote",
    value: function processNicknameChangeNote(request, self) {
      self._processNicknameResponseHelper(request, self, true);
    }
  }, {
    key: "_processNicknameResponseHelper",
    value: function _processNicknameResponseHelper(request, self) {
      var broadcast = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      console.log("Got nickname response");
      var publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;

      if (!Message_Message.verifyMessage(publicKey, request)) {
        console.trace("Invalid signature");
        return;
      }

      var existingNickname = self.getMemberNickname(request.headers.pkfpSource);
      var memberRepr = self.getMemberRepr(request.headers.pkfpSource);
      var newNickname = broadcast ? ChatUtility_ChatUtility.symKeyDecrypt(request.body.nickname, self.session.metadata.sharedKey) : ChatUtility_ChatUtility.decryptStandardMessage(request.body.nickname, self.session.privateKey);

      if (newNickname !== existingNickname) {
        self.setMemberNickname(request.headers.pkfpSource, newNickname);
        self.saveClientSettings();

        if (existingNickname && existingNickname !== "") {
          self.createServiceRecordOnMemberNicknameChange(memberRepr, newNickname, request.headers.pkfpSource);
        }
      }
    }
  }, {
    key: "createServiceRecordOnMemberNicknameChange",
    value: function createServiceRecordOnMemberNicknameChange(existingName, newNickname, pkfp) {
      existingName = existingName || "";
      var msg = "Member " + existingName + " (id: " + pkfp + ") changed nickname to: " + newNickname;
      this.createRegisterServiceRecord("member_nickname_change", msg);
    }
  }, {
    key: "createRegisterServiceRecord",
    value: function createRegisterServiceRecord(event, message) {
      var request = new Message_Message();
      request.addNonce();
      request.setSource(this.session.publicKeyFingerprint);
      request.setCommand("register_service_record");
      request.body.event = event;
      request.body.message = ChatUtility_ChatUtility.encryptStandardMessage(message, this.session.publicKey);
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "processNicknameRequest",
    value: function processNicknameRequest(request, self) {
      var parsedRequest = new Message_Message(request);
      var publicKey = self.session.metadata.participants[request.headers.pkfpSource].publicKey;

      if (!Message_Message.verifyMessage(publicKey, parsedRequest)) {
        console.trace("Invalid signature");
        return;
      }

      var response = new Message_Message();
      response.setCommand("my_name_response");
      response.setSource(self.session.publicKeyFingerprint);
      response.setDest(request.headers.pkfpSource);
      response.addNonce();
      response.body.nickname = ChatUtility_ChatUtility.encryptStandardMessage(self.session.settings.nickname, publicKey);
      response.signMessage(self.session.privateKey);
      self.chatSocket.emit("request", response);
    }
  }, {
    key: "addNewMemberToSettings",
    value: function addNewMemberToSettings(pkfp) {
      this.session.settings.membersData[pkfp] = {
        joined: new Date()
      };
    }
  }, {
    key: "attemptReconnection",
    value: function () {
      var _attemptReconnection = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee3() {
        return regenerator_default.a.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.topicLogin(this.session.privateKey);

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function attemptReconnection() {
        return _attemptReconnection.apply(this, arguments);
      }

      return attemptReconnection;
    }()
  }, {
    key: "loadMoreMessages",
    value: function loadMoreMessages(lastLoadedMessageID) {
      if (this.allMessagesLoaded) return;
      var request = new Message_Message();
      request.headers.command = "load_more_messages";
      request.headers.pkfpSource = this.session.publicKeyFingerprint;
      request.body.lastLoadedMessageID = lastLoadedMessageID;
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "loadMoreMessagesSuccess",
    value: function loadMoreMessagesSuccess(response, self) {
      var messages = self.decryptMessagesOnMessageLoad(response.body.lastMessages);
      self.allMessagesLoaded = response.body.lastMessages.allLoaded || self.allMessagesLoaded;
      self.emit("messages_loaded", messages);
    }
  }, {
    key: "decryptMessagesOnMessageLoad",
    value: function decryptMessagesOnMessageLoad(data) {
      var keys = data.keys;
      var metaIDs = Object.keys(keys);

      for (var i = 0; i < metaIDs.length; ++i) {
        var ic = new iCrypto();
        ic.addBlob('k', keys[metaIDs[i]]).hexToBytes("k", "kraw").setRSAKey("priv", this.session.privateKey, "private").privateKeyDecrypt("kraw", "priv", "kdec");
        keys[metaIDs[i]] = ic.get("kdec");
      }

      var messages = data.messages;
      var result = [];

      for (var _i2 = 0; _i2 < messages.length; ++_i2) {
        var message = new ChatMessage_ChatMessage(messages[_i2]);

        if (message.header.service) {
          message.body = ChatUtility_ChatUtility.decryptStandardMessage(message.body, this.session.privateKey);
        } else if (message.header.private) {
          message.decryptPrivateMessage(this.session.privateKey);
        } else {
          message.decryptMessage(keys[message.header.metadataID]);
        }

        result.push(message);
      }

      return result;
    }
  }, {
    key: "logout",
    value: function logout() {
      this.chatSocket.disconnect();
      this.session = null;
      this.allMessagesLoaded = false;
    }
  }, {
    key: "haveIRightsToBoot",
    value: function haveIRightsToBoot() {
      return parseInt(this.session.metadata.participants[this.session.publicKeyFingerprint].rights) >= 3;
    }
  }, {
    key: "bootParticipant",
    value: function bootParticipant(pkfp) {
      var self = this;

      if (!self.haveIRightsToBoot()) {
        self.emit("boot_participant_fail", "Not enough rights to boot a member");
        return;
      }

      var request = new Message_Message();
      request.headers.command = "boot_participant";
      request.headers.pkfpSource = self.session.publicKeyFingerprint;
      request.headers.pkfpDest = self.session.metadata.topicAuthority.pkfp;
      request.body.pkfp = pkfp;
      request.signMessage(self.session.privateKey);
      self.chatSocket.emit("request", request);
    }
    /**
     * TODO implement method
     * Processes notification of a member deletion
     * If this note received - it is assumed, that the member was successfully deleted
     * Need to update current metadata
     * @param note
     * @param self
     */

  }, {
    key: "noteParticipantBooted",
    value: function noteParticipantBooted(note, self) {
      console.log("Note received: A member was booted. Processing");
      var newMeta = Metadata_Metadata.parseMetadata(note.body.metadata);

      self._updateMetadata(newMeta);

      var bootedNickname = this.getMemberRepr(note.body.bootedPkfp);
      this.deleteMemberData(note.body.bootedPkfp);
      this.saveClientSettings();
      self.emit("participant_booted", "Participant " + bootedNickname + " was booted!");
    }
  }, {
    key: "bootParticipantFailed",
    value: function bootParticipantFailed(response, self) {
      console.log("Boot member failed!");
      self.emit("boot_participant_fail", response.error);
    }
    /**
     * Called on INVITEE side when new user joins a topic with an invite code
     * @param nickname
     * @param inviteCode
     * @returns {Promise}
     */

  }, {
    key: "initTopicJoin",
    value: function () {
      var _initTopicJoin = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee4(nickname, inviteCode) {
        var clientSettings, ic, invite, inviterResidence, inviterID, inviteID, headers, body, request, topicData;
        return regenerator_default.a.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                console.log("joining topic with nickname: " + nickname + " | Invite code: " + inviteCode);
                clientSettings = new ClientSettings_ClientSettings();
                clientSettings;
                _context4.next = 5;
                return this.establishIslandConnection();

              case 5:
                ic = new iCrypto();
                ic.asym.createKeyPair("rsa").getPublicKeyFingerprint('rsa', 'pkfp').addBlob("invite64", inviteCode.trim()).base64Decode("invite64", "invite");
                invite = ic.get("invite").split("/");
                inviterResidence = invite[0];
                inviterID = invite[1];
                inviteID = invite[2];

                if (this.inviteRequestValid(inviterResidence, inviterID, inviteID)) {
                  _context4.next = 14;
                  break;
                }

                this.emit("join_topic_fail");
                throw "Invite request is invalid";

              case 14:
                this.pendingTopicJoins[inviteID] = {
                  publicKey: ic.get('rsa').publicKey,
                  privateKey: ic.get('rsa').privateKey,
                  nickname: nickname,
                  inviterID: inviterID,
                  inviterResidence: inviterResidence
                };
                headers = {
                  command: "join_topic",
                  pkfpDest: inviterID,
                  pkfpSource: ic.get('pkfp')
                };
                body = {
                  inviteString: inviteCode.trim(),
                  inviteCode: inviteID,
                  destination: inviterResidence,
                  invitee: {
                    publicKey: ic.get('rsa').publicKey,
                    nickname: nickname,
                    pkfp: ic.get('pkfp')
                  }
                };
                request = new Message_Message();
                request.set('headers', headers);
                request.set("body", body);
                request.signMessage(ic.get('rsa').privateKey);
                this.chatSocket.emit("request", request);
                topicData = {
                  newPublicKey: ic.get('rsa').publicKey,
                  newPrivateKey: ic.get('rsa').privateKey
                };
                return _context4.abrupt("return", topicData);

              case 24:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function initTopicJoin(_x4, _x5) {
        return _initTopicJoin.apply(this, arguments);
      }

      return initTopicJoin;
    }()
  }, {
    key: "initSettingsOnTopicJoin",
    value: function initSettingsOnTopicJoin(topicInfo, request) {
      var privateKey = topicInfo.privateKey;
      var publicKey = topicInfo.publicKey;
      var ic = new iCrypto();
      ic.asym.setKey("pub", publicKey, "public").getPublicKeyFingerprint("pub", "pkfp");
      var pkfp = ic.get("pkfp");
      var topicName = ChatUtility_ChatUtility.decryptStandardMessage(request.body.topicName, privateKey);
      var inviterNickname = ChatUtility_ChatUtility.decryptStandardMessage(request.body.inviterNickname, privateKey);
      var inviterPkfp = request.body.inviterPkfp;
      var settings = this.prepareNewTopicSettings(topicInfo.nickname, topicName, topicInfo.publicKey, false);
      this.setMemberNickname(inviterPkfp, inviterNickname, settings);
      this.saveClientSettings(settings, privateKey);
    }
  }, {
    key: "onSuccessfullSettingsUpdate",
    value: function onSuccessfullSettingsUpdate(response, self) {
      console.log("Settings successfully updated!");
      self.emit("settings_updated");
    }
  }, {
    key: "notifyJoinSuccess",
    value: function notifyJoinSuccess(request, self) {
      console.log("Join successfull received!");
      var topicInfo = self.pendingTopicJoins[request.body.inviteCode];
      self.initSettingsOnTopicJoin(topicInfo, request);
      self.emit("topic_join_success", {
        nickname: topicInfo.nickname,
        privateKey: topicInfo.privateKey
      });
    }
  }, {
    key: "saveClientSettings",
    value: function saveClientSettings(settingsRaw, privateKey) {
      if (!settingsRaw) {
        settingsRaw = this.session.settings;
      }

      if (!privateKey) {
        privateKey = this.session.privateKey;
      }

      var ic = new iCrypto();
      ic.asym.setKey("privk", privateKey, "private").publicFromPrivate("privk", "pub").getPublicKeyFingerprint("pub", "pkfp");
      var publicKey = ic.get("pub");
      var pkfp = ic.get("pkfp");

      if (typeof_default()(settingsRaw) === "object") {
        settingsRaw = JSON.stringify(settingsRaw);
      }

      var settingsEnc = ChatUtility_ChatUtility.encryptStandardMessage(settingsRaw, publicKey);
      var headers = {
        command: "update_settings",
        pkfpSource: pkfp
      };
      var body = {
        settings: settingsEnc
      };
      var request = new Message_Message();
      request.set("headers", headers);
      request.set("body", body);
      request.signMessage(privateKey);
      console.log("Snding update settings request");
      this.chatSocket.emit("request", request);
    }
    /**
     * TODO implement method
     * Notifies a booted member
     * If received - it is assumed that this client was successfully booted
     * from the topic.
     * Need to conceal the topic
     * @param note
     * @param self
     */

  }, {
    key: "uWereBooted",
    value: function uWereBooted(note, self) {
      console.log("Looks like I am being booted. Checking..");

      if (!Message_Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, note)) {
        console.log("Probably it was a mistake");
        return;
      }

      self.session.metadata.status = "sealed";
      console.log("You have been booted");
      self.emit("u_booted", "You have been excluded from this channel.");
    }
  }, {
    key: "updateMetaOnNewMemberJoin",
    value: function updateMetaOnNewMemberJoin(message, self) {
      self.session.metadata = JSON.parse(message.body.metadata);
      self.emit("new_member_joined");
    }
  }, {
    key: "loginFail",
    value: function loginFail(response, self) {
      console.log("Emiting login fail... " + response.headers.error);
      self.emit("login_fail", response.headers.error);
    }
  }, {
    key: "initTopicFail",
    value: function initTopicFail(response, self) {
      console.log("Init topic fail: " + response.headers.error);
      self.emit("init_topic_error", response.headers.error);
    }
  }, {
    key: "unknownError",
    value: function unknownError(response, self) {
      console.log("Unknown request error: " + response.headers.response);
      self.emit("unknown_error", response.headers.error);
    }
  }, {
    key: "processInvalidResponse",
    value: function processInvalidResponse(response, self) {
      console.log("Received invalid server response");
      self.emit("invalid_response", response);
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== PARTICIPANTS HANDLING   ============*
     **************************************************/

  }, {
    key: "addNewParticipant",
    value: function addNewParticipant(nickname, publicKey, residence, rights) {
      var ic = new iCrypto();
      ic.setRSAKey("pk", publicKey, "public").getPublicKeyFingerprint("pk", "fp");
      var participant = new Participant_Participant();
      participant.set('nickname', nickname);
      participant.set('publicKey', ic.get("pk"));
      participant.set('publicKeyFingerprint', ic.get("fp"));
      participant.set('residence', residence);
      participant.set('rights', rights);
      this.session.metadata.addParticipant(participant);
      this.broadcastMetadataUpdate();
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ FILE HANDLING  ================*
     **************************************************/

    /**
     * Takes list of files and uploads them
     * to the Island asynchronously.
     *
     * Resolves with list of fileInfo JSON objects.
     * @param filesAttached list of files each type of File
     * @return Promise
     */

  }, {
    key: "uploadAttachments",
    value: function uploadAttachments(filesAttached, messageID, metaID) {
      var _this2 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref2 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee5(resolve, reject) {
          var self, filesProcessed, pkfp, privk, symk, residence, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, filesInfo;

          return regenerator_default.a.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  self = _this2;

                  if (!(Worker === undefined)) {
                    _context5.next = 4;
                    break;
                  }

                  reject(null, "Client does not support web workers.");
                  return _context5.abrupt("return");

                case 4:
                  filesProcessed = [];
                  pkfp = self.session.publicKeyFingerprint;
                  privk = self.session.privateKey;
                  symk = self.session.metadata.sharedKey;
                  residence = self.session.metadata.participants[self.session.publicKeyFingerprint].residence;
                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _iteratorError = undefined;
                  _context5.prev = 12;

                  for (_iterator = filesAttached[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    file = _step.value;
                    console.log("Calling worker function");
                    filesProcessed.push(self.uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence));
                  }

                  _context5.next = 20;
                  break;

                case 16:
                  _context5.prev = 16;
                  _context5.t0 = _context5["catch"](12);
                  _didIteratorError = true;
                  _iteratorError = _context5.t0;

                case 20:
                  _context5.prev = 20;
                  _context5.prev = 21;

                  if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                  }

                case 23:
                  _context5.prev = 23;

                  if (!_didIteratorError) {
                    _context5.next = 26;
                    break;
                  }

                  throw _iteratorError;

                case 26:
                  return _context5.finish(23);

                case 27:
                  return _context5.finish(20);

                case 28:
                  _context5.prev = 28;
                  _context5.next = 31;
                  return Promise.all(filesProcessed);

                case 31:
                  filesInfo = _context5.sent;
                  resolve(filesInfo);
                  _context5.next = 39;
                  break;

                case 35:
                  _context5.prev = 35;
                  _context5.t1 = _context5["catch"](28);
                  console.log("ERROR DURING UPLOAD ATTACHMENTS: " + _context5.t1);
                  reject(_context5.t1);

                case 39:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this, [[12, 16, 20, 28], [21,, 23, 27], [28, 35]]);
        }));

        return function (_x6, _x7) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
    /**
     * Uploads a single attachment to the island
     * Calculates hash of unencrypted and encrypted file
     * signs both hashes
     * resolves with fileInfo object
     * @returns {Promise<any>}
     */

  }, {
    key: "uploadAttachmentWithWorker",
    value: function uploadAttachmentWithWorker(file, pkfp, privk, symk, messageID, metaID, residence) {
      return new Promise(function (resolve, reject) {
        console.log("!!!Initializing worker...");
        var uploader = new Worker("/js/uploaderWorker.js");

        var uploadComplete = function uploadComplete(msg) {
          var fileInfo = new AttachmentInfo_AttachmentInfo(file, residence, pkfp, metaID, privk, messageID, msg.hashEncrypted, msg.hashUnencrypted);
          uploader.terminate();
          resolve(fileInfo);
        };

        var uploadProgress = function uploadProgress(msg) {//TODO implement event handling
        };

        var uploadError = function uploadError(msg) {
          uploader.terminate();
          self.emit("upload_error", msg.data);
          reject(data);
        };

        var messageHandlers = {
          "upload_complete": uploadComplete,
          "upload_progress": uploadProgress,
          "upload_error": uploadError
        };

        uploader.onmessage = function (ev) {
          var msg = ev.data;
          messageHandlers[msg.result](msg.data);
        };

        uploader.postMessage({
          command: "upload",
          attachment: file,
          pkfp: pkfp,
          privk: privk,
          symk: symk
        });
      });
    }
    /**
     * Downloads requested attachment
     *
     * @param {string} fileInfo - Stringified JSON of type AttachmentInfo.
     *          Must contain all required info including hashes, signatures, and link
     */

  }, {
    key: "downloadAttachment",
    value: function downloadAttachment(fileInfo) {
      var _this3 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref3 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee6(resolve, reject) {
          var self, privk, parsedFileInfo, fileOwnerPublicKey, err, myPkfp, fileData;
          return regenerator_default.a.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  self = _this3;
                  privk = self.session.privateKey; //To decrypt SYM key
                  //Getting public key of

                  parsedFileInfo = JSON.parse(fileInfo);
                  fileOwnerPublicKey = self.session.metadata.participants[parsedFileInfo.pkfp].publicKey;

                  if (Worker === undefined) {
                    err = "Worker is not defined.Cannot download file.";
                    console.log(err);
                    reject(err);
                  }

                  myPkfp = self.session.publicKeyFingerprint;
                  _context6.next = 8;
                  return self.downloadAttachmentWithWorker(fileInfo, myPkfp, privk, fileOwnerPublicKey);

                case 8:
                  fileData = _context6.sent;
                  self.emit("download_complete", {
                    fileInfo: fileInfo,
                    fileData: fileData
                  });

                case 10:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, this);
        }));

        return function (_x8, _x9) {
          return _ref3.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "downloadAttachmentWithWorker",
    value: function downloadAttachmentWithWorker(fileInfo, myPkfp, privk, ownerPubk) {
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref4 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee7(resolve, reject) {
          var downloader, downloadComplete, messageHandlers, processMessage;
          return regenerator_default.a.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  downloader = new Worker("/js/downloaderWorker.js");

                  downloadComplete = function downloadComplete(fileBuffer) {
                    resolve(fileBuffer);
                    downloader.terminate();
                  };

                  messageHandlers = {
                    "download_complete": downloadComplete
                  };

                  processMessage = function processMessage(msg) {
                    messageHandlers[msg.result](msg.data);
                  };

                  downloader.onmessage = function (ev) {
                    processMessage(ev.data);
                  };

                  downloader.postMessage({
                    command: "download",
                    data: {
                      fileInfo: fileInfo,
                      myPkfp: myPkfp,
                      privk: privk,
                      pubk: ownerPubk
                    }
                  });

                case 6:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, this);
        }));

        return function (_x10, _x11) {
          return _ref4.apply(this, arguments);
        };
      }());
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ MESSAGE HANDLING  ============*
     **************************************************/

  }, {
    key: "prepareMessage",
    value: function prepareMessage(messageContent, recipientPkfp) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var self = _this4;
        console.log("Preparing message: " + messageContent);

        if (!self.isLoggedIn()) {
          self.emit("login_required");
          reject();
        } //Preparing chat message


        var chatMessage = new ChatMessage_ChatMessage();
        chatMessage.header.metadataID = _this4.session.metadata.id;
        chatMessage.header.author = _this4.session.publicKeyFingerprint;
        chatMessage.header.recipient = recipientPkfp ? recipientPkfp : "ALL";
        chatMessage.header.private = !!recipientPkfp;
        chatMessage.header.nickname = self.session.settings.nickname;
        chatMessage.body = messageContent;
        resolve(chatMessage);
      });
    }
    /**
     * Sends the message.
     *
     * @param {string} messageContent
     * @param {array} filesAttached Array of attached files. Should be taken straight from input field
     * @returns {Promise<any>}
     */

  }, {
    key: "shoutMessage",
    value: function shoutMessage(messageContent, filesAttached) {
      var _this5 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref5 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee8(resolve, reject) {
          var self, attachmentsInfo, metaID, chatMessage, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, att, message, userPrivateKey;

          return regenerator_default.a.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  self = _this5;
                  metaID = self.session.metadata.id;
                  _context8.next = 4;
                  return self.prepareMessage(messageContent);

                case 4:
                  chatMessage = _context8.sent;

                  if (!(filesAttached && filesAttached.length > 0)) {
                    _context8.next = 28;
                    break;
                  }

                  _context8.next = 8;
                  return self.uploadAttachments(filesAttached, chatMessage.header.id, metaID);

                case 8:
                  attachmentsInfo = _context8.sent;
                  _iteratorNormalCompletion2 = true;
                  _didIteratorError2 = false;
                  _iteratorError2 = undefined;
                  _context8.prev = 12;

                  for (_iterator2 = attachmentsInfo[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    att = _step2.value;
                    chatMessage.addAttachmentInfo(att);
                  }

                  _context8.next = 20;
                  break;

                case 16:
                  _context8.prev = 16;
                  _context8.t0 = _context8["catch"](12);
                  _didIteratorError2 = true;
                  _iteratorError2 = _context8.t0;

                case 20:
                  _context8.prev = 20;
                  _context8.prev = 21;

                  if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                    _iterator2.return();
                  }

                case 23:
                  _context8.prev = 23;

                  if (!_didIteratorError2) {
                    _context8.next = 26;
                    break;
                  }

                  throw _iteratorError2;

                case 26:
                  return _context8.finish(23);

                case 27:
                  return _context8.finish(20);

                case 28:
                  chatMessage.encryptMessage(_this5.session.metadata.sharedKey);
                  chatMessage.sign(_this5.session.privateKey); //Preparing request

                  message = new Message_Message();
                  message.headers.pkfpSource = _this5.session.publicKeyFingerprint;
                  message.headers.command = "broadcast_message";
                  message.body.message = chatMessage.toBlob();
                  userPrivateKey = _this5.session.privateKey;
                  message.signMessage(userPrivateKey); //console.log("Message ready: " + JSON.stringify(message));

                  _this5.chatSocket.emit("request", message);

                  resolve();

                case 38:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8, this, [[12, 16, 20, 28], [21,, 23, 27]]);
        }));

        return function (_x12, _x13) {
          return _ref5.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "whisperMessage",
    value: function whisperMessage(pkfp, messageContent, filesAttached) {
      var _this6 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref6 = asyncToGenerator_default()(
        /*#__PURE__*/
        regenerator_default.a.mark(function _callee9(resolve, reject) {
          var self, chatMessage, keys, message, userPrivateKey;
          return regenerator_default.a.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  self = _this6;
                  _context9.next = 3;
                  return self.prepareMessage(messageContent, pkfp);

                case 3:
                  chatMessage = _context9.sent;
                  //Will be enabled in the next version
                  keys = [self.session.publicKey];
                  keys.push(self.session.metadata.participants[pkfp].publicKey);
                  chatMessage.encryptPrivateMessage(keys);
                  chatMessage.sign(_this6.session.privateKey); //Preparing request

                  message = new Message_Message();
                  message.headers.pkfpSource = _this6.session.publicKeyFingerprint;
                  message.headers.pkfpDest = pkfp;
                  message.headers.command = "send_message";
                  message.headers.private = true;
                  message.body.message = chatMessage.toBlob();
                  userPrivateKey = _this6.session.privateKey;
                  message.signMessage(userPrivateKey);

                  _this6.chatSocket.emit("request", message);

                  resolve();

                case 18:
                case "end":
                  return _context9.stop();
              }
            }
          }, _callee9, this);
        }));

        return function (_x14, _x15) {
          return _ref6.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "processIncomingMessage",
    value: function processIncomingMessage(data, self) {
      console.log("Received incoming message! ");
      var message = data.message;
      var symKey = data.key ? ChatUtility_ChatUtility.privateKeyDecrypt(data.key, self.session.privateKey) : self.session.metadata.sharedKey;
      var chatMessage = new ChatMessage_ChatMessage(message.body.message);
      var author = self.session.metadata.participants[chatMessage.header.author];

      if (!author) {
        throw "Author is not found in the current version of metadata!";
      }

      if (!chatMessage.verify(author.publicKey)) {
        self.emit("error", "Received message with invalid signature!");
      }

      if (!chatMessage.header.private && !data.key && chatMessage.header.metadataID !== self.session.metadata.id) {
        throw "current metadata cannot decrypt this message";
      }

      if (chatMessage.header.private) {
        chatMessage.decryptPrivateMessage(self.session.privateKey);
      } else {
        chatMessage.decryptMessage(symKey);
      }

      var authorNickname = chatMessage.header.nickname;
      var authorPkfp = chatMessage.header.author;
      var authorExistingName = self.getMemberNickname(authorPkfp);

      if (!this.nicknameAssigned(authorPkfp) || authorNickname !== self.getMemberNickname(authorPkfp)) {
        self.setMemberNickname(authorPkfp, authorNickname);
        self.saveClientSettings();
        self.createServiceRecordOnMemberNicknameChange(authorExistingName, authorNickname, authorPkfp);
      }

      self.emit("chat_message", chatMessage);
    }
  }, {
    key: "nicknameAssigned",
    value: function nicknameAssigned(pkfp) {
      try {
        return this.session.settings.membersData[pkfp].hasOwnProperty("nickname");
      } catch (err) {
        return false;
      }
    }
  }, {
    key: "messageSendSuccess",
    value: function () {
      var _messageSendSuccess = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee10(response, self) {
        var chatMessage, author;
        return regenerator_default.a.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                chatMessage = new ChatMessage_ChatMessage(response.body.message);
                author = self.session.metadata.participants[chatMessage.header.author];

                if (author) {
                  _context10.next = 4;
                  break;
                }

                throw "Author is not found in the current version of metadata!";

              case 4:
                if (!chatMessage.verify(author.publicKey)) {
                  self.emit("error", "Received message with invalid signature!");
                }

                if (!(!chatMessage.header.private && chatMessage.header.metadataID !== self.session.metadata.id)) {
                  _context10.next = 7;
                  break;
                }

                throw "current metadata cannot decrypt this message";

              case 7:
                if (chatMessage.header.private) {
                  chatMessage.decryptPrivateMessage(self.session.privateKey);
                } else {
                  chatMessage.decryptMessage(self.session.metadata.sharedKey);
                }

                self.emit("send_success", chatMessage);

              case 9:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function messageSendSuccess(_x16, _x17) {
        return _messageSendSuccess.apply(this, arguments);
      }

      return messageSendSuccess;
    }()
  }, {
    key: "messageSendFail",
    value: function messageSendFail(response, self) {
      var messageID = JSON.parse(response).body.message.header.id;
      self.emit("send_fail", self.outgoingMessageQueue[messageID]);
      delete self.outgoingMessageQueue[messageID];
    }
  }, {
    key: "isLoggedIn",
    value: function isLoggedIn() {
      return this.session && this.session.status === "active";
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ================ INVITES HANDLING  ============*
     **************************************************/

    /**
     * Sends request to topic authority to create an invite
     */

  }, {
    key: "requestInvite",
    value: function requestInvite() {
      var ic = new iCrypto();
      ic.createNonce("n").bytesToHex("n", "nhex");
      var request = new Message_Message();
      var myNickNameEncrypted = ChatUtility_ChatUtility.encryptStandardMessage(this.session.settings.nickname, this.session.metadata.topicAuthority.publicKey);
      var topicNameEncrypted = ChatUtility_ChatUtility.encryptStandardMessage(this.session.settings.topicName, this.session.metadata.topicAuthority.publicKey);
      request.headers.command = "request_invite";
      request.headers.pkfpSource = this.session.publicKeyFingerprint;
      request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
      request.body.nickname = myNickNameEncrypted;
      request.body.topicName = topicNameEncrypted;
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "syncInvites",
    value: function syncInvites() {
      var ic = new iCrypto();
      ic.createNonce("n").bytesToHex("n", "nhex");
      var request = new Message_Message();
      request.headers.command = "sync_invites";
      request.headers.pkfpSource = this.session.publicKeyFingerprint;
      request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
      request.headers.nonce = ic.get("nhex");
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "syncInvitesSuccess",
    value: function syncInvitesSuccess(response, self) {
      if (Message_Message.verifyMessage(self.session.metadata.topicAuthority.publicKey, response)) {
        self.updatePendingInvites(response.body.invites);
        self.emit(response.headers.response);
      } else {
        throw "invalid message";
      }
    }
  }, {
    key: "generateInvite",
    value: function generateInvite() {
      if (!this.session || !(this.session.status === "active")) {
        this.emit("login_required");
        return;
      }

      var ic = new iCrypto();
      ic.createNonce("iid").bytesToHex('iid', "iidhex");
      var body = {
        requestID: ic.get("iidhex"),
        pkfp: this.session.publicKeyFingerprint
      };
      var request = new Message_Message();
      request.headers.command = "request_invite";
      request.set("body", body);
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "requestInviteError",
    value: function requestInviteError(response, self) {
      console.log("Request invite error received: " + response.headers.error);
      self.emit("request_invite_error", response.headers.error);
    }
  }, {
    key: "syncInvitesError",
    value: function syncInvitesError(response, self) {
      console.log("Sync invites error received: " + response.headers.error);
      self.emit("sync_invites_error", response.headers.error);
    }
  }, {
    key: "processInviteCreated",
    value: function processInviteCreated(response, self) {
      self.updatePendingInvites(response.body.userInvites);
      self.emit("request_invite_success", response.body.inviteCode);
    }
  }, {
    key: "updateSetInviteeName",
    value: function updateSetInviteeName(inviteID, name) {
      this.session.settings.invites[inviteID].name = name;
      this.saveClientSettings(this.session.settings, this.session.privateKey);
    }
  }, {
    key: "saveInviteSuccess",
    value: function saveInviteSuccess(response, self) {
      self.updatePendingInvites(response.body.userInvites);
      self.emit("invite_generated", self.session.pendingInvites[response.body.inviteID]);
    }
  }, {
    key: "updateInviteSuccess",
    value: function updateInviteSuccess(response, self) {
      self.updatePendingInvites(response.body.invites);
      self.emit("invite_updated");
    }
    /**
     * Given a dictionary of encrypted pending invites from history
     * decrypts them and adds to the current session
     * @param invitesUpdatedEncrypted
     */

  }, {
    key: "updatePendingInvites",
    value: function updatePendingInvites(userInvites) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = userInvites[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var i = _step3.value;

          if (!this.session.settings.invites.hasOwnProperty(i)) {
            this.session.settings.invites[i] = {};
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _arr2 = Object.keys(this.session.settings.invites);

      for (var _i3 = 0; _i3 < _arr2.length; _i3++) {
        var _i4 = _arr2[_i3];

        if (!userInvites.includes(_i4)) {
          delete this.session.settings.invites[_i4];
        }
      }

      this.saveClientSettings(this.session.settings, this.session.privateKey);
    }
  }, {
    key: "settingsInitInvites",
    value: function settingsInitInvites() {
      this.session.settings.invites = {};
      this.saveClientSettings(this.session.settings, this.session.privateKey);
    }
  }, {
    key: "deleteInvite",
    value: function deleteInvite(id) {
      console.log("About to delete invite: " + id);
      var request = new Message_Message();
      request.headers.command = "del_invite";
      request.headers.pkfpSource = this.session.publicKeyFingerprint;
      request.headers.pkfpDest = this.session.metadata.topicAuthority.pkfp;
      var body = {
        invite: id
      };
      request.set("body", body);
      request.signMessage(this.session.privateKey);
      this.chatSocket.emit("request", request);
    }
  }, {
    key: "delInviteSuccess",
    value: function delInviteSuccess(response, self) {
      console.log("Del invite success! ");
      self.updatePendingInvites(response.body.invites);
      self.emit("del_invite_success");
    }
  }, {
    key: "getPendingInvites",
    value: function getPendingInvites() {
      console.log("Del invite fail! ");
      self.emit("del_invite_fail");
    }
  }, {
    key: "inviteRequestValid",
    value: function inviteRequestValid(inviterResidence, inviterID, inviteID) {
      return inviteID && inviteID && this.onionValid(inviterResidence);
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ====== ISLAND CONNECTION HANDLING  ============*
     **************************************************/

  }, {
    key: "establishIslandConnection",
    value: function () {
      var _establishIslandConnection = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee11() {
        var _this7 = this;

        var option,
            _args11 = arguments;
        return regenerator_default.a.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                option = _args11.length > 0 && _args11[0] !== undefined ? _args11[0] : "chat";
                return _context11.abrupt("return", new Promise(function (resolve, reject) {
                  if (option === "chat") {
                    if (_this7.chatSocket && _this7.chatSocket.connected) {
                      resolve();
                      return;
                    }

                    _this7.chatSocket = io('/chat', {
                      reconnection: false,
                      forceNew: true,
                      transports: ['websocket', "longpoll"],
                      pingInterval: 10000,
                      pingTimeout: 5000
                    });

                    _this7.chatSocket.on('connect', function () {
                      _this7.finishSocketSetup();

                      console.log("Island connection established");
                      _this7.islandConnectionStatus = true;

                      _this7.emit("connected_to_island");

                      resolve();
                    });

                    _this7.chatSocket.on("disconnect", function () {
                      console.log("Island disconnected.");
                      _this7.islandConnectionStatus = false;

                      _this7.emit("disconnected_from_island");
                    });

                    _this7.chatSocket.on('connect_error', function (err) {
                      console.log('Connection Failed');
                      reject(err);
                    });
                  } else if (option === "file") {
                    console.log("Connecting to file socket");

                    if (_this7.fileSocket && _this7.fileSocket.connected) {
                      console.log("File socket already connected! returning");
                      resolve();
                      return;
                    }

                    _this7.fileSocket = io('/file', {
                      'reconnection': true,
                      'forceNew': true,
                      'reconnectionDelay': 1000,
                      'reconnectionDelayMax': 5000,
                      'reconnectionAttempts': 5
                    });

                    _this7.fileSocket.on("connect", function () {
                      _this7.setupFileTransferListeners();

                      console.log("File transfer connectiopn established");
                      resolve();
                    });

                    _this7.fileSocket.on("connect_error", function (err) {
                      console.log('Island connection failed: ' + err.message);
                      reject(err);
                    });
                  }
                }));

              case 2:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function establishIslandConnection() {
        return _establishIslandConnection.apply(this, arguments);
      }

      return establishIslandConnection;
    }()
  }, {
    key: "terminateIslandConnection",
    value: function () {
      var _terminateIslandConnection = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee12() {
        return regenerator_default.a.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.prev = 0;

                if (this.chatSocket && this.chatSocket.connected) {
                  this.chatSocket.disconnect();
                }

                _context12.next = 7;
                break;

              case 4:
                _context12.prev = 4;
                _context12.t0 = _context12["catch"](0);
                throw "Error terminating connection with island: " + _context12.t0;

              case 7:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[0, 4]]);
      }));

      function terminateIslandConnection() {
        return _terminateIslandConnection.apply(this, arguments);
      }

      return terminateIslandConnection;
    }() //TODO implement method

  }, {
    key: "setupFileTransferListeners",
    value: function setupFileTransferListeners() {}
  }, {
    key: "finishSocketSetup",
    value: function finishSocketSetup() {
      this.initChatListeners();
    }
  }, {
    key: "initChatListeners",
    value: function initChatListeners() {
      var _this8 = this;

      this.chatSocket.on('message', function (message) {
        console.log(JSON.stringify(message));
      });
      this.chatSocket.on('request', function (request) {
        console.log("Received new incoming request");

        _this8.processRequest(request, _this8);
      });
      this.chatSocket.on("response", function (response) {
        _this8.processResponse(response, _this8);
      });
      this.chatSocket.on("service", function (message) {
        _this8.processServiceMessage(message, _this8);
      });
      this.chatSocket.on("service_record", function (message) {
        console.log("Got SERVICE RECORD!");

        _this8.processServiceRecord(message, _this8);
      });
      this.chatSocket.on("message", function (message) {
        _this8.processIncomingMessage(message, _this8);
      });
      this.chatSocket.on('reconnect', function (attemptNumber) {
        console.log("Successfull reconnect client");
      });
      this.chatSocket.on('metadata_update', function (meta) {
        _this8.processMetadataUpdate(meta);
      });
      /*
              this.chatSocket.on("chat_session_registered", (params)=>{
                  if (params.success){
                      this.session.status = "active";
                      this.emit("chat_session_registered");
                  }
              });
      */
      // this.chatSocket.on("last_metadata",(data)=>{
      //     this.processMetadataResponse(data);
      // })
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== METADATA MANIPULATION   ============*
     **************************************************/

    /**
     * Takes metadata from session variable,
     * prepares it and sends to all participants
     */

  }, {
    key: "broadcastMetadataUpdate",
    value: function broadcastMetadataUpdate(metadata) {
      var _this9 = this;

      var newMetadata = this.session.metadata.toBlob(true);
      var updateRequest = {
        myBlob: newMetadata,
        topicID: this.session.metadata.topicID,
        publicKeyFingerprint: this.session.publicKeyFingerprint,
        recipients: {}
      };
      Object.keys(this.session.metadata.participants).forEach(function (key) {
        //TODO encrypt
        var encryptedMeta = newMetadata;
        var fp = _this9.session.metadata.participants[key].publicKeyFingerprint;
        var residence = _this9.session.metadata.participants[key].residence;
        updateRequest.recipients[key] = {
          residence: residence,
          metadata: newMetadata
        };
      });
      this.chatSocket.emit("broadcast_metadata_update", updateRequest);
    } //SHIT CODE

  }, {
    key: "processMetadataUpdate",
    value: function processMetadataUpdate(message, self) {
      if (message.headers.event === "new_member_joined") {
        self.processNewMemberJoined(message, self);
      } else if (message.headers.event === "member_booted") {
        self.noteParticipantBooted(message, self);
      } else if (message.headers.event === "u_booted") {
        this.uWereBooted(message, self);
      } else if (message.headers.event === "meta_sync") {
        self.processMetaSync(message, self);
      }
    }
  }, {
    key: "processMetaSync",
    value: function processMetaSync(message, self) {
      if (!self.session) {
        return;
      }

      console.log("Processing metadata sync message");

      if (message.body.metadata) {
        self._updateMetadata(Metadata_Metadata.parseMetadata(message.body.metadata));

        self.emit("metadata_updated");
      }
    }
  }, {
    key: "processNewMemberJoined",
    value: function processNewMemberJoined(request, self) {
      if (!self.session) {
        return;
      }

      var newMemberPkfp = request.body.pkfp;
      var newMemberNickname = request.body.nickname;

      self._updateMetadata(Metadata_Metadata.parseMetadata(request.body.metadata));

      self.addNewMemberToSettings(newMemberPkfp);
      self.setMemberNickname(newMemberPkfp, newMemberNickname);
      self.saveClientSettings();
      self.emit("new_member_joined");
    }
  }, {
    key: "_updateMetadata",
    value: function _updateMetadata(metadata) {
      var self = this;
      var sharedKey = Metadata_Metadata.extractSharedKey(self.session.publicKeyFingerprint, self.session.privateKey, metadata);
      self.session.metadata = metadata.body;
      self.session.metadata.sharedKey = sharedKey;
      self.session.metadataSignature = metadata.signature;
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== SETTINGS UPDATES ====================*
     **************************************************/

  }, {
    key: "myNicknameUpdate",
    value: function myNicknameUpdate(newNickName) {
      if (!newNickName) {
        return;
      }

      newNickName = newNickName.trim();
      var settings = this.session.settings;

      if (settings.nickname === newNickName) {
        return;
      }

      settings.nickname = newNickName;
      this.setMemberNickname(this.session.publicKeyFingerprint, newNickName);
      this.saveClientSettings(settings, this.session.privateKey);
      this.broadcastNameChange();
    }
  }, {
    key: "topicNameUpdate",
    value: function topicNameUpdate(newTopicName) {
      if (!newTopicName) {
        return;
      }

      newTopicName = newTopicName.trim();
      var settings = this.session.settings;

      if (settings.topicName === newTopicName) {
        return;
      }

      settings.topicName = newTopicName;
      this.saveClientSettings(settings, this.session.privateKey);
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

    /**************************************************
     * ========== UTILS   ============*
     **************************************************/

  }, {
    key: "signBlob",
    value: function signBlob(privateKey, blob) {
      var ic = new iCrypto();
      ic.setRSAKey("pk", privateKey, "private").addBlob("b", blob).privateKeySign("b", "pk", "sign");
      return ic.get("sign");
    }
  }, {
    key: "verifyBlob",
    value: function verifyBlob(publicKey, sign, blob) {
      var ic = new iCrypto();
      ic.setRSAKey("pubk", publicKey, "public").addBlob("sign", sign).addBlob("b", blob).publicKeyVerify("b", "sign", "pubk", "v");
      return ic.get("v");
    }
    /**
     * Generates .onion address and RSA1024 private key for it
     */

  }, {
    key: "generateOnionService",
    value: function generateOnionService() {
      var pkraw = forge.rsa.generateKeyPair(1024);
      var pkfp = forge.pki.getPublicKeyFingerprint(pkraw.publicKey, {
        encoding: 'hex',
        md: forge.md.sha1.create()
      });
      var pem = forge.pki.privateKeyToPem(pkraw.privateKey);

      if (pkfp.length % 2 !== 0) {
        // odd number of characters
        pkfp = '0' + pkfp;
      }

      var bytes = [];

      for (var i = 0; i < pkfp.length / 2; i = i + 2) {
        bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
      }

      var onion = base32.encode(bytes).toLowerCase() + ".onion";
      return {
        onion: onion,
        privateKey: pem
      };
    }
  }, {
    key: "onionAddressFromPrivateKey",
    value: function onionAddressFromPrivateKey(privateKey) {
      var ic = new iCrypto();
      ic.setRSAKey("privk", privateKey, "private").publicFromPrivate("privk", "pubk");
      var pkraw = forge.pki.publicKeyFromPem(ic.get("pubk"));
      var pkfp = forge.pki.getPublicKeyFingerprint(pkraw, {
        encoding: 'hex',
        md: forge.md.sha1.create()
      });

      if (pkfp.length % 2 !== 0) {
        pkfp = '0' + pkfp;
      }

      var bytes = [];

      for (var i = 0; i < pkfp.length / 2; i = i + 2) {
        bytes.push(parseInt(pkfp.slice(i, i + 2), 16));
      }

      return base32.encode(bytes).toLowerCase() + ".onion";
    }
  }, {
    key: "extractFromInvite",
    value: function extractFromInvite(inviteString64) {
      var thingToExtract = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "all";
      var ic = new iCrypto();
      ic.addBlob("is64", inviteString64).base64Decode("is64", "is");
      var inviteParts = ic.get("is").split("/");
      var things = {
        "hsid": inviteParts[0],
        "pkfp": inviteParts[1],
        "inviteCode": inviteParts[2],
        "all": inviteParts
      };

      try {
        return things[thingToExtract];
      } catch (err) {
        throw "Invalid parameter thingToExtract";
      }
    }
  }, {
    key: "onionValid",
    value: function onionValid(candidate) {
      var pattern = /^[a-z2-7]{16}\.onion$/;
      return pattern.test(candidate);
    }
  }, {
    key: "getMyResidence",
    value: function getMyResidence() {
      return this.session.metadata.participants[this.session.publicKeyFingerprint].residence;
    }
    /**************************************************
     * =================== END  ===================== *
     **************************************************/

  }]);

  return ChatClient;
}();

/* harmony default export */ var chat_ChatClient = __webpack_exports__["default"] = (ChatClient_ChatClient);

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(0);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/asyncToGenerator.js
var asyncToGenerator = __webpack_require__(3);
var asyncToGenerator_default = /*#__PURE__*/__webpack_require__.n(asyncToGenerator);

// EXTERNAL MODULE: ../node_modules/cute-set/index.js
var cute_set = __webpack_require__(7);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/typeof.js
var helpers_typeof = __webpack_require__(4);
var typeof_default = /*#__PURE__*/__webpack_require__.n(helpers_typeof);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/classCallCheck.js
var classCallCheck = __webpack_require__(1);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck);

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/createClass.js
var createClass = __webpack_require__(2);
var createClass_default = /*#__PURE__*/__webpack_require__.n(createClass);

// CONCATENATED MODULE: ./src/js/lib/iCrypto.js
 //import { JSChaCha20 } from 'js-chacha20'
//const lzma = require('lzma');
//const forge = require('node-forge');
//const sjcl = require("./sjcl.js");





var Base32 = __webpack_require__(10);

var iCrypto_iCryptoFactory =
/*#__PURE__*/
function () {
  function iCryptoFactory(settings) {
    classCallCheck_default()(this, iCryptoFactory);

    this.readSettings();
  }

  createClass_default()(iCryptoFactory, [{
    key: "createICryptor",
    value: function createICryptor() {
      return new iCrypto_iCrypto(this.settings);
    }
  }, {
    key: "readSettings",
    value: function readSettings() {
      console.log("readubg settings");
      this.settings = null;
    }
  }]);

  return iCryptoFactory;
}();

var iCrypto_iCrypto =
/*#__PURE__*/
function () {
  function iCrypto(settings) {
    classCallCheck_default()(this, iCrypto);

    var self = this;
    self.settings = {};
    self.locked = false;
    self.setEncodersAndDecoders();
    self.symCiphers = ['aes'];
    self.streamCiphers = ['chacha'];
    self.asymCiphers = ['rsa'];
    self.store = {};
    self.rsa = {
      createKeyPair: function createKeyPair() {
        return self.generateRSAKeyPair.apply(self, arguments);
      },
      asyncCreateKeyPair: function asyncCreateKeyPair() {
        return self.asyncGenerateRSAKeyPair.apply(self, arguments);
      },
      encrypt: function encrypt() {
        return self.publicKeyEncrypt.apply(self, arguments);
      },
      decrypt: function decrypt() {
        return self.privateKeyDecrypt.apply(self, arguments);
      },
      sign: function sign() {
        return self.privateKeySign.apply(self, arguments);
      },
      verify: function verify() {
        return self.publicKeyVerify.apply(self, arguments);
      },
      setKey: function setKey() {
        return self.setRSAKey.apply(self, arguments);
      },
      getSettings: function getSettings() {
        return "RSA";
      }
    };
    self.aes = {
      modes: ['CBC', 'CFB', 'CTR'],
      mode: 'CBC',
      ivLength: 16,
      keySize: 32,
      createKey: function createKey() {
        return self.createSYMKey.apply(self, arguments);
      },
      encrypt: function encrypt() {
        return self.AESEncrypt.apply(self, arguments);
      },
      decrypt: function decrypt() {
        return self.AESDecrypt.apply(self, arguments);
      },
      setKey: function setKey() {
        return self.setSYMKey.apply(self, arguments);
      },
      getSettings: function getSettings() {
        return "AES";
      }
    };
    self.chacha = {
      init: function init() {
        return self.initStreamCryptor.apply(self, arguments);
      },
      encrypt: function encrypt() {
        return self.streamCryptorEncrypt.apply(self, arguments);
      },
      decrypt: function decrypt() {
        return self.streamCryptorDecrypt.apply(self, arguments);
      },
      getSettings: function getSettings() {
        return "ChaCha";
      }
    };
    self.setAsymCipher('rsa');
    self.setSymCipher('aes');
    self.setStreamCipher('chacha');
  }
  /***************** SETTING CIPHERS API *******************/


  createClass_default()(iCrypto, [{
    key: "setSymCipher",
    value: function setSymCipher() {
      var self = this;

      for (var _len = arguments.length, opts = new Array(_len), _key = 0; _key < _len; _key++) {
        opts[_key] = arguments[_key];
      }

      if (!self.symCiphers.includes(opts[0])) {
        throw "setSymCipher: Invalid or unsupported algorithm";
      }

      self.sym = self[opts[0]];
    }
  }, {
    key: "setAsymCipher",
    value: function setAsymCipher() {
      var self = this;

      for (var _len2 = arguments.length, opts = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        opts[_key2] = arguments[_key2];
      }

      if (!self.asymCiphers.includes(opts[0])) {
        throw "setSymCipher: Invalid or unsupported algorithm";
      }

      self.asym = self[opts[0]];
    }
  }, {
    key: "setStreamCipher",
    value: function setStreamCipher() {
      var self = this;

      for (var _len3 = arguments.length, opts = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        opts[_key3] = arguments[_key3];
      }

      if (!self.streamCiphers.includes(opts[0])) {
        throw "setSymCipher: Invalid or unsupported algorithm";
      }

      self.ssym = self[opts[0]];
    }
    /***************** END **********************************/

  }, {
    key: "setEncodersAndDecoders",
    value: function setEncodersAndDecoders() {
      this.encoders = {
        hex: iCrypto.hexEncode,
        base64: iCrypto.base64Encode
      };
      this.decoders = {
        hex: iCrypto.hexDecode,
        base64: iCrypto.base64Decode
      };
    }
    /*********MAIN METHODS**************/

    /**********************$$*****************************/

    /***####NONCES PLAIN TEXT####***/

  }, {
    key: "asyncCreateNonce",
    value: function asyncCreateNonce(nameToSave) {
      var _this = this;

      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;
      return new Promise(function (resolve, reject) {
        try {
          resolve(_this.createNonce(nameToSave, length));
        } catch (err) {
          reject(err);
        }
      });
    }
    /**
     * Creates nonce of the given length and
     * saves it under the provided name.
     * Default is 32 bytes
     *
     * @param {string} nameToSave
     * @param {number} length
     * @returns {iCrypto}
     */

  }, {
    key: "createNonce",
    value: function createNonce() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("createNonce");
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;
      var self = this;
      this.set(nameToSave, iCrypto.getBytes(length));
      return this;
    }
  }, {
    key: "asyncAddBlob",
    value: function asyncAddBlob(nameToSave, plainText) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        try {
          resolve(_this2.addBlob(nameToSave, plainText));
        } catch (err) {
          reject(err);
        }
      });
    }
  }, {
    key: "addBlob",
    value: function addBlob() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("addBlob");
      var plainText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("addBlob");
      this.set(nameToSave, plainText.toString().trim());
      return this;
    }
    /**********************$$*****************************/

    /***#### KEYS CRYPTO ####***/

  }, {
    key: "asyncCreateSYMKey",
    value: function asyncCreateSYMKey(nameToSave) {
      var _this3 = this;

      var ivLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;
      var keyLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 32;
      return new Promise(function (resolve, reject) {
        try {
          resolve(_this3.createSYMKey(nameToSave, ivLength, keyLength));
        } catch (err) {
          reject(err);
        }
      });
    }
    /**
     * Creates hex-encoded SYM key, which is just some random hex-encoded bytes
     * @param nameToSave
     * @param keyLength
     * @returns {iCrypto}
     */

  }, {
    key: "createSYMKey",
    value: function createSYMKey() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("createSYMKey");
      var keyLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;
      var self = this;
      var key = iCrypto.getBytes(keyLength);
      self.set(nameToSave, forge.util.bytesToHex(key));
      return self;
    }
    /**
     * Sets passed SYM key inside the object
     * @param nameToSave
     * @param {string} key Must be hexified string
     */

  }, {
    key: "setSYMKey",
    value: function setSYMKey() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("setSYMKey");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("setSYMKey");
      this.set(nameToSave, key);
      return this;
    }
    /**
     * requires object of similar structure for key as being created by createSYMKey
     * @param target
     * @param key
     * @param nameToSave
     * @returns {Promise}
     */

  }, {
    key: "asyncAESEncrypt",
    value: function asyncAESEncrypt(target, key, nameToSave, hexify, mode, encoding) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        try {
          resolve(_this4.AESEncrypt(target, key, nameToSave, hexify, mode, encoding));
        } catch (err) {
          reject(err);
        }
      });
    }
    /**
     * Encrypts blob identified by "target" parameter.
     * Target must be set inside iCrypto object
     * IV is randomly generated and appended to the cipher blob
     * @param {string} target
     * @param {string} key
     * @param {string} nameToSave
     * @param {boolean} hexify - Specifies the encoding of the resulting cipher. Default: hex.
     * @param {string} mode - specifies AES mode. Default - CBC
     * @param {number} ivLength - specifies length of initialization vector
     *  The initialization vector of specified length will be generated and
     *  appended to the end of resulting cipher. IV blob will be encoded according to
     *  outputEncoding parameter, and its length will be last 3 bytes of the cipher string.
     *
     */

  }, {
    key: "AESEncrypt",
    value: function AESEncrypt() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("AESEncrypt");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("AESEncrypt");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("AESEncrypt");
      var hexify = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var mode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'CBC';
      var encoding = arguments.length > 5 ? arguments[5] : undefined;
      var self = this;

      if (!self.aes.modes.includes(mode.toUpperCase())) {
        throw "AESencrypt: Invalid AES mode";
      }

      mode = "AES-" + mode.toUpperCase(); //Creating random 16 bytes IV

      var iv = iCrypto.getBytes(16);
      var AESkey = forge.util.hexToBytes(self.get(key));
      var cipher = forge.cipher.createCipher(mode, AESkey);
      cipher.start({
        iv: iv
      });
      cipher.update(forge.util.createBuffer(this.get(target), encoding));
      cipher.finish();
      this.set(nameToSave, hexify ? forge.util.bytesToHex(iv) + cipher.output.toHex() : iv + cipher.output);
      return this;
    }
  }, {
    key: "asyncAESDecrypt",
    value: function asyncAESDecrypt(target, key, nameToSave) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        try {
          resolve(_this5.AESDecrypt(target, key, nameToSave));
        } catch (err) {
          reject(err);
        }
      });
    }
    /**
     * Decrypts the blob loaded into iCrypto object and specified by targe parameter
     * Assumes that initialization vector is PREPENDED to the cipher text
     * and its length is 16 bytes
     *
     * @param {string} target - ciphertext within iCrypto object
     * @param {string} key - Symmetric AES key in form of hex string
     * @param {string} nameToSave
     * @param {boolean} dehexify
     * @param {string} mode AES mode
     * @param {string} encoding - resulting plain text encoding default (UTF8)
     */

  }, {
    key: "AESDecrypt",
    value: function AESDecrypt() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("AESDecrypt");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("AESDecrypt");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("AESDecrypt");
      var dehexify = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var mode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "CBC";
      var encoding = arguments.length > 5 ? arguments[5] : undefined;
      var self = this;
      var cipherWOIV;

      if (!self.aes.modes.includes(mode.toUpperCase())) {
        throw "AESencrypt: Invalid AES mode";
      }

      mode = "AES-" + mode.toUpperCase();
      var cipher = self.get(target);
      var iv;

      if (dehexify) {
        iv = forge.util.hexToBytes(cipher.substring(0, 32));
        cipherWOIV = forge.util.hexToBytes(cipher.substr(32));
      } else {
        //Assuming cipher is a binary string
        cipherWOIV = cipher.substr(16);
        iv = cipher.substring(0, 16);
      }

      var AESkey = forge.util.hexToBytes(this.get(key));
      var decipher = forge.cipher.createDecipher(mode, AESkey);
      decipher.start({
        iv: iv
      });
      decipher.update(forge.util.createBuffer(cipherWOIV));
      decipher.finish();
      this.set(nameToSave, decipher.output.toString('utf8'));
      return this;
    }
  }, {
    key: "asyncHash",
    value: function asyncHash(target, nameToSave) {
      var _this6 = this;

      var algorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";
      return new Promise(function (resolve, reject) {
        try {
          resolve(_this6.hash(target, nameToSave, algorithm));
        } catch (err) {
          reject(err);
        }
      });
    }
    /**
     * This function meant to be used on large files
     * It is asynchronous, uses web workers,
     * and it calculates hash of a large file without loading it
     * fully into memory
     * @param file  -  value of an input of type file
     * @param nameToSave - name to store resulting hash
     * @param algorithm - sha256 is default
     */

  }, {
    key: "hashFileWorker",
    value: function hashFileWorker() {
      var _this7 = this;

      var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("fileHashWorker file");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("fileHashWorker nameToSave");
      var algorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";
      return new Promise(function (resolve, reject) {
        var self = _this7;

        if (Worker === undefined) {
          throw "Web workers are not supported in current environment";
        }

        var worker = new Worker("/js/iCryptoWorker.js");

        worker.onmessage = function (ev) {
          if (ev.data[0] === "success") {
            self.set(nameToSave, ev.data[1]);
            resolve(self);
            worker.terminate();
          } else {
            reject(ev.data[1]);
            worker.terminate();
          }
        };

        worker.postMessage(["hashFile", file]);
      });
    }
    /**
     * Initializes stream encryptor or decryptor
     *
     * Supported algorithm is chacha20 only
     * Single instance of a single stream cryptor can be used
     * only one time, one way, and only for a single stream.
     * Meaning you can take a single stream and encrypt it chunk by chunk,
     * but then, if you want to decrypt the stream,  you have to
     * re-initialize cryptor instance or use a new one,
     * otherwise the output will be meaningless.
     *
     * All the chunks must flow in sequence.
     *
     * !!!Important
     *
     * Encryption:
     * Stream cryptor handles initialization vector (iv)
     * by prepending them to cipher. So, to encrypt the data -
     * just pass the key and new iv will be created automatically
     * and prepended to the cipher
     *
     * Decryption:
     * On Decryption the algorithm ASSUMES that first 6 bytes of
     * the ciphertext is iv.
     * So, it will treat first 6 bytes as iv regardles of chunks,
     * and will begin decryption starting from byte 7
     *
     * @param {String} nameToSave - Stream cryptor will be saved inside iCrypto instance
     * @param {String} key String of bytes in hex - Symmetric key used to encrypt/decrypt data
     *  The algorithm requires key to be 32 bytes precisely
        Only first 32 bytes (after decoding hex) will be taken
     * @param {Boolean} isEncryptionMode - flag encryption mode - true
     * @param {String} algorithm Supports only chacha20 for now
     */

  }, {
    key: "initStreamCryptor",
    value: function initStreamCryptor() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("initStreamEncryptor");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("initStreamEncryptor");
      var isEncryptionMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var algorithm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "chacha20";
      var self = this;
      var ivRaw, ivHex, keyRaw, cryptor, ivBuffer;
      var mode = "enc";
      keyRaw = iCrypto.hexDecode(key);

      if (keyRaw.length < 16) {
        throw "chacha20: invalid key size: " + keyRaw.length + " key length must be 32 bytes";
      }

      var keyBuffer = iCrypto.stringToArrayBuffer(keyRaw).slice(0, 32);

      if (isEncryptionMode) {
        ivRaw = iCrypto.getBytes(6);
        ivHex = iCrypto.hexEncode(ivRaw);
        ivBuffer = iCrypto.stringToArrayBuffer(ivRaw).slice(0, 12);
        cryptor = new JSChaCha20(new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0);
      } else {
        mode = "dec";
        ivBuffer = new ArrayBuffer(0);
      }

      var res = new function () {
        var self = this;
        self.cryptor = cryptor;
        self.key = key;
        self.iv = ivHex;
        self.mode = mode;

        self.encryptionMode = function () {
          return self.mode === "enc";
        };

        self.decryptionMode = function () {
          return self.mode === "dec";
        };

        self.encrypt = function (input) {
          var blob = typeof input === "string" ? iCrypto.stringToArrayBuffer(input) : input;

          if (!(blob instanceof ArrayBuffer) && !(blob instanceof Uint8Array)) {
            throw "StreamCryptor encrypt: input type is invalid";
          }

          if (self.cryptor._byteCounter === 0) {
            //First check if counter is 0.
            //If so - it is a first encryption block and we need to prepend IV
            var encrypted = self.cryptor.encrypt(new Uint8Array(blob));
            return iCrypto.concatUint8Arrays(new Uint8Array(ivBuffer), encrypted);
          } else {
            //Just encrypting the blob
            return self.cryptor.encrypt(new Uint8Array(blob));
          }
        };

        self.decrypt = function (input) {
          var blob = typeof input === "string" ? iCrypto.stringToArrayBuffer(input) : input;

          if (!(blob instanceof ArrayBuffer)) {
            throw "StreamCryptor encrypt: input type is invalid";
          }

          if (self.cryptor === undefined) {
            //decryptor was not initialized yet because
            //Initalization vecotor (iv)was not yet obtained
            //IV assumed to be first 6 bytes prepended to cipher
            var currentIVLength = ivBuffer.byteLength;

            if (currentIVLength + blob.byteLength <= 12) {
              ivBuffer = iCrypto.concatArrayBuffers(ivBuffer, blob); //Still gathering iv, so returning empty array

              return new Uint8Array();
            } else {
              var remainingIVBytes = 12 - ivBuffer.byteLength;
              ivBuffer = iCrypto.concatArrayBuffers(ivBuffer, blob.slice(0, remainingIVBytes));
              self.iv = iCrypto.hexEncode(iCrypto.arrayBufferToString(ivBuffer));
              self.cryptor = new JSChaCha20(new Uint8Array(keyBuffer), new Uint8Array(ivBuffer), 0);
              var chunk = new Uint8Array(blob.slice(remainingIVBytes, blob.byteLength));
              return self.cryptor.decrypt(chunk);
            }
          } else {
            //Decrypto is initialized.
            // Just decrypting the blob and returning result
            return self.cryptor.decrypt(new Uint8Array(blob));
          }
        };
      }();
      self.set(nameToSave, res);
      return self;
    }
  }, {
    key: "streamCryptorGetIV",
    value: function streamCryptorGetIV() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("streamCryptorGetIV");
      var self = this;
      var cryptor = self.get(target);
      return cryptor.iv;
    }
  }, {
    key: "streamCryptorEncrypt",
    value: function streamCryptorEncrypt() {
      var cryptorID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("streamCryptorEncrypt");
      var blob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("streamCryptorEncrypt");
      var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "raw";
      var self = this;
      var input;
      var cryptor = self.get(cryptorID);

      if (!cryptor.encryptionMode()) {
        throw "streamCryptorEncrypt error: mode is invalid";
      }

      if (blob instanceof ArrayBuffer) {
        input = blob;
      } else if (blob instanceof Uint8Array) {
        input = blob.buffer;
      } else if (typeof blob === "string") {
        input = iCrypto.stringToArrayBuffer(blob);
      } else {
        throw "streamCryptorEncrypt: invalid format input";
      }

      if (encoding === undefined || encoding === "raw") {
        return cryptor.encrypt(input).buffer;
      } else {
        throw "NOT IMPLEMENTED";
      }
    }
  }, {
    key: "streamCryptorDecrypt",
    value: function streamCryptorDecrypt() {
      var cryptorID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("streamCryptorEncrypt");
      var blob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("streamCryptorEncrypt");
      var encoding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "raw";
      var self = this;
      var cryptor = self.get(cryptorID);
      var input;

      if (!cryptor.decryptionMode()) {
        throw "streamCryptorEncrypt error: mode is invalid";
      }

      if (blob instanceof ArrayBuffer) {
        input = blob;
      } else if (blob instanceof Uint8Array) {
        input = blob.buffer;
      } else if (typeof blob === "string") {
        input = iCrypto.stringToArrayBuffer(blob);
      } else {
        throw "streamCryptorEncrypt: invalid format input";
      }

      if (encoding === undefined || encoding === "raw") {
        return cryptor.decrypt(input).buffer;
      } else {
        throw "NOT IMPLEMENTED";
      }
    }
    /**
     *
     * @param target
     * @param nameToSave
     * @param algorithm
     */

  }, {
    key: "hash",
    value: function hash() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("hash");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("hash");
      var algorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";
      var self = this;
      var blob = self.get(target);

      if (typeof blob !== "string") {
        throw "hash: invalid target type: " + typeof_default()(blob) + "  Target must be string.";
      }

      algorithm = algorithm.toLowerCase();
      var hash = forge.md.hasOwnProperty(algorithm) ? forge.md[algorithm].create() : this.throwError("Wrong hash algorithm");
      hash.update(blob);
      this.set(nameToSave, hash.digest().toHex());
      return self;
    }
  }, {
    key: "createHash",
    value: function createHash() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("createHash");
      var algorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "sha256";
      var hash = sjcl.hash.hasOwnProperty(algorithm) ? new sjcl.hash[algorithm]() : this.throwError("Wrong hash algorithm");
      this.set(nameToSave, hash);
      return this;
    }
    /**
     *
     * @param target
     * @param {} blob can be binary string or arrayBuffer
     * @returns {iCrypto}
     */

  }, {
    key: "updateHash",
    value: function updateHash() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("updateHash: target");
      var blob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("updateHash: blob");
      var self = this;
      var input;

      if (typeof blob === "string") {
        input = iCrypto.stringToArrayBuffer(blob);
      } else if (blob instanceof Uint8Array) {
        input = blob.buffer;
      } else if (blob instanceof ArrayBuffer) {
        input = blob;
      } else {
        throw "invalid input format!";
      }

      var hash = self.get(target);
      hash.update(sjcl.codec.arrayBuffer.toBits(input));
      return self;
    }
  }, {
    key: "digestHash",
    value: function digestHash() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("digestHash");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("digestHash");
      var hexify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var self = this;
      var hRes = self.get(target);
      var res = hexify ? sjcl.codec.hex.fromBits(hRes.finalize()) : sjcl.codec.arrayBuffer.fromBits(hRes.finalize());
      this.set(nameToSave, res);
      return self;
    }
  }, {
    key: "asyncGenerateRSAKeyPair",
    value: function asyncGenerateRSAKeyPair() {
      var _this8 = this;

      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("asyncGenerateRSAKeyPair");
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2048;
      return new Promise(function (resolve, reject) {
        var self = _this8;
        forge.rsa.generateKeyPair({
          bits: length,
          workers: -1
        }, function (err, pair) {
          if (err) reject(err);else {
            try {
              var pubKey = forge.pki.publicKeyToPem(pair.publicKey);
              var privKey = forge.pki.privateKeyToPem(pair.privateKey);
              self.set(nameToSave, {
                publicKey: pubKey,
                privateKey: privKey
              });
              resolve(_this8);
            } catch (err) {
              reject(err);
            }
          }
        });
      });
    }
    /**
     * Generates RSA key pair.
     * Key saved in PEM format
     * resulting object has publicKey, privateKey, keyType, length
     * @param nameToSave
     * @param length
     * @returns {iCrypto}
     */

  }, {
    key: "generateRSAKeyPair",
    value: function generateRSAKeyPair() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("generateRSAKeyPair");
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2048;
      var self = this;
      var pair = forge.pki.rsa.generateKeyPair({
        bits: length,
        e: 0x10001
      });
      var pubKey = forge.pki.publicKeyToPem(pair.publicKey);
      var privKey = forge.pki.privateKeyToPem(pair.privateKey);
      self.set(nameToSave, {
        publicKey: pubKey,
        privateKey: privKey
      });
      return self;
    }
    /**
     * Takes previously saved RSA private key in PEM format,
     * extracts its public key
     * and saves it in PEM format under the name specified
     * @param target
     * @param nameToSave
     * @returns {iCrypto}
     */

  }, {
    key: "publicFromPrivate",
    value: function publicFromPrivate() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("publicFromPrivate");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("publicFromPrivate");
      var forgePrivateKey = forge.pki.privateKeyFromPem(this.get(target));
      this.set(nameToSave, forge.pki.publicKeyToPem(forgePrivateKey));
      return this;
    }
    /**
     * Accepts as an input RSA key and saves it inside an object under the name specified.
     * Key must be provided either in PEM or in raw base64.
     * @param {String} nameToSave
     * @param {String} keyData: public or private RSA key either in raw base64 or PEM format
     * @param {String} type: must be either "public" or "private"
     *
     * @returns {iCrypto}
     */

  }, {
    key: "setRSAKey",
    value: function setRSAKey() {
      var nameToSave = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("setRSAPublicKey");
      var keyData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("setRSAPublicKey");
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("setRSAPublicKey");

      if (type !== "public" && type !== "private") {
        throw "Invalid key type";
      }

      if (!iCrypto.isRSAPEMValid(keyData, type)) {
        keyData = iCrypto.base64ToPEM(keyData, type);
      }

      type === "public" ? forge.pki.publicKeyFromPem(keyData) : forge.pki.privateKeyFromPem(keyData);
      this.set(nameToSave, keyData);
      return this;
    }
    /**
     * For internal use only. Takes key data in form of a string
     * and checks whether it matches RSA PEM key format
     * @param {string} keyData
     * @param {string}type ENUM "public", "private"
     * @returns {boolean}
     */

  }, {
    key: "asyncPublicKeyEncrypt",
    value: function asyncPublicKeyEncrypt(target, keyPair, nameToSave, encoding) {
      var _this9 = this;

      return new Promise(function (resolve, reject) {
        try {
          resolve(_this9.publicKeyEncrypt(target, keyPair, nameToSave));
        } catch (err) {
          reject(err);
        }
      });
    }
    /**
     * creates and saves public key fingerprint
     * @param target - public key, either keypair or public key
     * @param nameToSave
     * @param hashAlgorithm
     * @returns {iCrypto}
     */

  }, {
    key: "getPublicKeyFingerprint",
    value: function getPublicKeyFingerprint() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("getPublicKeyFingerpint");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("getPublicKeyFingerpint");
      var hashAlgorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "sha256";
      var key = this.validateExtractRSAKey(this.get(target), "public");
      var forgeKey = forge.pki.publicKeyFromPem(key);
      var fingerprint = forge.pki.getPublicKeyFingerprint(forgeKey, {
        encoding: 'hex',
        md: forge.md[hashAlgorithm].create()
      });
      this.set(nameToSave, fingerprint);
      return this;
    }
  }, {
    key: "publicKeyEncrypt",
    value: function publicKeyEncrypt() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("publicKeyEncrypt");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("publicKeyEncrypt");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("publicKeyEncrypt");
      var encoding = arguments.length > 3 ? arguments[3] : undefined;
      key = this.validateExtractRSAKey(this.get(key), "public");
      var publicKey = forge.pki.publicKeyFromPem(key);
      var result = publicKey.encrypt(this.get(target));

      if (encoding) {
        result = this._encodeBlob(result, encoding);
      }

      this.set(nameToSave, result);
      return this;
    }
    /**
     * For internal use. Encode the blob in format specified
     * @param blob
     * @param encoding
     * @private
     */

  }, {
    key: "_encodeBlob",
    value: function _encodeBlob() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("_encodeBlob");
      var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("_encodeBlob");
      var self = this;

      if (!this.encoders.hasOwnProperty(encoding)) {
        throw "_encodeBlob: Invalid encoding: " + encoding;
      }

      return self.encoders[encoding](blob);
    }
  }, {
    key: "_decodeBlob",
    value: function _decodeBlob() {
      var blob = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("_encodeBlob");
      var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("_encodeBlob");
      var self = this;

      if (!this.encoders.hasOwnProperty(encoding)) {
        throw "_decodeBlob: Invalid encoding: " + encoding;
      }

      return this.decoders[encoding](blob);
    }
  }, {
    key: "asyncPrivateKeyDecrypt",
    value: function asyncPrivateKeyDecrypt(target, key, nameToSave) {
      var _this10 = this;

      return new Promise(function (resolve, reject) {
        try {
          resolve(_this10.privateKeyDecrypt(target, key, nameToSave));
        } catch (err) {
          reject(err);
        }
      });
    }
  }, {
    key: "privateKeyDecrypt",
    value: function privateKeyDecrypt() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("privateKeyDecrypt");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("privateKeyDecrypt");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("privateKeyDecrypt");
      var encoding = arguments.length > 3 ? arguments[3] : undefined;
      key = this.validateExtractRSAKey(this.get(key), "private");
      var privateKey = forge.pki.privateKeyFromPem(key);
      var cipher = this.get(target);

      if (encoding) {
        cipher = this._decodeBlob(cipher, encoding);
      }

      this.set(nameToSave, privateKey.decrypt(cipher));
      return this;
    }
  }, {
    key: "asyncPrivateKeySign",
    value: function asyncPrivateKeySign(target, keyPair, nameToSave) {
      var _this11 = this;

      return new Promise(function (resolve, reject) {
        try {
          resolve(_this11.privateKeySign(target, keyPair, nameToSave));
        } catch (err) {
          reject(err);
        }
      });
    }
  }, {
    key: "privateKeySign",
    value: function privateKeySign() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("privateKeyEncrypt");
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("privateKeyEncrypt");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("privateKeyEncrypt");
      var hashAlgorithm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "sha256";
      var hexifySign = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      key = this.validateExtractRSAKey(this.get(key), "private");
      var privateKey = forge.pki.privateKeyFromPem(key);
      var md = forge.md[hashAlgorithm].create();
      md.update(this.get(target));
      var signature = privateKey.sign(md);
      signature = hexifySign ? forge.util.bytesToHex(signature) : signature;
      this.set(nameToSave, signature);
      return this;
    }
  }, {
    key: "asyncPublicKeyVerify",
    value: function asyncPublicKeyVerify(target, signature, key, nameToSave) {
      var _this12 = this;

      return new Promise(function (resolve, reject) {
        try {
          resolve(_this12.publicKeyVerify(target, signature, key, nameToSave));
        } catch (err) {
          reject(err);
        }
      });
    }
  }, {
    key: "publicKeyVerify",
    value: function publicKeyVerify() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("publicKeyVerify");
      var signature = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("publicKeyVerify");
      var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("publicKeyVerify");
      var nameToSave = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : iCrypto.pRequired("publicKeyVerify");
      var dehexifySignRequired = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      key = this.validateExtractRSAKey(this.get(key), "public");
      var publicKey = forge.pki.publicKeyFromPem(key);
      var md = forge.md.sha256.create();
      md.update(this.get(target));
      var sign = this.get(signature);
      sign = dehexifySignRequired ? forge.util.hexToBytes(sign) : sign;
      var verified = publicKey.verify(md.digest().bytes(), sign);
      this.set(nameToSave, verified);
      return this;
    }
    /**
     * Validates and extracts RSA key from either keypair
     * or separate private or public keys saved previously within the object.
     * Checks PEM structure and returns requested key in PEM format
     * or throws error if something wrong
     * @param key - target key
     * @param type - "public" or "private"
     * @return public or private key in PEM format
     */

  }, {
    key: "validateExtractRSAKey",
    value: function validateExtractRSAKey() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("validateAndExtractRSAKey");
      var keyType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("validateAndExtractRSAKey");
      var keyTypes = {
        public: "publicKey",
        private: "privateKey"
      };
      if (!Object.keys(keyTypes).includes(keyType)) throw "validateExtractRSAKey: key type is invalid!";

      if (key[keyTypes[keyType]]) {
        key = key[keyTypes[keyType]];
      }

      if (!iCrypto.isRSAPEMValid(key, keyType)) {
        console.log(keyType);
        console.log(key);
        throw "validateExtractRSAKey: Invalid key format";
      }

      return key;
    }
  }, {
    key: "pemToBase64",
    value: function pemToBase64() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("pemToBase64");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("pemToBase64");
      var keyType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("pemToBase64");
      var key = this.get(target);

      if (!iCrypto.isRSAPEMValid(key, keyType)) {
        console.log(keyType);
        console.log(key);
        throw "validateExtractRSAKey: Invalid key format";
      }

      key = key.trim().split(/\r?\n/).slice(1, -1).join("");
      this.set(nameToSave, key);
    }
    /***#### COMPRESSION ####***/

  }, {
    key: "asyncCompress",
    value: function asyncCompress(target, nameToSave) {
      var _this13 = this;

      return new Promise(function (resolve, reject) {
        try {
          resolve(_this13.compress(target, nameToSave));
        } catch (err) {
          reject(err);
        }
      });
    }
    /**
     * Compresses data under key name
     * @param target
     *  type: String
     *  Key to data that needed to be compressed
     * @param nameToSave
     *  type: String
     *  if passed - function will save the result of compression under this key
     *  otherwise the compression will happen in-place
     */

  }, {
    key: "compress",
    value: function compress() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("compress");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("compress");
      var compressed = LZMA.compress(this.get(target));
      this.set(nameToSave, compressed);
      return this;
    }
  }, {
    key: "asyncDecompress",
    value: function asyncDecompress(target, nameToSave) {
      var _this14 = this;

      return new Promise(function (resolve, reject) {
        try {
          resolve(_this14.decompress(target, nameToSave));
        } catch (err) {
          reject(err);
        }
      });
    }
    /**
     * Decompresses data under key name
     * @param target
     *  type: String
     *  Key to data that needed to be compressed
     * @param nameToSave
     *  type: String
     *  if passed - function will save the result of compression under this key
     *  otherwise decompression will happen in-place
     */

  }, {
    key: "decompress",
    value: function decompress() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("decompress");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("decompress");
      var decompressed = LZMA.decompress(this.get(target));
      this.set(nameToSave, decompressed);
      return this;
    }
    /***#### UTILS ####***/

  }, {
    key: "encode",
    value: function encode() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("encode");
      var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("encode");
      var nameToSave = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("encode");
      var self = this;
      self.set(nameToSave, self._encodeBlob(this.get(target), encoding));
      return this;
    }
  }, {
    key: "base64Encode",
    value: function base64Encode() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("base64Encode");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("base64Encode");
      var stringify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var target = stringify ? JSON.stringify(this.get(name)) : this.get(name);
      this.set(nameToSave, iCrypto.base64Encode(target));
      return this;
    }
  }, {
    key: "base64Decode",
    value: function base64Decode() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("base64decode");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("base64decode");
      var jsonParse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var decoded = iCrypto.base64Decode(this.get(name));
      decoded = jsonParse ? JSON.parse(decoded) : decoded;
      this.set(nameToSave, decoded);
      return this;
    }
    /*
        base32Encode(name = this.pRequired("base32Encode"),
                     nameToSave = this.pRequired("base32Encode")){
            let base32 = new Base32();
            let encoded = base32.encode(this.get(name));
            this.set(nameToSave, encoded);
            return this;
        }
          base32Decode(name = this.pRequired("base64decode"),
                     nameToSave = this.pRequired("base64decode")){
            let base32 = new Base32();
            let decoded = base32.decode(this.get(name));
            this.set(nameToSave, decoded);
            return this;
        }
    /**/

  }, {
    key: "bytesToHex",
    value: function bytesToHex() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("bytesToHex");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("bytesToHex");
      var stringify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var target = stringify ? JSON.stringify(this.get(name)) : this.get(name);
      this.set(nameToSave, iCrypto.hexEncode(target));
      return this;
    }
  }, {
    key: "hexToBytes",
    value: function hexToBytes() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("hexToBytes");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("hexToBytes");
      var jsonParse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var decoded = iCrypto.hexDecode(this.get(name));
      decoded = jsonParse ? JSON.parse(decoded) : decoded;
      this.set(nameToSave, decoded);
      return this;
    }
  }, {
    key: "stringifyJSON",
    value: function stringifyJSON() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("stringify");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("stringify");
      var target = this.get(name);

      if (typeof_default()(target) !== "object") {
        throw "stringifyJSON: target invalid";
      }

      this.set(nameToSave, JSON.stringify(target));
      return this;
    }
  }, {
    key: "parseJSON",
    value: function parseJSON() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("stringify");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("stringify");
      var target = this.get(name);

      if (typeof target !== "string") {
        throw "stringifyJSON: target invalid";
      }

      this.set(nameToSave, JSON.parse(target));
      return this;
    }
    /**
     * Merges elements into a single string
     * if name passed - saves the merge result inside the object
     * under key <name>.
     * @param things
     *     type: array
     *     array of strings. Each string is a key.
     * @param name
     *     type: string
     *     name of the key under which to save the merge result
     */

  }, {
    key: "merge",
    value: function merge() {
      var things = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("merge");
      var nameToSave = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("merge");
      if (!this.keysExist(things)) throw "merge: some or all objects with such keys not found ";
      console.log("Mergin' things");
      var result = "";

      for (var i = 0; i < things.length; ++i) {
        var candidate = this.get(things[i]);
        if (typeof candidate === "string" || typeof candidate === "number") result += candidate;else throw "Object " + things[i] + " is not mergeable";
      }

      this.set(nameToSave, result);
      return this;
    }
  }, {
    key: "encodeBlobLength",
    value: function encodeBlobLength() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iCrypto.pRequired("encodeBlobLength");
      var targetLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : iCrypto.pRequired("encodeBlobLength");
      var paddingChar = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : iCrypto.pRequired("encodeBlobLength");
      var nameToSave = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : iCrypto.pRequired("encodeBlobLength");

      if (typeof paddingChar !== "string") {
        throw "encodeBlobLength: Invalid padding char";
      }

      var l = String(this.get(target).length);
      var paddingLength = targetLength - l.length;

      if (paddingLength < 0) {
        throw "encodeBlobLength: String length exceedes target length";
      }

      var padding = paddingChar[0].repeat(paddingLength);
      this.set(nameToSave, padding + l);
      return this;
    }
    /************SERVICE FUNCTIONS**************/

  }, {
    key: "get",
    value: function get(name) {
      if (this.keysExist(name)) return this.store[name];
      throw "Property " + name + " not found";
    }
  }, {
    key: "set",
    value: function set(name, value) {
      if (this.locked) throw "Cannot add property: object locked";
      this.assertKeysAvailable(name);
      this.store[name] = value;
    }
  }, {
    key: "lock",
    value: function lock() {
      this.locked = true;
    }
  }, {
    key: "unlock",
    value: function unlock() {
      this.locked = false;
    }
  }, {
    key: "assertKeysAvailable",
    value: function assertKeysAvailable(keys) {
      if (this.keysExist(keys)) throw "Cannot add property: " + keys.toString() + " property with such name already exists";
    }
  }, {
    key: "keysExist",
    value: function keysExist(keys) {
      if (!keys) throw "keysExist: Missing required arguments";
      if (typeof keys === "string" || typeof keys === "number") return this._keyExists(keys);
      if (typeof_default()(keys) !== "object") throw "keysExist: unsupported type";
      if (keys.length < 1) throw "array must have at least one key";
      var currentKeys = Object.keys(this.store);

      for (var i = 0; i < keys.length; ++i) {
        if (!currentKeys.includes(keys[i].toString())) return false;
      }

      return true;
    }
  }, {
    key: "_keyExists",
    value: function _keyExists(key) {
      if (!key) throw "keyExists: Missing required arguments";
      return Object.keys(this.store).includes(key.toString());
    }
  }, {
    key: "throwError",
    value: function throwError() {
      var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Unknown error";
      throw message;
    }
  }], [{
    key: "isRSAPEMValid",
    value: function isRSAPEMValid(keyData, type) {
      keyData = keyData.trim();
      var headerPattern = type === "public" ? /^-{4,5}BEGIN.*PUBLIC.*KEY.*-{4,5}/ : /^-{4,5}BEGIN.*PRIVATE.*KEY.*-{4,5}/;
      var footerPattern = type === "public" ? /^-{4,5}END.*PUBLIC.*KEY.*-{4,5}/ : /^-{4,5}END.*PRIVATE.*KEY.*-{4,5}/;
      var valid = true;
      keyData = keyData.replace(/\r?\n$/, "");
      var keyDataArr = keyData.split(/\r?\n/);
      valid = valid && keyDataArr.length > 2 && headerPattern.test(keyDataArr[0]) && footerPattern.test(keyDataArr[keyDataArr.length - 1]);
      return valid;
    }
  }, {
    key: "base64ToPEM",
    value: function base64ToPEM(keyData, type) {
      var header = type === "public" ? "-----BEGIN PUBLIC KEY-----" : "-----BEGIN RSA PRIVATE KEY-----";
      var footer = type === "public" ? "-----END PUBLIC KEY-----" : "-----END RSA PRIVATE KEY-----";
      var result = header;

      for (var i = 0; i < keyData.length; ++i) {
        result += i % 64 === 0 ? "\r\n" + keyData[i] : keyData[i];
      }

      result += "\r\n" + footer;
      return result;
    }
  }, {
    key: "arrayBufferToString",
    value: function arrayBufferToString(buf) {
      return String.fromCharCode.apply(null, new Uint16Array(buf));
    }
  }, {
    key: "stringToArrayBuffer",
    value: function stringToArrayBuffer(str) {
      var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char

      var bufView = new Uint16Array(buf);

      for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }

      return buf;
    }
    /**
     * TODO make it universal and for arbitrary number of arrays     *
     * @param arr1
     * @param arr2
     * @returns {Uint8Array}
     */

  }, {
    key: "concatUint8Arrays",
    value: function concatUint8Arrays(arr1, arr2) {
      var res = new Uint8Array(arr1.byteLength + arr2.byteLength);
      res.set(arr1, 0);
      res.set(arr2, arr1.byteLength);
      return res;
    }
    /**
     * Concatinates 2 array buffers in order buffer1 + buffer2
     * @param {ArrayBuffer} buffer1
     * @param {ArrayBuffer} buffer2
     * @returns {ArrayBufferLike}
     */

  }, {
    key: "concatArrayBuffers",
    value: function concatArrayBuffers(buffer1, buffer2) {
      var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
      return tmp.buffer;
    }
  }, {
    key: "getBytes",
    value: function getBytes(length) {
      return forge.random.getBytesSync(length);
    }
  }, {
    key: "hexEncode",
    value: function hexEncode(blob) {
      return forge.util.bytesToHex(blob);
    }
  }, {
    key: "hexDecode",
    value: function hexDecode(blob) {
      return forge.util.hexToBytes(blob);
    }
  }, {
    key: "base64Encode",
    value: function base64Encode(blob) {
      return forge.util.encode64(blob);
    }
  }, {
    key: "base64Decode",
    value: function base64Decode(blob) {
      return forge.util.decode64(blob);
    }
    /**
     * Returns random integer
     * @param a
     * @param b
     */

  }, {
    key: "randInt",
    value: function randInt(min, max) {
      if (max === undefined) {
        max = min;
        min = 0;
      }

      if (typeof min !== 'number' || typeof max !== 'number') {
        throw new TypeError('Expected all arguments to be numbers');
      }

      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  }, {
    key: "createRandomHexString",
    value: function createRandomHexString(length) {
      var bytes = iCrypto.getBytes(length);
      var hex = iCrypto.hexEncode(bytes);
      var offset = iCrypto.randInt(0, hex.length - length);
      return hex.substring(offset, offset + length);
    }
  }, {
    key: "pRequired",
    value: function pRequired() {
      var functionName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "iCrypto function";
      throw functionName + ": missing required parameter!";
    }
  }]);

  return iCrypto;
}();
// CONCATENATED MODULE: ./src/js/app.js


//Viendors
 //import { $ } from "jquery";
//import { toastr } from "toastr";
//import { io } from "socket.io-client";
//import { bar } from "loading-bar";
//import { waitMe } from "./lib/waitMe.min"
//import { WildEmitter } from "./chat/WildEmitter";


window.iCrypto = iCrypto_iCrypto;

var ChatClient = __webpack_require__(15).default; //chat page


var chat;
var DAYSOFWEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; //variables to create new topic

var app_nickname, topicName; //variables to topic login

var topicID;
var sounds = {};
var soundsOnOfIcons = {
  on: "/img/sound-on.png",
  off: "/img/sound-off.png"
};
var sendLock = false;
var mainMenuItems = [{
  index: 0,
  subtitle: "Login",
  selector: "#login-container",
  active: true
}, {
  index: 1,
  subtitle: "Join",
  selector: "#join-by-invite-container",
  active: false
}, {
  index: 2,
  subtitle: "New",
  selector: "#new-topic-container",
  active: false
}];
var tempName;
var recording = false; //variables to display new topic data
//let newPubKey, newPrivKey, newNickname, newTopicID, newTopicName;

document.addEventListener('DOMContentLoaded', function (event) {
  console.log('initializing chat....');
  chat = new ChatClient();
  loadSounds();
  setView("auth");
  setupChatListeners(chat);
  document.querySelector('#create-topic').addEventListener('click', createTopic);
  document.querySelector('#login-topic').addEventListener('click', topicLogin);
  document.querySelector('#join-topic').addEventListener('click', joinTopic);
  document.querySelector('#send-new-msg').addEventListener('click', sendMessage);
  document.querySelector('#close-code-view').addEventListener('click', closeCodeView);
  document.querySelector('#new-invite').addEventListener('click', generateInvite);
  document.querySelector('#user-name').addEventListener('change', editMyNickname);
  document.querySelector('#topic-name').addEventListener('change', editTopicName);
  document.querySelector('#refresh-invites').addEventListener('click', refreshInvites);
  document.querySelector('#attach-file').addEventListener('change', processAttachmentChosen);
  document.querySelector('#re-connect').addEventListener('click', attemptReconnection);
  document.querySelector('#sounds-switch').addEventListener('click', switchSounds);
  document.querySelector('.right-arrow-wrap').addEventListener('click', processMainMenuSwitch);
  document.querySelector('.left-arrow-wrap').addEventListener('click', processMainMenuSwitch);
  $('#new-msg').keydown(function (e) {
    if (!e.ctrlKey && e.keyCode === 13) {
      event.preventDefault();
      sendMessage();
      moveCursor(e.target, "start");
      return false;
    } else if (e.ctrlKey && e.keyCode === 13) {
      e.target.value += "\n";
      moveCursor(e.target, "end");
    }
  });
  $('#chat_window').scroll(processChatScroll);
  $('#private-key').keyup(
  /*#__PURE__*/
  function () {
    var _ref = asyncToGenerator_default()(
    /*#__PURE__*/
    regenerator_default.a.mark(function _callee(e) {
      return regenerator_default.a.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(e.keyCode === 13)) {
                _context.next = 3;
                break;
              }

              _context.next = 3;
              return topicLogin();

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
  $('#join-nickname, #invite-code').keyup(
  /*#__PURE__*/
  function () {
    var _ref2 = asyncToGenerator_default()(
    /*#__PURE__*/
    regenerator_default.a.mark(function _callee2(e) {
      return regenerator_default.a.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(e.keyCode === 13)) {
                _context2.next = 3;
                break;
              }

              _context2.next = 3;
              return joinTopic();

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
  $('#new-topic-nickname, #new-topic-name').keyup(
  /*#__PURE__*/
  function () {
    var _ref3 = asyncToGenerator_default()(
    /*#__PURE__*/
    regenerator_default.a.mark(function _callee3(e) {
      return regenerator_default.a.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (e.keyCode === 13) {
                createTopic();
              }

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
  enableSettingsMenuListeners();
});

function loadSounds() {
  var sMap = {
    "incoming_message": "message_incoming.mp3",
    "message_sent": "message_sent.mp3",
    "user_online": "user_online.mp3"
  };

  var _arr = Object.keys(sMap);

  for (var _i = 0; _i < _arr.length; _i++) {
    var s = _arr[_i];
    sounds[s] = new Audio("/sounds/" + sMap[s]);
    sounds[s].load();
  }
}

function playSound(sound) {
  if (chat.session.settings.soundsOn) {
    sounds[sound].play();
  }
}

function moveCursor(el, pos) {
  if (pos === "end") {
    moveCursorToEnd(el);
  } else if (pos === "start") {
    moveCursorToStart(el);
  }
}

function moveCursorToEnd(el) {
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != "undefined") {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

function moveCursorToStart(el) {
  if (typeof el.selectionStart == "number") {
    el.selectionStart = el.selectionEnd = 0;
  } else if (typeof el.createTextRange != "undefined") {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

function createTopic() {
  app_nickname = document.querySelector('#new-topic-nickname').value.trim();
  topicName = document.querySelector('#new-topic-name').value.trim();
  loadingOn();
  chat.initTopic(app_nickname, topicName).then(function (data) {
    console.log("Topic create attempt successful");
    app_nickname.value = "";
    topicName.value = "";
  }).catch(function (err) {
    console.log("Error creating topic: " + err);
    loadingOff();
  });
}

function topicLogin() {
  return _topicLogin.apply(this, arguments);
}

function _topicLogin() {
  _topicLogin = asyncToGenerator_default()(
  /*#__PURE__*/
  regenerator_default.a.mark(function _callee4() {
    var privKey;
    return regenerator_default.a.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            loadingOn();
            console.log("called topic login");
            privKey = document.querySelector('#private-key').value;
            clearLoginPrivateKey();
            _context4.next = 6;
            return chat.topicLogin(privKey);

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));
  return _topicLogin.apply(this, arguments);
}

function joinTopic() {
  return _joinTopic.apply(this, arguments);
}

function _joinTopic() {
  _joinTopic = asyncToGenerator_default()(
  /*#__PURE__*/
  regenerator_default.a.mark(function _callee5() {
    var inviteCode, nickname, data;
    return regenerator_default.a.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            inviteCode = document.querySelector('#invite-code').value.trim();
            nickname = document.querySelector('#join-nickname').value.trim();
            loadingOn();
            _context5.prev = 3;
            _context5.next = 6;
            return chat.initTopicJoin(nickname, inviteCode);

          case 6:
            data = _context5.sent;
            _context5.next = 13;
            break;

          case 9:
            _context5.prev = 9;
            _context5.t0 = _context5["catch"](3);
            toastr.error("Topic was not created. Error: " + _context5.t0);
            loadingOff();

          case 13:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[3, 9]]);
  }));
  return _joinTopic.apply(this, arguments);
}

function setupChatListeners(chat) {
  chat.on("init_topic_success", function (data) {
    loadingOff();
    displayNewTopicData(data);
  });
  chat.on("init_topic_error", function (err) {
    var msg;

    if (err instanceof Error) {
      msg = err.message;
    } else {
      msg = err;
    }

    loadingOff();
    toastr.error("Topic was not created. Error: " + msg);
  });
  chat.on("login_success", function (messages) {
    document.querySelector('#sounds-switch').src = chat.session.settings.soundsOn ? soundsOnOfIcons.on : soundsOnOfIcons.off;
    loadingOff();
    clearAllInputs();
    processLogin(messages);
    playSound("user_online");
    toastr.success("You are now online!");
  });
  chat.on("unknown_error", function (err) {
    console.log("unknown_error emited by chat: " + err);
    toastr.error("Chat error: " + err);
  });
  chat.on("login_fail", function (err) {
    clearLoginPrivateKey();
    loadingOff();
    console.log("Login fail emited by chat: " + err);
    toastr.error("Login fail: " + err);
  });
  chat.on('request_invite_success', function (inviteID) {
    buttonLoadingOff(document.querySelector("#new-invite"));
    showInviteCode(inviteID);
  });
  chat.on('invite_updated', function () {
    toastr.info("Invite updated!");
  });
  chat.on("new_member_joined", function (data) {
    processNewMemberJoin(data);
  });
  chat.on("settings_updated", function () {
    updateParticipants();
    syncPendingInvites();
    updateLoadedMessages();
  });
  chat.on("participant_booted", function (message) {
    updateParticipants();
    toastr.info(message);
  });
  chat.on("metadata_updated", function () {
    updateParticipants();
    updateLoadedMessages();
  });
  chat.on("boot_participant_success", function (message) {
    updateParticipants();
    toastr.info(message);
  });
  chat.on("u_booted", function (message) {
    toastr.warning(message);
  });
  chat.on("boot_participant_fail", function (message) {
    toastr.warning("Participant booting failed: " + message);
  });
  chat.on("topic_join_success", function (data) {
    processTopicJoinSuccess(data);
  });
  chat.on("del_invite_fail", function () {
    toastr.warning("Error deleting invite");
  });
  chat.on("del_invite_success", function () {
    syncPendingInvites();
    toastr.info("Invite was deleted");
  });
  chat.on("chat_message", function (data) {
    processIncomingMessage(data);
    playSound("incoming_message");
  });
  chat.on("send_success", function (message) {
    playSound("message_sent");
    messageSendSuccess(message);
  });
  chat.on("send_fail", function (message) {
    messageSendFail(message);
  });
  chat.on("service_record", function (record) {
    processServiceRecord(record);
  });
  chat.on("sync_invites_success", function () {
    refreshInvitesSuccess();
  });
  chat.on("sync_invites_error", function (msg) {
    buttonLoadingOff(document.querySelector('#refresh-invites'));
    toastr.warning("Invite request failed: " + msg);
  });
  chat.on("request_invite_error", function (msg) {
    buttonLoadingOff(document.querySelector('#new-invite'));
    toastr.warning("Invite request failed: " + msg);
  });
  chat.on("messages_loaded", function (messages) {
    processMessagesLoaded(messages);
  });
  chat.on("connected_to_island", function () {
    switchConnectionStatus(true);
  });
  chat.on("disconnected_from_island", function () {
    switchConnectionStatus(false);
  });
  chat.on("download_complete", function (res) {
    var fileInfo = JSON.parse(res.fileInfo);
    var fileData = res.fileData;

    if (/audio/.test(fileInfo.type)) {
      loadAudio(fileInfo, fileData);
    } else {
      downloadAttachment(fileInfo.name, fileData);
    }
  });
}

function processIncomingMessage(message) {
  var pkfp = message.header.author;
  var storedNickname = chat.getMemberNickname(pkfp);

  if (storedNickname !== message.header.nickname) {
    chat.setMemberNickname(pkfp, message.header.nickname);
    storedNickname = chat.getMemberNickname(pkfp);
    chat.saveClientSettings(chat.session.publicKeyFingerprint);
  }

  var alias = chat.getMemberAlias(pkfp);
  var timestamp = message.header.timestamp;
  appendMessageToChat({
    nickname: storedNickname,
    alias: alias,
    timestamp: timestamp,
    pkfp: pkfp,
    body: message.body,
    messageID: message.header.id,
    private: message.header.private,
    recipient: message.header.recipient,
    attachments: message.attachments
  });
  toastr["info"]("New message from " + chat.getMemberRepr(pkfp));
}

function processServiceRecord(record) {
  var timestamp = record.header.timestamp;
  var pkfp = record.header.author;
  appendMessageToChat({
    nickname: "Service",
    timestamp: timestamp,
    messageID: record.header.id,
    pkfp: "service",
    body: record.body,
    service: record.header.service,
    attachments: record.attachments
  });
}

function sendMessage() {
  ensureConnected();

  if (sendLock) {
    return;
  }

  lockSend(true);
  var message = document.querySelector('#new-msg');
  var attachments = document.querySelector('#attach-file').files;
  var addresseeSelect = document.querySelector("#select-member");
  var addressee = addresseeSelect[addresseeSelect.selectedIndex].value;

  if (message.value.trim() === "" && attachments.length === 0) {
    lockSend(false);
    return;
  }

  if (addressee === "ALL") {
    chat.shoutMessage(message.value.trim(), attachments).then(function () {
      console.log("Send message resolved");
    }).catch(function (err) {
      console.log("Error sending message" + err.message);
      lockSend(false);
    });
  } else {
    chat.whisperMessage(addressee, message.value.trim()).then(function () {
      console.log("Done whispering message!");
    }).catch(function (err) {
      console.log("Error sending message" + err.message);
      lockSend(false);
    });
  }

  message.value = "";
}

function messageSendSuccess(message) {
  var pkfp = message.header.author;
  var nickname = chat.getMemberNickname(pkfp) || message.header.nickname;
  var timestamp = message.header.timestamp;
  appendMessageToChat({
    nickname: nickname,
    timestamp: timestamp,
    pkfp: pkfp,
    body: message.body,
    messageID: message.header.id,
    attachments: message.attachments,
    private: message.header.private,
    recipient: message.header.recipient
  });
  clearAttachments();
  lockSend(false);
}

function messageSendFail(message) {
  console.log("Message send fail");
  lockSend(false);
}

function get_current_time() {
  var d = new Date();
  return padWithZeroes(2, d.getHours()) + ':' + padWithZeroes(2, d.getMinutes());
}

function getChatFormatedDate(timestamp) {
  var d = new Date(timestamp);
  var today = new Date();

  if (Math.floor((today - d) / 1000) <= 64000) {
    return d.getHours() + ':' + padWithZeroes(2, d.getMinutes());
  } else {
    return DAYSOFWEEK[d.getDay()] + ", " + d.getMonth() + "/" + padWithZeroes(2, d.getDate()) + " " + padWithZeroes(2, d.getHours()) + ':' + padWithZeroes(2, d.getMinutes());
  }
}

function padWithZeroes(requiredLength, value) {
  var res = "0".repeat(requiredLength) + String(value).trim();
  return res.substr(res.length - requiredLength);
}

function isMyMessage(pkfp) {
  return chat.session.publicKeyFingerprint === pkfp;
}

function processNewMemberJoin() {
  if (!chat.session) {
    console.log("Not logged in, nothing to update");
    return;
  }

  console.log("NEW MEMBER JOINED. UPDATING INFO");
  updateParticipants();
  syncPendingInvites();
  toastr.info("New member just joined the channel!");
}

function bootParticipant(event) {
  console.log("About to boot participant");
  ensureConnected();
  var participantPkfp = event.target.parentElement.parentElement.lastElementChild.innerHTML;
  var participant = chat.session.settings.membersData[participantPkfp];

  if (participantPkfp == chat.session.publicKeyFingerprint) {
    if (confirm("Are you sure you want to leave this topic?")) {
      console.log("Leaving topic");
      return;
    }
  }

  if (confirm("Are you sure you want to boot " + participant + "? ")) {
    chat.bootParticipant(participantPkfp);
  }
}

function addParticipantToSettings(key) {
  var records = document.querySelector("#participants-records");
  var participant = chat.session.metadata.participants[key];

  if (!participant) {
    console.error("Error adding participant");
    return;
  }

  var wrapper = document.createElement("div");
  var id = document.createElement("div");
  var nickname = document.createElement("div");
  var rights = document.createElement("div");
  var actions = document.createElement("div");
  var delButton = document.createElement("div");
  id.setAttribute("class", "participant-id");
  wrapper.setAttribute("class", "participant-wrapper");
  nickname.setAttribute("class", "p-nickname");
  rights.setAttribute("class", "p-rights");
  actions.setAttribute("class", "p-actions");
  delButton.setAttribute("class", "boot-participant");
  delButton.addEventListener("click", bootParticipant);
  nickname.innerHTML = chat.getMemberRepr(key);
  rights.innerHTML = participant.rights;
  delButton.innerHTML = "Boot";
  id.innerHTML = key;
  wrapper.appendChild(id);
  wrapper.appendChild(nickname);
  wrapper.appendChild(rights);
  actions.appendChild(delButton);
  wrapper.appendChild(actions);
  wrapper.appendChild(id);
  records.appendChild(wrapper);
}

function updateParticipants() {
  $('#online-users-list').html("");
  $('#participants-records').html("");
  $('#participants--topic-name').html("Topic: " + chat.session.settings.topicName);
  var mypkfp = chat.session.publicKeyFingerprint;
  var participantsKeys = Object.keys(chat.session.metadata.participants).filter(function (val) {
    return val !== mypkfp;
  });
  var recipientChoice = document.querySelector("#select-member");
  var defaultRecipient = document.createElement("option");
  defaultRecipient.setAttribute("value", "ALL");
  defaultRecipient.innerText = "All";
  recipientChoice.innerHTML = "";
  recipientChoice.appendChild(defaultRecipient);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = participantsKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var pkfp = _step.value;
      addParticipantToSettings(pkfp);
      var participantId = document.createElement("span");
      participantId.classList.add("online-user-id");
      participantId.innerText = pkfp;
      var status = document.createElement("img");
      status.classList.add("participant-status");
      status.setAttribute("src", "/img/online.png");
      var pName = document.createElement("input");
      pName.value = chat.getMemberAlias(pkfp) || chat.getMemberNickname(pkfp) || "Anonymous";
      pName.addEventListener("change", participantAliasChange);
      pName.classList.add("participant-alias");
      var pRow = document.createElement("div");
      pRow.classList.add("online-user-row");
      pRow.appendChild(participantId);
      pRow.appendChild(status);
      pRow.appendChild(pName);

      if (chat.getMemberAlias(pkfp)) {
        var chosenName = document.createElement("span");
        chosenName.innerText = "(" + (chat.getMemberNickname(pkfp) || "Anonymous") + ")";
        pRow.appendChild(chosenName);
      }

      document.querySelector("#online-users-list").appendChild(pRow); //Adding to list of recipients

      var recipientOption = document.createElement("option");
      recipientOption.setAttribute("value", pkfp);
      recipientOption.innerText = pName.value + " (" + chat.getMemberNickname(pkfp) + ")";
      recipientChoice.appendChild(recipientOption);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var participantsRecords = document.querySelector("#participants-records");

  if (participantsRecords.children.length > 0) {
    participantsRecords.lastChild.classList.add("participant-wrapper-last");
  }
}

function updateLoadedMessages() {
  document.querySelector("#chat_window").childNodes.forEach(function (msg) {
    if (msg.classList.contains("service-record")) {
      return;
    } else if (msg.classList.contains("my_message")) {
      if (!msg.classList.contains("private-message")) {
        return;
      }

      try {
        var heading = msg.firstChild;
        var pkfp = heading.querySelector(".m-recipient-id").innerHTML;
        heading.querySelector(".private-mark").innerText = "(private to " + chat.getMemberAlias(pkfp) + ")";
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        var _heading = msg.firstChild;

        var _pkfp = _heading.querySelector(".m-author-id").innerHTML;

        _heading.querySelector(".m-alias").innerText = chat.getMemberAlias(_pkfp);
      } catch (err) {
        console.error(err);
      }
    }
  });
}

function processLogin(messages) {
  setView("chat");
  var nickName = chat.session.settings.nickname;
  $('#user-name').val(nickName);
  $('#topic-name').val(chat.session.settings.topicName);
  if (chat.session.metadata.topicName) document.title = chat.session.metadata.topicName;
  updateParticipants();
  setNavbarListeners();
  syncPendingInvites();
  onLoginFillParticipants();
  onLoginLoadMessages(messages);
}

function processMessagesLoaded(messages) {
  while (messages.length > 0) {
    var message = messages.shift();

    try {
      message = typeof message === "string" ? JSON.parse(message) : message;
    } catch (err) {
      console.log("Could not parse json. Message: " + messages[messages.length - i - 1]);
      continue;
    }

    var authorPkfp = message.header.author;
    var alias = isMyMessage(authorPkfp) ? chat.getMemberNickname(authorPkfp) : chat.getMemberRepr(authorPkfp);
    appendMessageToChat({
      nickname: message.header.nickname,
      alias: alias,
      body: message.body,
      timestamp: message.header.timestamp,
      pkfp: message.header.author,
      service: message.header.service,
      private: message.header.private,
      recipient: message.header.recipient,
      messageID: message.header.id,
      attachments: message.attachments
    }, true);
  }
}

function processLogout() {
  console.log("Processing logout");
  document.querySelector('#chat_window').innerHTML = "";
  chat.logout();
  setView("auth");
  toastr["info"]("You have successfully logged out!");
}

function setNavbarListeners() {
  $('#chat-view-button').click(function () {
    setView("chat");
  });
  $('#settings-view-button').click(function () {
    setView("settings");
  });
  $('#logout-button').click(function () {
    processLogout();
  });
}

function onLoginLoadMessages(messages) {
  document.querySelector("#chat_window").innerHTML = "";

  for (var _i2 = 0; _i2 < messages.length; ++_i2) {
    var message = void 0;

    try {
      message = typeof messages[messages.length - _i2 - 1] === "string" ? JSON.parse(messages[messages.length - _i2 - 1]) : messages[messages.length - _i2 - 1];
    } catch (err) {
      console.log("Could not parse json. Message: " + messages[messages.length - _i2 - 1]);
      continue;
    }

    var pkfp = message.header.author;
    var alias = isMyMessage(pkfp) ? chat.getMemberNickname(pkfp) : chat.getMemberRepr(pkfp);
    appendMessageToChat({
      nickname: message.header.nickname,
      alias: alias,
      body: message.body,
      timestamp: message.header.timestamp,
      pkfp: message.header.author,
      messageID: message.header.id,
      service: message.header.service,
      private: message.header.private,
      recipient: message.header.recipient,
      attachments: message.attachments
    });
  }
}

function onLoginFillParticipants() {}
/**
 * Appends message onto the chat window
 * @param message: {
 *  nickname: nickname
 *  body: body
 *  pkfp: pkfp
 * }
 */


function appendMessageToChat(message) {
  var toHead = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var chatWindow = document.querySelector('#chat_window');
  var msg = document.createElement('div');
  var message_id = document.createElement('div');
  var message_body = document.createElement('div');
  message_body.classList.add('msg-body');
  var message_heading = buildMessageHeading(message);

  if (isMyMessage(message.pkfp)) {
    // My message
    msg.classList.add('my_message');
  } else if (message.service) {
    msg.classList.add('service-record');
  } else {
    //Not my Message
    msg.classList.add('message');
    var author = document.createElement('div');
    author.classList.add("m-author-id");
    author.innerHTML = message.pkfp;
    message_heading.appendChild(author);
  }

  if (message.private) {
    var privateMark = preparePrivateMark(message);
    message_heading.appendChild(privateMark);
    msg.classList.add('private-message');
  }

  message_id.classList.add("message-id");
  message_id.innerHTML = message.messageID;
  message_heading.appendChild(message_id);
  message_body.appendChild(processMessageBody(message.body)); //msg.innerHTML = '<b>'+message.author +'</b><br>' + message.message;
  //processing attachments

  var attachments = processAttachments(message.attachments);
  msg.appendChild(message_heading);
  msg.appendChild(message_body);

  if (attachments !== undefined) {
    msg.appendChild(attachments);
  }

  if (toHead) {
    chatWindow.insertBefore(msg, chatWindow.firstChild);
  } else {
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

function buildMessageHeading(message) {
  var message_heading = document.createElement('div');
  message_heading.classList.add('msg-heading');
  var alias, aliasNicknameDevisor;

  if (message.alias) {
    alias = document.createElement("b");
    alias.classList.add("m-alias");
    alias.innerText = message.alias;
    aliasNicknameDevisor = document.createElement("span");
    aliasNicknameDevisor.innerText = "  --  ";
  }

  var nickname = document.createElement("b");
  nickname.innerText = message.nickname;
  nickname.classList.add("m-nickname");
  var time_stamp = document.createElement('span');
  time_stamp.innerHTML = getChatFormatedDate(message.timestamp);
  time_stamp.classList.add('msg-time-stamp');

  if (isMyMessage(message.pkfp)) {
    message_heading.appendChild(time_stamp);
    message_heading.appendChild(nickname);
  } else if (message.service) {
    message_heading.innerHTML += '<b>Service  </b>';
    message_heading.appendChild(time_stamp);
  } else {
    //Not my Message
    if (message.alias) {
      message_heading.appendChild(alias);
      message_heading.appendChild(aliasNicknameDevisor);
    }

    message_heading.appendChild(nickname);
    message_heading.appendChild(time_stamp);
  }

  if (message.recipient && message.recipient !== "ALL") {
    var recipientId = document.createElement("div");
    recipientId.innerHTML = message.recipient;
    recipientId.classList.add("m-recipient-id");
    message_heading.appendChild(recipientId);
  }

  return message_heading;
}

function preparePrivateMark(message) {
  var privateMark = document.createElement("span");
  privateMark.classList.add("private-mark");

  if (isMyMessage(message.pkfp)) {
    privateMark.innerText = "(private to: ";
    var recipientName = chat.getMemberRepr(message.recipient);
    privateMark.innerText += recipientName + ")";
  } else {
    privateMark.innerText = "(private)";
  }

  return privateMark;
}
/**
 * Click handler when user clicks on attached file
 * @param ev
 * @returns {Promise<void>}
 */


function downloadOnClick(_x4) {
  return _downloadOnClick.apply(this, arguments);
}
/**
 * Processes all the attachments and returns
 * attachments wrapper which can be appended to a message
 * If no attachments are passed - returns undefined
 * @param attachments
 * @returns {*}
 */


function _downloadOnClick() {
  _downloadOnClick = asyncToGenerator_default()(
  /*#__PURE__*/
  regenerator_default.a.mark(function _callee6(ev) {
    var target, fileInfo, file;
    return regenerator_default.a.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            console.log("Download event triggered!");
            target = ev.target;

            while (target && !target.classList.contains("att-view")) {
              target = target.parentNode;
            }

            if (target) {
              _context6.next = 5;
              break;
            }

            throw "att-view container not found...";

          case 5:
            fileInfo = target.nextSibling.innerHTML; //Extract fileInfo from message

            console.log("obtained fileinfo: " + fileInfo);
            _context6.next = 9;
            return chat.downloadAttachment(fileInfo);

          case 9:
            file = _context6.sent;

          case 10:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));
  return _downloadOnClick.apply(this, arguments);
}

function processAttachments(attachments) {
  if (attachments === undefined) {
    return undefined;
  }

  var getAttachmentSize = function getAttachmentSize(size) {
    var res = "";
    size = parseInt(size);

    if (size < 1000) {
      res = size.toString() + "b";
    } else if (size < 1000000) {
      res = Number((size / 1000).toFixed(1)).toString() + "kb";
    } else if (size < 1000000000) {
      res = Number((size / 1000000).toFixed(1)).toString() + "mb";
    } else {
      res = Number((size / 1000000000).toFixed(1)).toString() + "gb";
    }

    return res;
  };

  var attachmentsWrapper = document.createElement("div");
  attachmentsWrapper.classList.add("msg-attachments");
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = attachments[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var att = _step2.value;
      var attachment = document.createElement("div");
      var attView = document.createElement("div");
      var attInfo = document.createElement("div");
      var attSize = document.createElement("span");
      var attName = document.createElement("span");
      var attIcon = document.createElement("span");
      var iconImage = document.createElement("img"); // //State icons

      var attState = document.createElement("div");
      attState.classList.add("att-state");
      var spinner = document.createElement("img");
      spinner.classList.add("spinner");
      spinner.src = "/img/spinner.gif";
      spinner.display = "none";
      attState.appendChild(spinner);
      iconImage.src = "/img/attachment.png";
      attSize.classList.add("att-size");
      attView.classList.add("att-view");
      attInfo.classList.add("att-info");
      attName.classList.add("att-name");
      iconImage.classList.add("att-icon");
      attIcon.appendChild(iconImage);
      attInfo.innerHTML = JSON.stringify(att);
      attName.innerText = att.name;
      attSize.innerHTML = getAttachmentSize(att.size); //Appending elements to attachment view

      attView.appendChild(attState);
      attView.appendChild(attIcon);
      attView.appendChild(attName);
      attView.appendChild(attSize);
      attView.addEventListener("click", downloadOnClick);
      attachment.appendChild(attView);
      attachment.appendChild(attInfo);
      attachmentsWrapper.appendChild(attachment);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return attachmentsWrapper;
}

function processMessageBody(text) {
  text = text.trim();
  var result = document.createElement("div");
  var startPattern = /__code/;
  var endPattern = /__end/; //no code

  if (text.search(startPattern) === -1) {
    result.appendChild(document.createTextNode(text));
    return result;
  } //first occurrence of the code


  var firstOccurrence = text.search(startPattern);

  if (text.substring(0, firstOccurrence).length > 0) {
    result.appendChild(document.createTextNode(text.substring(0, firstOccurrence)));
    text = text.substr(firstOccurrence);
  }

  var substrings = text.split(startPattern).filter(function (el) {
    return el.length !== 0;
  });

  for (var _i3 = 0; _i3 < substrings.length; ++_i3) {
    var pre = document.createElement("pre");
    var code = document.createElement("code");
    var afterText = null;

    var endCode = substrings[_i3].search(endPattern);

    if (endCode === -1) {
      code.innerText = processCodeBlock(substrings[_i3]);
    } else {
      code.innerText = processCodeBlock(substrings[_i3].substring(0, endCode));

      var rawAfterText = substrings[_i3].substr(endCode + 5).trim();

      if (rawAfterText.length > 0) afterText = document.createTextNode(rawAfterText);
    } //highliter:


    hljs.highlightBlock(code); ///////////

    pre.appendChild(code);
    result.appendChild(pre);
    pre.ondblclick = showCodeView;
    if (afterText) result.appendChild(afterText);
  }

  return result;
}

function showCodeView(event) {
  var pre = document.createElement("pre");
  pre.innerHTML = event.target.innerHTML;
  var div = document.createElement("div");
  div.appendChild(pre);
  showModalNotification("Code:", div.innerHTML);
}

function closeCodeView() {
  clearModal();
  document.querySelector("#code-view").style.display = "none";
}

function processCodeBlock(code) {
  code = code.trim();
  var separator = code.match(/\r?\n/) ? code.match(/\r?\n/)[0] : "\r\n";
  var lines = code.split(/\r?\n/);
  var min = Infinity;

  for (var _i4 = 1; _i4 < lines.length; ++_i4) {
    if (lines[_i4] === "") continue;

    try {
      min = Math.min(lines[_i4].match(/^\s+/)[0].length, min);
    } catch (err) {
      //found a line with no spaces, therefore returning the entire block as is
      return lines.join(separator);
    }
  }

  for (var _i5 = 1; _i5 < lines.length; ++_i5) {
    lines[_i5] = lines[_i5].substr(min);
  }

  return lines.join(separator);
}

function generateInvite(ev) {
  ensureConnected();
  console.log("Generating invite");
  buttonLoadingOn(ev.target);
  chat.requestInvite();
}

function addNewParticipant() {
  var nickname = document.querySelector('#new-participant-nickname').value;
  var pubKey = document.querySelector('#new-participant-public-key').value;
  var residence = document.querySelector('#new-participant-residence').value;
  var rights = document.querySelector('#new-participant-rights').value;
  chat.addNewParticipant(nickname, pubKey, residence, rights);
}

function broadcastNewMessage() {
  var newMessage = document.querySelector('#new-message').value;
  chat.shoutMessage(newMessage);
}

function displayNewTopicData(data, heading, toastrMessage) {
  heading = heading ? heading : "Your new topic data. SAVE YOUR PRIVATE KEY!!!";
  toastrMessage = toastrMessage ? toastrMessage : "Topic was created successfully!";
  var nicknameWrapper = document.createElement("div");
  var pkWrapper = document.createElement("div");
  var bodyWrapper = document.createElement("div");
  nicknameWrapper.innerHTML = "<b>Nickname: </b>" + data.nickname;
  pkWrapper.innerHTML = "<br><b>Your private key:</b> <br> <textarea class='key-display'>" + data.privateKey + "</textarea>";
  bodyWrapper.appendChild(nicknameWrapper);
  bodyWrapper.appendChild(pkWrapper);
  var tempWrap = document.createElement("div");
  tempWrap.appendChild(bodyWrapper);
  showModalNotification(heading, tempWrap.innerHTML);
  toastr.success(toastrMessage);
}

function showInviteCode(newInvite) {
  syncPendingInvites();
  showModalNotification("Here is your invite code:", newInvite);
  toastr.success("New invite was generated successfully!");
}

function showModalNotification(headingText, bodyContent) {
  var wrapper = document.createElement("div");
  wrapper.classList.add("modal-notification--wrapper");
  var heading = document.createElement("h3");
  heading.classList.add("modal-notification--heading");
  var body = document.createElement("div");
  body.classList.add("modal-notification--body");
  heading.innerText = headingText;
  body.innerHTML = bodyContent;
  wrapper.appendChild(heading);
  wrapper.appendChild(body);
  var modalContent = document.querySelector('#code--content');
  modalContent.innerHTML = "";
  modalContent.appendChild(wrapper);
  var modalView = document.querySelector('#code-view');
  modalView.style.display = "block";
}

function loadingOn() {
  $('body').waitMe({
    effect: 'roundBounce',
    bg: 'rgba(255,255,255,0.7)',
    textPos: 'vertical',
    color: '#33b400'
  });
}

function loadingOff() {
  $('body').waitMe('hide');
}

function setView(view) {
  switch (view) {
    case "chat":
      $('#chat_room').css('display', 'flex');
      $('#you_online').css('display', 'flex');
      $('#auth-wrapper').hide();
      $('#chat-menu').css('display', 'flex');
      $('#settings-view').hide();
      $('#chat-view-button').addClass("active");
      $('#settings-view-button ').removeClass("active");
      break;

    case "auth":
      $('#chat_room').hide();
      $('#you_online').hide();
      $('#auth-wrapper').css('display', 'block');
      $('#chat-menu').hide();
      $('#settings-view').hide();
      break;

    case "settings":
      $('#settings-view').css('display', 'flex');
      $('#chat_room').hide();
      $('#you_online').hide();
      $('#auth-wrapper').hide();
      $('#chat-menu').css('display', 'flex');
      $('#chat-view-button').removeClass("active");
      $('#settings-view-button').addClass("active");
      break;

    default:
      throw "setView: Invalid view: " + view;
  }
}

function syncPendingInvites() {
  if (!chat.session) {
    return;
  } else if (chat.session.settings.invites === undefined) {
    chat.settingsInitInvites();
    return;
  }

  var invites = Object.keys(chat.session.settings.invites);
  var container = document.querySelector('#pending-invites');
  container.innerHTML = "";

  for (var _i6 in invites) {
    var inviteWrap = document.createElement("div");
    var inviteNum = document.createElement("div");
    var inviteRep = document.createElement("input");
    var inviteCopy = document.createElement("div");
    var inviteDel = document.createElement("div");
    var inviteID = document.createElement("div");
    var inviteCopyButton = document.createElement("button");
    var inviteDelButton = document.createElement("button");
    inviteWrap.classList.add("invite-wrap");
    inviteRep.classList.add("invite-rep");
    inviteID.classList.add("invite-id");
    inviteDel.classList.add("invite-del");
    inviteNum.classList.add("invite-num");
    inviteDelButton.classList.add("invite-del-button");
    inviteCopyButton.classList.add("invite-copy-button");
    inviteCopy.classList.add("invite-copy");
    inviteDelButton.innerText = 'Del';
    inviteCopyButton.innerText = 'Copy invite code';
    inviteDelButton.onclick = deleteInvite;
    inviteID.innerText = invites[_i6];
    inviteRep.value = chat.session.settings.invites[invites[_i6]].name ? chat.session.settings.invites[invites[_i6]].name : "New member";
    inviteNum.innerText = "#" + (parseInt(_i6) + 1);
    inviteDel.appendChild(inviteDelButton);
    inviteCopy.appendChild(inviteCopyButton);
    inviteWrap.appendChild(inviteNum);
    inviteWrap.appendChild(inviteRep);
    inviteWrap.appendChild(inviteCopy);
    inviteWrap.appendChild(inviteDel);
    inviteWrap.appendChild(inviteID);
    inviteCopyButton.addEventListener("click", copyInviteCode);
    inviteRep.addEventListener("click", editInviteeName);
    container.appendChild(inviteWrap);
  }
}

function editInviteeName(event) {
  tempName = event.target.value;
  event.target.value = "";
  event.target.addEventListener("focusout", processInviteeNameInput);
  event.target.addEventListener("keyup", inviteEditingProcessKeyPress);
}

function inviteEditingProcessKeyPress(event) {
  if (event.keyCode === 13) {
    console.log("Enter pressed!");
    event.target.blur();
  }
}

function processInviteeNameInput(event) {
  var newName = event.target.value.trim();

  if (newName === "") {
    event.target.value = tempName;
    return;
  } else {
    chat.updateSetInviteeName(event.target.parentNode.lastChild.innerHTML, newName);
  }

  event.target.removeEventListener("focusout", processInviteeNameInput);
}

function copyInviteCode(event) {
  var inviteElement = event.target.parentNode.parentNode.lastChild;
  var inviteID = inviteElement.innerHTML;
  var textArea = document.createElement("textarea");
  textArea.value = inviteID;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    toastr.info("Invite code was copied to the clipboard");
  } catch (err) {
    toastr.error("Error copying invite code to the clipboard");
  }

  textArea.remove();
}

function deleteInvite(event) {
  ensureConnected();
  var button = event.target;
  var inviteID = button.parentNode.parentNode.lastChild.innerHTML;
  chat.deleteInvite(inviteID);
}

function processTopicJoinSuccess(data) {
  clearInviteInputs();
  loadingOff();
  var heading = "You have joined topic successfully, and can now login. SAVE YOUR PRIVATE KEY!!!";
  var toastrMessage = "Topic was created successfully!";
  displayNewTopicData(data, heading, toastrMessage);
}

function enableSettingsMenuListeners() {
  var menuItems = document.querySelector("#settings-menu").children;
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = menuItems[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _i7 = _step3.value;

      _i7.addEventListener("click", processSettingsMenuClick);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  document.querySelector("#invites-container").style.display = "flex";
  document.querySelector("#chat-settings").style.display = "none";
  document.querySelector("#participants-container").style.display = "none";
  document.querySelector("#admin-tools-container").style.display = "none";
}

function processSettingsMenuClick(event) {
  var menuItems = document.querySelector("#settings-menu").children;
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = menuItems[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _i8 = _step4.value;

      _i8.classList.remove("active");
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var target = event.target;
  target.classList.add("active");
  document.querySelector("#invites-container").style.display = target.innerText === "INVITES" ? "flex" : "none";
  document.querySelector("#participants-container").style.display = target.innerText === "PARTICIPANTS" ? "flex" : "none";
  document.querySelector("#chat-settings").style.display = target.innerText === "CHAT SETTINGS" ? "flex" : "none";
  document.querySelector("#admin-tools-container").style.display = target.innerText === "ADMIN TOOLS" ? "flex" : "none";
}

function processChatScroll(event) {
  var chatWindow = event.target;
  if (!chatWindow.firstChild) return;

  if ($(event.target).scrollTop() <= 1) {
    //load more messages
    var lastLoadedMessageID = chatWindow.firstChild.querySelector(".message-id").innerText;
    chat.loadMoreMessages(lastLoadedMessageID);
  }
}

function clearModal() {
  $("#code--content").html("");
}

function clearInviteInputs() {
  $("#invite-code").val("");
  $("#join-nickname").val("");
}

function clearNewTopicFields() {
  $("#new-topic-nickname").val("");
  $("#new-topic-name").val("");
}

function clearLoginPrivateKey() {
  $("#private-key").val("");
}

function clearAllInputs() {
  clearModal();
  clearInviteInputs();
  clearNewTopicFields();
  clearLoginPrivateKey();
}

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} ///Testing blob download


function downloadAttachment(fileName, data) {
  var arr = new Uint8Array(data);
  var fileURL = URL.createObjectURL(new Blob([arr]));
  downloadURI(fileURL, fileName);
}
/**
 * Searches loaded message with provided ID
 * @param id
 */


function findMessage(id) {
  var chatWindow = document.querySelector("#chat_window");
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = chatWindow.children[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var msg = _step5.value;

      if (msg.getElementsByClassName("message-id")[0].innerHTML == id) {
        console.log("Message found");
        return msg;
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }
}

function loadAudio(_x5, _x6) {
  return _loadAudio.apply(this, arguments);
}

function _loadAudio() {
  _loadAudio = asyncToGenerator_default()(
  /*#__PURE__*/
  regenerator_default.a.mark(function _callee7(fileInfo, fileData) {
    var message, audio, arr, fileURL, viewWrap;
    return regenerator_default.a.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            //search right message
            message = findMessage(fileInfo.messageID);

            if (message) {
              _context7.next = 4;
              break;
            }

            console.error("Message not found");
            return _context7.abrupt("return");

          case 4:
            audio = document.createElement("audio");
            arr = new Uint8Array(fileData);
            fileURL = URL.createObjectURL(new Blob([arr]));
            audio.setAttribute("controls", "");
            audio.setAttribute("src", fileURL);
            viewWrap = message.getElementsByClassName("att-view")[0];
            viewWrap.innerHTML = "";
            viewWrap.appendChild(audio);
            console.log("Removing even listener");
            viewWrap.removeEventListener("click", downloadOnClick);

          case 14:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));
  return _loadAudio.apply(this, arguments);
}

function processAttachmentChosen(ev) {
  var attachemtsWrapper = document.querySelector("#chosen-files");
  var fileData = ev.target.files[0];
  attachemtsWrapper.innerHTML = "";

  if (!fileData) {
    return;
  }

  var attWrapper = document.createElement("div");
  attWrapper.classList.add("chosen-file-wrap");
  var chosenFileTxt = document.createElement("div");
  chosenFileTxt.classList.add("chosen-file");
  chosenFileTxt.innerText = fileData.name;
  var closeImg = document.createElement("img");
  closeImg.setAttribute("src", "/img/close.png");
  closeImg.addEventListener("click", clearAttachments);
  attWrapper.appendChild(closeImg);
  attWrapper.appendChild(chosenFileTxt);
  attachemtsWrapper.appendChild(attWrapper);
}

function clearAttachments() {
  var attachemtsInput = document.querySelector("#attach-file");
  attachemtsInput.value = "";
  var attachemtsWrapper = document.querySelector("#chosen-files");
  attachemtsWrapper.innerHTML = "";
}

function editMyNickname(ev) {
  var newNickname = ev.target.value.trim();

  if (!newNickname || newNickname === chat.session.settings.nickname) {
    ev.target.value = chat.session.settings.nickname;
    ev.target.blur();
    return;
  }

  ev.target.value = newNickname;
  chat.myNicknameUpdate(ev.target.value);
  ev.target.blur();
}

function editTopicName(ev) {
  var newTopicName = ev.target.value.trim();

  if (!newTopicName || newTopicName === chat.session.settings.topicName) {
    ev.target.value = chat.session.settings.topicName;
    ev.target.blur();
    return;
  }

  ev.target.value = newTopicName;
  chat.topicNameUpdate(ev.target.value);
  ev.target.blur();
}

function buttonLoadingOn(element) {
  element.classList.add("running");
  element.classList.add("disabled");
}

function buttonLoadingOff(element) {
  element.classList.remove("running");
  element.classList.remove("disabled");
}

function refreshInvites(ev) {
  ensureConnected();
  console.log("Generating invite");
  buttonLoadingOn(ev.target);
  chat.syncInvites();
}

function refreshInvitesSuccess() {
  buttonLoadingOff(document.querySelector("#refresh-invites"));
  toastr.success("Invites re-synced");
}

function switchConnectionStatus(connected) {
  var positive = document.querySelector("#connection-status--connected");
  var negative = document.querySelector("#connection-status--disconnected");

  if (connected) {
    $(positive).show();
    $(negative).hide();
  } else {
    $(positive).hide();
    $(negative).show();
  }
}

function attemptReconnection() {
  chat.attemptReconnection().then(function () {}).catch(function (err) {
    console.trace(err);
  });
}

function switchSounds(ev) {
  if (chat.session.settings.soundsOn) {
    chat.session.settings.soundsOn = false;
    ev.target.src = soundsOnOfIcons.off;
  } else {
    chat.session.settings.soundsOn = true;
    ev.target.src = soundsOnOfIcons.on;
  }
}

function participantAliasChange(ev) {
  console.log("Processing participant alias change");
  ensureConnected();
  var id = ev.target.parentNode.firstChild.innerText;
  var newAlias = ev.target.value.trim();

  if (!newAlias) {
    chat.deleteMemberAlias(id);
  } else {
    chat.setMemberAlias(id, ev.target.value);
  }

  chat.saveClientSettings();
}

function ensureConnected() {
  if (!chat.islandConnectionStatus) {
    toastr.warning("You are disconnected from the island. Please reconnect to continue");
    throw "No island connection";
  }
}

function lockSend(val) {
  sendLock = !!val;
  var sendButton = document.querySelector('#send-new-msg');
  var newMsgField = document.querySelector('#new-msg');
  sendLock ? buttonLoadingOn(sendButton) : buttonLoadingOff(sendButton);
  sendLock ? newMsgField.setAttribute("disabled", true) : newMsgField.removeAttribute("disabled");
}

function processMainMenuSwitch(ev) {
  var menuLength = mainMenuItems.length;
  var activeIndex = mainMenuItems.filter(function (item) {
    return item.active;
  })[0].index;
  var newActive = (ev.currentTarget.classList.contains("right-arrow-wrap") ? activeIndex + 1 : activeIndex - 1) % menuLength;

  if (newActive < 0) {
    newActive = menuLength + newActive;
  }

  mainMenuItems[activeIndex].active = false;
  mainMenuItems[newActive].active = true;
  $(mainMenuItems[activeIndex].selector).hide("fast");
  $(mainMenuItems[newActive].selector).show("fast");
  var nextIndex = (newActive + 1) % menuLength;
  var previousIndex = (newActive - 1) % menuLength;

  if (previousIndex < 0) {
    previousIndex = menuLength + previousIndex;
  }

  document.querySelector("#left-arrow-text").innerHTML = mainMenuItems[previousIndex].subtitle;
  document.querySelector("#right-arrow-text").innerHTML = mainMenuItems[nextIndex].subtitle; // active = get active
  // if arrow right:
  //activate next
  // else
  //activate previous
  //set subtitles
}

/***/ })
/******/ ]);