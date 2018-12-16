"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// MIT License
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


var CuteSet = function () {
    function CuteSet(input) {
        _classCallCheck(this, CuteSet);

        if (typeof input === "string" || typeof input === "number") {
            input = [input];
        }

        this._set = new Set(input);

        this[Symbol.iterator] = /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, i;

            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context.prev = 3;
                            _iterator = this._set[Symbol.iterator]();

                        case 5:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                _context.next = 12;
                                break;
                            }

                            i = _step.value;
                            _context.next = 9;
                            return i;

                        case 9:
                            _iteratorNormalCompletion = true;
                            _context.next = 5;
                            break;

                        case 12:
                            _context.next = 18;
                            break;

                        case 14:
                            _context.prev = 14;
                            _context.t0 = _context["catch"](3);
                            _didIteratorError = true;
                            _iteratorError = _context.t0;

                        case 18:
                            _context.prev = 18;
                            _context.prev = 19;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 21:
                            _context.prev = 21;

                            if (!_didIteratorError) {
                                _context.next = 24;
                                break;
                            }

                            throw _iteratorError;

                        case 24:
                            return _context.finish(21);

                        case 25:
                            return _context.finish(18);

                        case 26:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, this, [[3, 14, 18, 26], [19,, 21, 25]]);
        });
    }

    _createClass(CuteSet, [{
        key: "forEach",
        value: function forEach(cb) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._set[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var i = _step2.value;

                    cb(i, i, this);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }, {
        key: "union",
        value: function union(set) {
            set = CuteSet._formatInput(set);
            return new CuteSet([].concat(_toConsumableArray(this.toArray()), _toConsumableArray(set.toArray())));
        }
    }, {
        key: "join",
        value: function join(set) {
            return this.union(set);
        }
    }, {
        key: "difference",
        value: function difference(set) {
            set = CuteSet._formatInput(set);
            return new CuteSet(this.toArray().filter(function (x) {
                return !set.has(x);
            }));
        }
    }, {
        key: "complement",
        value: function complement(set) {
            set = CuteSet._formatInput(set);
            return set.minus(this);
        }
    }, {
        key: "minus",
        value: function minus(set) {
            return this.difference(set);
        }
    }, {
        key: "symmetricDifference",
        value: function symmetricDifference(set) {
            set = CuteSet._formatInput(set);
            return this.union(set).difference(this.intersection(set));
        }
    }, {
        key: "intersection",
        value: function intersection(set) {
            set = CuteSet._formatInput(set);
            return new CuteSet(this.toArray().filter(function (x) {
                return set.has(x);
            }));
        }
    }, {
        key: "equal",
        value: function equal(set) {
            set = CuteSet._formatInput(set);
            return this.symmetricDifference(set).length() === 0;
        }
    }, {
        key: "subsetOf",
        value: function subsetOf(set) {
            set = CuteSet._formatInput(set);
            return this.intersection(set).equal(this);
        }
    }, {
        key: "sort",
        value: function sort(fn) {
            this._set = new Set(this.toArray().sort(fn));
        }
    }, {
        key: "powerSet",
        value: function powerSet() {
            var _this = this;

            var set = this.toArray();
            if (set.length > 21) {
                throw "Maximum supported length for generating powerset is exceeded.";
            }
            var numCombinations = parseInt(this._getStringOfSymbols(set.length, "1").split('').reverse().join(''), 2) + 1;
            var res = [];

            var _loop = function _loop(i) {
                var num = i.toString(2);
                num = _this._padWithZeroes(num, set.length);
                res.push(new CuteSet(set.filter(function (val, i) {
                    return num[i] == 1;
                })));
            };

            for (var i = 0; i < numCombinations; ++i) {
                _loop(i);
            }
            return new CuteSet(res);
        }
    }, {
        key: "permutations",
        value: function permutations() {
            if (this.size() > 9) {
                throw "Maximum supported length for generating permutations is exceeded.";
            }
            var set = this.toArray();
            var n = set.length;
            var res = new CuteSet();
            var c = Array.apply(null, { length: n }).map(Function.call, function () {
                return 0;
            });
            var i = 0;
            res.add(new CuteSet(set));
            var swap = function swap(i, j, arr) {
                var t = arr[i];
                arr[i] = arr[j];
                arr[j] = t;
            };
            while (i < n) {
                if (c[i] < i) {
                    i % 2 === 0 ? swap(0, i, set) : swap(c[i], i, set);
                    res.add(new CuteSet(set));
                    c[i] += 1;
                    i = 0;
                } else {
                    c[i] = 0;
                    i += 1;
                }
            }
            return res;
        }
    }, {
        key: "has",
        value: function has(x) {
            return this._set.has(x);
        }
    }, {
        key: "length",
        value: function length() {
            return this._set.size;
        }
    }, {
        key: "size",
        value: function size() {
            return this.length();
        }
    }, {
        key: "empty",
        value: function empty() {
            return this._set.size === 0;
        }
    }, {
        key: "add",
        value: function add(x) {
            this._set.add(x);
        }
    }, {
        key: "remove",
        value: function remove(x) {
            return this._set.delete(x);
        }
    }, {
        key: "delete",
        value: function _delete(x) {
            return this.remove(x);
        }
    }, {
        key: "toArray",
        value: function toArray() {
            return Array.from(this._set);
        }
    }, {
        key: "toString",
        value: function toString() {
            var delimiter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : " ";

            return this.toArray().join(delimiter);
        }
    }, {
        key: "print",
        value: function print(delimiter) {
            console.log(this.toString(delimiter) + "\n");
        }
    }, {
        key: "_padWithZeroes",
        value: function _padWithZeroes(str, length) {
            if (str.length < length) {
                return this._getStringOfSymbols(length - str.length, "0") + str;
            }
            return str;
        }
    }, {
        key: "_getStringOfSymbols",
        value: function _getStringOfSymbols(length, char) {
            return char.repeat(length);
        }
    }], [{
        key: "_formatInput",
        value: function _formatInput(input) {
            if (!(input instanceof CuteSet)) {
                return new CuteSet(input);
            } else {
                return input;
            }
        }
    }, {
        key: "fromString",
        value: function fromString(input) {
            var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : " ";
            var parseNumbers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if (!input || input === " ") {
                return new CuteSet();
            } else if (typeof input !== "string") {
                throw "CuteSet error: input format is invalid, expecting string";
            }

            input = input.split(delimiter);

            if (parseNumbers) {
                input = input.map(function (val) {
                    return parseFloat(val);
                });
            }
            return new CuteSet(input);
        }
    }]);

    return CuteSet;
}();

if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && module.hasOwnProperty('exports')) {
    module.exports = CuteSet;
}