;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!util.isNumber(n) || n < 0)
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (util.isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (util.isUndefined(handler))
    return false;

  if (util.isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (util.isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              util.isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (util.isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (util.isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!util.isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  function g() {
    this.removeListener(type, g);
    listener.apply(this, arguments);
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (util.isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (util.isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (util.isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (util.isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (util.isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};
},{"util":3}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":1}],4:[function(require,module,exports){
//var inherits = require('inherits');

module.exports = AssetLoader;
//inherits(Location, Entity);

function AssetLoader(options) {
  var self = this;
}

AssetLoader.prototype.load = function(data) {
  var spriteSheet = new createjs.SpriteSheet(data);
  return spriteSheet;
};

AssetLoader.prototype.drawSprite = function(c, sprite, x, y, frame) {
  sprite._normalizeFrame();
  if (!frame) {
    frame = 0;
  }
  var o = sprite.spriteSheet.getFrame(sprite._currentFrame | frame);
  if (!o) { return false; }
  var rect = o.rect;
  c.drawImage(o.image, rect.x, rect.y, rect.width, rect.height,
              x, y, rect.width, rect.height);
};
},{}],5:[function(require,module,exports){
/*
*
* Camera
*
* options: {
*   map: map,
*   follow: player,
*   followPoint: { x: game.width / 2, y: game.height / 2 },
*   cameraStartPosition: { x: 0, y: 0 },
*   viewport: { width: 25, height: 25 }
* }
*
*/

module.exports = Camera;

function Camera(options){
  var self = this;

  this.map = options.map;
  this.game = options.game;
  this.following = options.follow;
  this.following.camera = this;

  this.followPoint = {
    x: options.followPoint.x || null,
    y: options.followPoint.y || null
  };

  this.position = options.cameraStartPosition || { x: 0, y: 0 };
  
  this.deadZone = options.deadZone || { x: options.viewport.width / 2, y: options.viewport.height / 2 };
  
  this.viewport = options.viewport;
    
  this.viewportRect = new Rectangle(this.position.x, this.position.y, this.viewport.width, this.viewport.height);       
            
  this.worldRect = new Rectangle(this.position.x, this.position.y, this.map.width, this.map.height);

  this.game.on('update', function(){
    self.update();
  })
}

Camera.prototype.update = function(){
  var following = this.following;
  var followPoint = this.followPoint;

  if (following != null){   
    if (followPoint.x !== null){  
      
      if(following.position.x - this.position.x + this.deadZone.x > this.viewport.width){
        this.position.x = following.position.x - (this.viewport.width - this.deadZone.x);
      }

      else if(following.position.x - this.deadZone.x < this.position.x){
        this.position.x = following.position.x - this.deadZone.x;
      }
    }

    if (followPoint.y !== null){
      if(following.position.y - this.position.y + this.deadZone.y > this.viewport.height){
        this.position.y = following.position.y - (this.viewport.height - this.deadZone.y);
      }

      else if(following.position.y - this.deadZone.y < this.position.y) {
        this.position.y = following.position.y - this.deadZone.y;
      }
    }           
  }   

  this.viewportRect.set(this.position.x, this.position.y, this.viewport.width, this.viewport.height);

  if(!this.viewportRect.within(this.worldRect)){

    if(this.viewportRect.left < this.worldRect.left){
      this.position.x = this.worldRect.left;
    }

    if(this.viewportRect.top < this.worldRect.top){       
      this.position.y = this.worldRect.top;
    }

    if(this.viewportRect.right > this.worldRect.right){
      this.position.x = this.worldRect.right - this.viewport.width;
    }

    if(this.viewportRect.bottom > this.worldRect.bottom){
      this.position.y = this.worldRect.bottom - this.viewport.height;
    }

  }
  
} 

function Rectangle(left, top, width, height){
  this.left = left || 0;
  this.top = top || 0;
  this.right = left + width || 0;
  this.bottom = top + height || 0;
}

Rectangle.prototype.set = function(left, top, width, height){
  this.left = left;
  this.top = top;
  this.width = width || this.width;
  this.height = height || this.height
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;
}

Rectangle.prototype.within = function(rectangle) {
  return (
    rectangle.left <= this.left && 
    rectangle.right >= this.right &&
    rectangle.top <= this.top && 
    rectangle.bottom >= this.bottom
  );
}   

Rectangle.prototype.overlaps = function(rectangle) {
  return (
    this.left < rectangle.right && 
    this.right > rectangle.left && 
    this.top < rectangle.bottom &&
    this.bottom > rectangle.top
  );
}
},{}],6:[function(require,module,exports){
var tick = require('tic')();
var buzz = require('buzz');

/*
* crtrdg.js modules
*/

var Game = require('crtrdg-gameloop');
var Keyboard = require('crtrdg-keyboard');
var Mouse = require('crtrdg-mouse');
var SceneManager = require('crtrdg-scene');

/*
* custom modules
*/

var Map = require('./map');
var Camera = require('./camera');
var Player = require('./player');
var Item = require('./item');
var Inventory = require('./inventory');
var Wallet = require('./wallet');
var AssetLoader = require('./asset_loader');
var Menu = require('./menu');

/* util */
var randomInt = require('./util/math').randomInt;
var randomRGB = require('./util/math').randomRGB;
var randomRGBA = require('./util/math').randomRGBA;

var Meter = require('./meter');

/*
* create game object
*/

var game = new Game({
  canvas: 'game',
  width: window.innerWidth,
  height: window.innerHeight - 100,
  backgroundColor: randomRGBA(122, 256, 22, 256, 0, 256, 0.4)
});

game.on('pause', function(){
	console.log('paused');
});

game.on('resume', function(){
	console.log('resumed');
});

game.on('update', function(interval){
  tick.tick(interval);
  if (moneyMeter.level == 0 || healthMeter == 0 || energyMeter == 0){
    game.emit('lose');
  }
});

game.on('draw', function(c){

});

game.on('draw-background', function(context){
  context.fillStyle = 'rgb(100, 200, 150)';
  context.fillRect(0, 0, game.width, game.height);
  map.draw(context, camera);
  game.currentScene.emit('draw-background', context);
});

game.on('draw-foreground', function(context){
	game.currentScene.emit('draw-foreground', context);
});

game.on('lose', function(){
  var loseMenu = new Menu({
    game: game,
    window: document.getElementById("dialog"),
    message: "You lost. Play again?",
    close_timeout: 5,
    choices: {
      "yes": { "name": "yes", "value": "Yes" },
      "no": { "name": "no", "value": "No" }
    }
  });
  loseMenu.opened = true;
  loseMenu.open();
});

/*
* Sounds
*/

game.currentSong = null;
game.previousSong = null;
game.musicPaused = false;
var daySong = new buzz.sound('./sounds/day.mp3');
var nightSong = new buzz.sound('./sounds/night.mp3');

var pauseMusic = document.getElementById('pause-music');
var playMusic = document.getElementById('play-music');

pauseMusic.addEventListener('click', function(e){
  console.log('clicked pause')
  game.currentSong.pause();
  playMusic.style.display = 'initial';
  pauseMusic.style.display = 'none';
  game.musicPaused = true;
});

playMusic.addEventListener('click', function(e){
  console.log('clicked play')
  game.currentSong.play().loop();
  playMusic.style.display = 'none';
  pauseMusic.style.display = 'initial';
  game.musicPaused = false;
});

/*
* Counter stuff
*/

// Global list of counter listeners
intervalEvents = [];
minuteListeners = [];

/* every minute */

var minutes = 0;
tick.interval(function() {
  console.log("tick interval");
  if(minutes === 0) scene.set(day);
  if(minutes === 5) scene.set(night);

  player.everyMinute(minutes);

  if (minutes == 8) minutes = 0;
  else minutes++;

  console.log("test");
  minuteListeners.forEach(function(listener, index, array) {
    console.log("calling listener");
    listener.everyMinute(minutes);
  });
}, 60000);

/* every second */
var seconds = 0;
tick.interval(function() {
  player.everySecond(seconds);

  if (seconds == 60) seconds = 0;
  else seconds++;

  intervalEvents.forEach(function(listener, index, array) {
    listener.everySecond(seconds);
  });

}, 1000);


game.addIntervalEvent = function(listener) {
  intervalEvents.push(listener);
};

game.addMinuteListener = function(listener) {
  minuteListeners.push(listener);
};

game.addTimeout = function(listener, time) {
  tick.timeout(listener, time);
}

/*
* Keyboard
*/

var keyboard = new Keyboard(game);
var keysDown = keyboard.keysDown;


/*
* Mouse
*/

var mouse = new Mouse(game);

mouse.on('click', function(){
	if (game.paused) game.resume();
	else game.pause();
});


/*
* Player
*/

var player = new Player({
  game: game,
  keysDown: keysDown,
  camera: camera,
  position: { x: 830, y: 900 }
});

player.addTo(game);

player.everySecond = function() {
  if(game.currentScene.name == 'day'){

  }

  if(game.currentScene.name == 'night'){

  }
}

player.everyMinute = function(){
	if(game.currentScene.name == 'day'){

  }

  if(game.currentScene.name == 'night'){

  }
}

game.on('lock_movement', function() {
  player.can_move = false;
  console.log("movement locked");
});

game.on('unlock_movement', function() {
  player.can_move = true;
  console.log("movement unlocked");
});

game.on('selected:work:work', function() {
  console.log("selected:work:work");
  player.goToWork();
});


/*
*
* MAP & CAMERA
*
*/

var map = new Map(game, 5000, 5000);
map.generate();

var camera = new Camera({
  game: game,
  follow: player,
  followPoint: { x: game.width / 2, y: game.height / 2 },
  viewport: { width: game.width, height: game.height },
  map: map
});


/*
* Scenes
*/

var scene = new SceneManager(game);


/*
* Day
*/

var day = scene.create({
	name: 'day'
});

day.on('start', function(){
	console.log('day is starting');
  if (!game.musicPaused){
    game.currentSong = daySong;
    game.previousSong = nightSong;
    game.currentSong.play().loop();
    game.previousSong.stop();
  }
});

day.on('update', function(interval){

});

day.on('draw', function(context){

});

day.on('draw-background', function(c){

});

day.on('draw-foreground', function(c){
  c.fillStyle = 'rgba(255, 255, 255, 0.2)';
  c.fillRect(0, 0, game.width, game.height);
});

/* start with day scene */
scene.set(day);


/*
* Night
*/

var night = scene.create({
	name: 'night'
});

night.on('start', function(){
	console.log('night is starting')
  if (!game.musicPaused){
    game.currentSong = nightSong;
    game.previousSong = daySong;
    game.currentSong.play().loop();
    game.previousSong.stop();
  }
});

night.on('update', function(interval){

});

night.on('draw', function(c){

});

night.on('draw-background', function(c){

});

night.on('draw-foreground', function(c){
  c.fillStyle = 'rgba(0, 0, 0, 0.5)';
  c.fillRect(0, 0, game.width, game.height);
});

//addIntervalEvent(player.everySecond);

var healthMeter = new Meter({
  game: game,
  camera: camera,
  name: "health",
  color: "red",
  position: { x: 10, y: 10 }
});
healthMeter.addTo(game);

var energyMeter = new Meter({
  game: game,
  camera: camera,
  name: "energy",
  color: "blue",
  position: { x: 10, y: 30 }
});
energyMeter.addTo(game);

var moneyMeter = new Meter({
  game: game,
  camera: camera,
  name: "money",
  color: "green",
  rate: 2,
  position: { x: 10, y: 50 }
});
moneyMeter.addTo(game);


/*
*
* INVENTORY & ITEMS
*
*/

var inventory = new Inventory(game);

var shelterFood = new Item({
  name: 'Shelter Food',
  healthMeter: healthMeter,
  inventory: inventory,
  position: { x: 500, y: 140 },
  size: { x: 20, y: 20 },
  weight: 2,
  healing: 5
});

shelterFood.addTo(game);

shelterFood.on('update', function(){
	if (player.touches(shelterFood)){
		console.log('hmm, guess this will do for now');
		shelterFood.remove();
    inventory.add(shelterFood);
    energyMeter.add(10);
    healthMeter.add(5);
	}
});

shelterFood.on('draw', function(c){
	c.fillStyle = '#ff0000';
	c.fillRect(
		this.position.x - camera.position.x,
		this.position.y - camera.position.y,
		this.size.x,
		this.size.y
	);
});


var basicFood = new Item({
  name: 'Basic Food',
  healthMeter: healthMeter,
  inventory: inventory,
  position: { x: 450, y: 140 },
  size: { x: 20, y: 20 },
  weight: 3,
  healing: 10
});

basicFood.addTo(game);

basicFood.on('update', function(){
  if (player.touches(basicFood)){
    console.log('mmm mmmm good!');
    basicFood.remove();
    inventory.add(basicFood);
    energyMeter.add(15);
    healthMeter.add(10);
  }
});

basicFood.on('draw', function(c){
  c.fillStyle = '#0000ff';
  c.fillRect(
    this.position.x - camera.position.x,
    this.position.y - camera.position.y,
    this.size.x,
    this.size.y
  );
});


var goodFood = new Item({
  name: 'Good Food',
  healthMeter: healthMeter,
  inventory: inventory,
  position: { x: 550, y: 140 },
  size: { x: 20, y: 20 },
  weight: 3,
  healing: 20
});

goodFood.addTo(game);

goodFood.on('update', function(){
  if (player.touches(goodFood)){
    console.log('Yummy Yummy Yummy I got food in my tummy!');
    goodFood.remove();
    inventory.add(goodFood);
    goodFood.eat();
    energyMeter.add(20);
    healthMeter.add(15);
  }
});

goodFood.on('draw', function(c){
  c.fillStyle = '#3d4f2a';
  c.fillRect(
    this.position.x - camera.position.x,
    this.position.y - camera.position.y,
    this.size.x,
    this.size.y
  );
});

var workShirt = new Item({
  name: 'Work Clothes',
  inventory: inventory,
  position: { x: 500, y: 140 },
  size: { x: 20, y: 20 },
  weight: 2,
  healing: 0
});

/*
* Wallet
*/

var wallet = new Wallet(game, { meter: moneyMeter });
player.wallet = wallet;

moneyMeter.addListener(wallet);

map.load(game, camera, "locations.json");

map.locations.forEach(function(location, index, array) {
  console.log("location");
  location.on('update', function(c) {
    if (player.touches(location)) {
      player.addBlocker(location);
      if (location.menu) {
        if (!location.menu.opened) {
          if (location.open) {
            location.menu.opened = true;
            location.menu.open();
          } else {
            menus["closedMenu"].opened = true;
            console.log(menus["closedMenu"]);
            menus["closedMenu"].open();
          }
        }
      }
    } else {
      player.removeBlocker(location);
    }
  });
});



var menus = {
  closedMenu: new Menu({
    game: game,
    name: "closed_menu",
    window: document.getElementById("dialog"),
    message: "This location is closed right now.  Please come back later."
  }),
  shop: new Menu({
    game: game,
    name: "shop",
    window: document.getElementById("dialog"),
    message: "Welcome to the store, please have a look around and let me know what you would like to purchase",
    choices: {
      "choice1": { "name": "choice1", "value": "choice 1" },
      "choice2": { "name": "choice2", "value": "choice 2" }
    }
  }),
  shelter: new Menu({
    game: game,
    name: "shelter",
    window: document.getElementById("dialog"),
    message: "Welcome to the shelter.",
    choices: {
      "choice1": { "name": "choice1", "value": "choice 1" },
      "choice2": { "name": "choice2", "value": "choice 2" }
    }
  }),
  food_bank: new Menu({
    game: game,
    name: "food_bank",
    window: document.getElementById("dialog"),
    message: "Welcome to the Food bank",
    choices: {
      "choice1": { "name": "choice1", "value": "choice 1" },
      "choice2": { "name": "choice2", "value": "choice 2" }
    }
  }),
  office: new Menu({
    game: game,
    name: "work",
    window: document.getElementById("dialog"),
    message: "You have the option to work right now.",
    choices: {
      "work": { "name": "work",
                "value": "Work for an hour"
              },
      "leave": { "name": "leave", "value": "Leave" }
    }
  }),
  officeNeedClothes: new Menu({
    game: game,
    name: "work",
    window: document.getElementById("dialog"),
    message: "You need work clothes before you can get a job."
  }),
  jail: new Menu({
    game: game,
    name: "jail",
    window: document.getElementById("dialog"),
    message: "You have recently gotten out of jail and are now trying to put your life back together."
  })
};

map.locations.forEach(function(location, index, array) {
  location.menu = menus[location.id];
});

// Game initialization, send out starting minute
minuteListeners.forEach(function(listener, index, array) {
  listener.everyMinute(0);
});

},{"./asset_loader":4,"./camera":5,"./inventory":7,"./item":8,"./map":11,"./menu":12,"./meter":13,"./player":29,"./util/math":30,"./wallet":31,"buzz":14,"crtrdg-gameloop":19,"crtrdg-keyboard":22,"crtrdg-mouse":25,"crtrdg-scene":26,"tic":28}],7:[function(require,module,exports){
var inherits = require('inherits');

module.exports = Inventory;

function Inventory(game){
  this.game = game;
  this.game.inventory = {};

  this.defaultMaxWeight = 100;
  this.maxWeight = this.defaultMaxWeight;
  this.currentWeight = 0;

  this.createHTML();
}

Inventory.prototype.createHTML = function(){
  this.el = document.createElement('ul');
  this.el.id = 'inventory';

  var h3 = document.createElement('h3');
  h3.innerHTML = 'inventory';

  this.el.appendChild(h3);

  this.weightEl = document.createElement('span');
  this.weightEl.id = 'weight';
  this.weightEl.innerHTML = this.currentWeight + '/' + this.maxWeight;
  h3.appendChild(this.weightEl);

  document.body.appendChild(this.el);
};


Inventory.prototype.add = function(item){
  var self = this;
  var items = this.game.inventory;

  if (!items[item.id]){
    items[item.id] = {
      item: item,
      quantity: 1
    }

    this.addWeight(item.weight);

    var li = document.createElement('li');
    li.innerHTML = item.name;
    li.id = item.id;
    self.el.appendChild(li);

  } else {
    items[item.id].quantity += 1;
  }
};

Inventory.prototype.remove = function(item){
  var items = this.game.inventory;

  if (items[item.id]){
    if (items[item.id].quantity > 1){
        items[item.id].quantity -= 1;
    } else {
      delete items[item.id];
      var itemEl = document.getElementById(item.id);
      this.el.removeChild(itemEl);
    }
  }

  this.removeWeight(item.weight);
};

Inventory.prototype.list = function(){
  return this.game.inventory.join(', ');
};

Inventory.prototype.addWeight = function(weight){
  this.currentWeight += weight;
  this.weightEl.innerHTML = this.currentWeight + '/' + this.maxWeight;
}

Inventory.prototype.removeWeight = function(weight){
  this.currentWeight -= weight;
  this.weightEl.innerHTML = this.currentWeight + '/' + this.maxWeight;
}
},{"inherits":27}],8:[function(require,module,exports){
var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Item;
inherits(Item, Entity);

function Item(options){
  this.name = options.name;
  this.game = options.game;
  this.inventory = options.inventory;
  this.healthMeter = options.healthMeter || {};

  this.weight = options.weight;
  this.healing = options.healing;
  this.id = this.name.replace(/ /g,'_').toLowerCase();

  this.position = {
    x: options.position.x,
    y: options.position.y
  };

  this.size = {
    x: options.size.x,
    y: options.size.y
  };

  this.color = '#fff111';
}

Item.prototype.eat = function(){
  this.healthMeter.level += this.healing;
  if (this.healthMeter.level >= 100) this.healthMeter.level = 100;
  this.inventory.remove(this);
}
},{"crtrdg-entity":15,"inherits":27}],9:[function(require,module,exports){
module.exports=[
  {
    "hours": {
      "open": 3,
      "close": 18
    },
    "name": "Shop",
    "color": "red",
    "position": {
      "x": 100,
      "y": 100
    },
    "size": {
      "x": 81,
      "y": 100
    }
  },
  {
    "hours": {
      "open": 9,
      "close": 15
    },
    "name": "Shelter",
    "color": "blue",
    "position": {
      "x": 600,
      "y": 400
    },
    "size": {
      "x": 81,
      "y": 100
    }
  },
  {
    "hours": {
      "open": 3,
      "close": 9
    },
    "name": "Food Bank",
    "color": "green",
    "position": {
      "x": 100,
      "y": 300
    },
    "size": {
      "x": 81,
      "y": 100
    }
  },
  {
    "hours": {
      "open": 0,
      "close": 24
    },
    "name": "Office",
    "color": "black",
    "position": {
      "x": 500,
      "y": 200
    },
    "size": {
      "x": 81,
      "y": 100
    }
  },
  {
    "hours": {
      "open": 0,
      "close": 24
    },
    "name": "Jail",
    "color": "black",
    "position": {
      "x": 800,
      "y": 800
    },
    "size": {
      "x": 100,
      "y": 100
    }
  },
  {
    "hours": {
      "open": 3,
      "close": 18
    },
    "name": "Jail",
    "color": "black",
    "position": {
      "x": 800,
      "y": 800
    },
    "size": {
      "x": 100,
      "y": 100
    }
  },
  {
    "hours": {
      "open": 3,
      "close": 18
    },
    "name": "Jail",
    "color": "black",
    "position": {
      "x": 800,
      "y": 800
    },
    "size": {
      "x": 100,
      "y": 100
    }
  }
]

},{}],10:[function(require,module,exports){
var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Location;

function Location(options){
  Entity.call(this);
  var self = this;

  this.game = options.game;
  this.map = options.map;
  this.camera = options.camera;
  this.color = options.color;
  this.name = options.name;
  this.id = this.name.replace(/ /g,'_').toLowerCase();

  if (options.hasOwnProperty("spritesheet")) {
    this.spritesheet = options.spritesheet;
  }

  this.position = {
    x: options.position.x,
    y: options.position.y,
  };

  this.size = {
    x: options.size.x,
    y: options.size.y
  }

  this.hours = {
    open: options.hours.open,
    close: options.hours.close
  }

  this.sprite = new createjs.Sprite(this.spritesheet, this.name);

  this.uid = createjs.UID.get();

  this.on('update', function(interval){

  });

  this.on('draw', function(c){
    var x_pos = this.position.x - this.camera.position.x;
    var y_pos = this.position.y - this.camera.position.y;

    c.save();
    if (this.sprite) {
      //c.drawImage(this.bitmap, x_pos, y_pos);
      this.drawSprite(c, this.sprite, x_pos, y_pos);
      //                this.position.x - this.camera.position.x,
      //                this.position.y - this.camera.position.y);
    } else {
      c.fillStyle = this.color;
      c.fillRect(x_pos, y_pos,
                 this.size.x, this.size.y);
    }

    c.fillStyle = "white";
    c.font = "16px Arial";
    c.fillText(this.name, x_pos + 10, y_pos - 10);

    var status = this.open ? "open" : "closed";
    //console.log(status);

    c.fillStyle = "white";
    c.font = "12px Arial";
    c.fillText(status, x_pos + 22, y_pos + 85);

    c.restore();
  });

  this.drawSprite = function(c, sprite, x, y) {
    sprite._normalizeFrame();
    var o = sprite.spriteSheet.getFrame(sprite._currentFrame|0);
    if (!o) { return false; }
    var rect = o.rect;
    c.drawImage(o.image, rect.x, rect.y, rect.width, rect.height,
               x, y, rect.width, rect.height);
  };

  this.game.addMinuteListener(this);
}

inherits(Location, Entity);

Location.prototype.everyMinute = function(minute) {
  var hour = minute * 3;
  this.open = (hour >= this.hours.open) && (hour <= this.hours.close);
}

},{"crtrdg-entity":15,"inherits":27}],11:[function(require,module,exports){
var randomRGBA = require('./util/math').randomRGBA;
var locations = require('./locations.json');
var Location = require('./locations/location');
var AssetLoader = require('./asset_loader');

module.exports = Map;

function Map(game, width, height){
  this.game = game;
  this.width = width;
  this.height = height;
  this.image = null;
}

Map.prototype.generate = function(ticks){
  var context = document.createElement('canvas').getContext('2d');

  context.canvas.width = this.width;
  context.canvas.height = this.height;

  var size = 30;
  var columns = this.width / size;
  var rows = this.height / size;

  /*
  for (var x = 0, i = 0; i < columns; x+=size, i++){
    for (var y = 0, j=0; j < rows; y+=size, j++){
      context.fillStyle = randomRGBA(0, 255, 0, 255, 0, 255, 1);
      context.fillRect(x, y, size, size);
    }
  }
  */

  this.image = new Image();
  this.image.src = context.canvas.toDataURL("image/png");

  context = null;
}

// draw the map adjusted to camera
Map.prototype.draw = function(context, camera) {
  context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -camera.position.x, -camera.position.y, this.image.width, this.image.height);
}

Map.prototype.load = function(game, camera, filename) {
  var map = this;

  var data = {
    images: [ "assets/setPiecesTSR.PNG" ],
    frames: [
      [3, 170, 81, 64, 0],
      [86, 170, 81, 64, 0],
      [168, 170, 81, 64, 0],
      [250, 170, 81, 64, 0],
      [250, 170, 81, 64, 0]
    ],
    animations: {
      Shop: 0,
      Shelter: 1,
      "Food Bank": 2,
      Office: 3,
      Jail: 4
    }
  };

  this.assetLoader = new AssetLoader();
  this.spritesheet = this.assetLoader.load(data);

  map.locations = [];
  map.spritesheet = this.spritesheet;

  var assetLoader = new AssetLoader();
  var data = {
    images: [ "assets/setPiecesTSR.PNG" ],
    frames: [
      [3, 170, 81, 64, 0],
      [86, 170, 81, 64, 0],
      [168, 170, 81, 64, 0],
      [250, 170, 81, 64, 0],
      [250, 170, 81, 64, 0]
    ],
    animations: {
      Shop: 0,
      Shelter: 1,
      "Food Bank": 2,
      Office: 3,
      Jail: 4
    }
  };

  spritesheet = assetLoader.load("assets/setPiecesTSR.PNG", data);

  locations.forEach(function(location, index, array) {
    location.game = game;
    location.camera = camera;
    location.map = map;
    location.spritesheet = map.spritesheet;

    var building = new Location(location);
    building.addTo(game);
    map.locations.push(building);
  });

}

},{"./asset_loader":4,"./locations.json":9,"./locations/location":10,"./util/math":30}],12:[function(require,module,exports){
var tic = require('tic')();

module.exports = Menu;

function Menu(options){
  var options = options || {};
  var self = this;

  this.window = options.window;
  this.message = options.message;
  this.choices = options.choices || [];
  this.game = options.game;
  if (options.hasOwnProperty("close_timeout")) {
    this.close_timeout = options.close_timeout;
  }
  if (options.hasOwnProperty("timer_message")) {
    this.timer_message = options.timer_message;
  }
  this.opened = false;
  this.outerWrapper = document.getElementById('outer-dialog-wrapper');

  this.modal = options.modal || false;
  this.name = options.name;
  var okButton = document.getElementById("dialog-ok-button");
  var cancelButton = document.getElementById("dialog-cancel-button");

  okButton.addEventListener('click', function(event) {
    self.close();
    if (self.okCallback) {
      okCallback(self.choice);
    }
  });

  cancelButton.addEventListener('click', function(event) {
    self.close();
    if (self.cancelCallback) {
      cancelCallback(self.choice);
    }
  });

  var elements = self.window.getElementsByClassName("message");

  if (elements.length == 1) {
    elements[0].innerHTML = this.message;
  }
  var form = document.getElementById("choice-form");

  if (this.opened) {
    self.window.style.visibility = "hidden";
    this.opened = false;
  }
}

Menu.prototype.open = function(okCallback, cancelCallback) {
  var self = this;
  this.timer = 0;
  this.cancelCallback = cancelCallback;
  this.okCallback = okCallback;
  this.choice = null;

  this.outerWrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';

  var elements = self.window.getElementsByClassName("message");
  if (elements.length == 1) {
    elements[0].innerHTML = this.message;
  }
  var form = document.getElementById("choice-form");

  while (form.firstChild) {
    form.removeChild(form.firstChild);
  }
  for (var c in this.choices) {
    var choice = this.choices[c];
    var p = document.createElement('p');
    var e = document.createElement('input');
    e.setAttribute('type', 'radio');
    e.setAttribute('name', 'choice');
    e.setAttribute('value', choice.name);

    e.addEventListener('change', function(event) {
      self.choice = event.target.value;
      console.log("change event: " + self.choice);
    });

    e.innerHTML = choice.value;
    var t = document.createTextNode(choice.value);
    p.appendChild(e);
    p.appendChild(t);
    form.appendChild(p);
  };

  /* We need to have the timer thread / window open the dialog
     so that it can be closed by the close timer */
  var openTimeout = this.game.addTimeout(function() {
    self.window.style.visibility = "visible";
  }, 1);

  if (this.hasOwnProperty("close_timeout") && (this.close_timeout > 0)) {
    var timerInterval = window.setInterval(function(e) {
      self.timer += 1;
      if (self.timer_message) {
        var str = self.timer_message(self);
        document.getElementById("timer").style.visibility = "visible";
        document.getElementById("timer").innerHTML = str;
      }
    }, 1000);

    var closeTimeout = this.game.addTimeout(function(e) {
      self.close();
      clearInterval(timerInterval);
    }, 1000 * this.close_timeout);
  } else {
    document.getElementById("timer").style.visibility = "hidden";
  }

  if (this.modal) {
    this.game.emit('lock_movement');
    document.getElementById("dialog-buttons").style.visibility = "hidden";
    document.getElementById("timer").style.visibility = "hidden";
  } else {
    document.getElementById("dialog-buttons").style.visibility = "visible";
    document.getElementById("timer").style.visibility = "hidden";
  }
}

Menu.prototype.close = function() {
  this.outerWrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.0)';

  if (this.opened) {
    this.window.style.visibility = "hidden";

    this.opened = false;
  }
  if (this.modal) {
    this.game.emit('unlock_movement');
  }

  if (this.choice) this.game.emit("selected:" + this.name + ":" + this.choice);
  this.choice = null;

  document.getElementById("dialog-buttons").style.visibility = "hidden";
  document.getElementById("timer").style.visibility = "hidden";
}
},{"tic":28}],13:[function(require,module,exports){
var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Meter;

function Meter(options) {
  Entity.call(this);

  var self = this;

  this.level = 100;
  this.rate = 1;
  this.size = { y: 11 };
  this.listeners = [];

  if (options.hasOwnProperty("name")) {
    this.name = options.name;
  }
  if (options.hasOwnProperty("color")) {
    this.color = options.color;
  }
  if (options.hasOwnProperty("game")) {
    this.game = options.game;
  }
  if (options.hasOwnProperty("camera")) {
    this.camera = options.camera;
  }
  this.position = options.position;

  this.game.addIntervalEvent(this);

  this.everySecond = function() {
    if (this.level > 0) {
      this.level -= 1;
      this.listeners.forEach(function(listener, index, array) {
        listener.changeEvent("remove", 1);
      });
    }

    //console.log(this.name + " meter level: "+ this.level);
  };

  this.on('draw', function(c) {
    c.save();

    var label = this.name;

    c.fillStyle = "white";
    c.font = "12px Arial";
    c.fillText(label, self.position.x - 5, self.position.y + 9);

    c.beginPath();
    c.lineWidth = 2;
    c.strokeStyle = "black";

    c.fillStyle = self.color;
    c.rect(
      self.position.x + 45,// - self.camera.position.x + 45,
      self.position.y,// - self.camera.position.y,
      102,
      self.size.y + 2
    );
    c.stroke();

    c.fillRect(
      self.position.x + 46, // - self.camera.position.x + 46,
      self.position.y + 1, // - self.camera.position.y + 1,
      self.level,
      self.size.y
    );
    c.restore();
  });
};

inherits(Meter, Entity);

// Add value to this meter
Meter.prototype.add = function(value) {
  var new_level = this.level += value;
  if (new_level > 100) {
    new_level = 100;
  }
  this.level = new_level;
}

// Remove value to this meter
Meter.prototype.remove = function(value) {
  var new_level = this.level -= value;
  if (new_level < 0) {
    new_level = 0;
  }
  this.level = new_level;
  this.listeners.forEach(function(listener, index, array) {
    listener("remove", value);
  });
}

Meter.prototype.addListener = function(listener) {
  this.listeners.push(listener);
}

},{"crtrdg-entity":15,"inherits":27}],14:[function(require,module,exports){
 // ----------------------------------------------------------------------------
 // Buzz, a Javascript HTML5 Audio library
 // v1.1.0 - released 2013-08-15 13:18
 // Licensed under the MIT license.
 // http://buzz.jaysalvat.com/
 // ----------------------------------------------------------------------------
 // Copyright (C) 2010-2013 Jay Salvat
 // http://jaysalvat.com/
 // ----------------------------------------------------------------------------

(function(name, context, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof context.define === "function" && context.define.amd) {
        define(name, [], factory);
    } else {
        context[name] = factory();
    }
})("buzz", this, function() {
    var buzz = {
        defaults: {
            autoplay: false,
            duration: 5e3,
            formats: [],
            loop: false,
            placeholder: "--",
            preload: "metadata",
            volume: 80,
            document: document
        },
        types: {
            mp3: "audio/mpeg",
            ogg: "audio/ogg",
            wav: "audio/wav",
            aac: "audio/aac",
            m4a: "audio/x-m4a"
        },
        sounds: [],
        el: document.createElement("audio"),
        sound: function(src, options) {
            options = options || {};
            var doc = options.document || buzz.defaults.document;
            var pid = 0, events = [], eventsOnce = {}, supported = buzz.isSupported();
            this.load = function() {
                if (!supported) {
                    return this;
                }
                this.sound.load();
                return this;
            };
            this.play = function() {
                if (!supported) {
                    return this;
                }
                this.sound.play();
                return this;
            };
            this.togglePlay = function() {
                if (!supported) {
                    return this;
                }
                if (this.sound.paused) {
                    this.sound.play();
                } else {
                    this.sound.pause();
                }
                return this;
            };
            this.pause = function() {
                if (!supported) {
                    return this;
                }
                this.sound.pause();
                return this;
            };
            this.isPaused = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.paused;
            };
            this.stop = function() {
                if (!supported) {
                    return this;
                }
                this.setTime(0);
                this.sound.pause();
                return this;
            };
            this.isEnded = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.ended;
            };
            this.loop = function() {
                if (!supported) {
                    return this;
                }
                this.sound.loop = "loop";
                this.bind("ended.buzzloop", function() {
                    this.currentTime = 0;
                    this.play();
                });
                return this;
            };
            this.unloop = function() {
                if (!supported) {
                    return this;
                }
                this.sound.removeAttribute("loop");
                this.unbind("ended.buzzloop");
                return this;
            };
            this.mute = function() {
                if (!supported) {
                    return this;
                }
                this.sound.muted = true;
                return this;
            };
            this.unmute = function() {
                if (!supported) {
                    return this;
                }
                this.sound.muted = false;
                return this;
            };
            this.toggleMute = function() {
                if (!supported) {
                    return this;
                }
                this.sound.muted = !this.sound.muted;
                return this;
            };
            this.isMuted = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.muted;
            };
            this.setVolume = function(volume) {
                if (!supported) {
                    return this;
                }
                if (volume < 0) {
                    volume = 0;
                }
                if (volume > 100) {
                    volume = 100;
                }
                this.volume = volume;
                this.sound.volume = volume / 100;
                return this;
            };
            this.getVolume = function() {
                if (!supported) {
                    return this;
                }
                return this.volume;
            };
            this.increaseVolume = function(value) {
                return this.setVolume(this.volume + (value || 1));
            };
            this.decreaseVolume = function(value) {
                return this.setVolume(this.volume - (value || 1));
            };
            this.setTime = function(time) {
                if (!supported) {
                    return this;
                }
                var set = true;
                this.whenReady(function() {
                    if (set === true) {
                        set = false;
                        this.sound.currentTime = time;
                    }
                });
                return this;
            };
            this.getTime = function() {
                if (!supported) {
                    return null;
                }
                var time = Math.round(this.sound.currentTime * 100) / 100;
                return isNaN(time) ? buzz.defaults.placeholder : time;
            };
            this.setPercent = function(percent) {
                if (!supported) {
                    return this;
                }
                return this.setTime(buzz.fromPercent(percent, this.sound.duration));
            };
            this.getPercent = function() {
                if (!supported) {
                    return null;
                }
                var percent = Math.round(buzz.toPercent(this.sound.currentTime, this.sound.duration));
                return isNaN(percent) ? buzz.defaults.placeholder : percent;
            };
            this.setSpeed = function(duration) {
                if (!supported) {
                    return this;
                }
                this.sound.playbackRate = duration;
                return this;
            };
            this.getSpeed = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.playbackRate;
            };
            this.getDuration = function() {
                if (!supported) {
                    return null;
                }
                var duration = Math.round(this.sound.duration * 100) / 100;
                return isNaN(duration) ? buzz.defaults.placeholder : duration;
            };
            this.getPlayed = function() {
                if (!supported) {
                    return null;
                }
                return timerangeToArray(this.sound.played);
            };
            this.getBuffered = function() {
                if (!supported) {
                    return null;
                }
                return timerangeToArray(this.sound.buffered);
            };
            this.getSeekable = function() {
                if (!supported) {
                    return null;
                }
                return timerangeToArray(this.sound.seekable);
            };
            this.getErrorCode = function() {
                if (supported && this.sound.error) {
                    return this.sound.error.code;
                }
                return 0;
            };
            this.getErrorMessage = function() {
                if (!supported) {
                    return null;
                }
                switch (this.getErrorCode()) {
                  case 1:
                    return "MEDIA_ERR_ABORTED";

                  case 2:
                    return "MEDIA_ERR_NETWORK";

                  case 3:
                    return "MEDIA_ERR_DECODE";

                  case 4:
                    return "MEDIA_ERR_SRC_NOT_SUPPORTED";

                  default:
                    return null;
                }
            };
            this.getStateCode = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.readyState;
            };
            this.getStateMessage = function() {
                if (!supported) {
                    return null;
                }
                switch (this.getStateCode()) {
                  case 0:
                    return "HAVE_NOTHING";

                  case 1:
                    return "HAVE_METADATA";

                  case 2:
                    return "HAVE_CURRENT_DATA";

                  case 3:
                    return "HAVE_FUTURE_DATA";

                  case 4:
                    return "HAVE_ENOUGH_DATA";

                  default:
                    return null;
                }
            };
            this.getNetworkStateCode = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.networkState;
            };
            this.getNetworkStateMessage = function() {
                if (!supported) {
                    return null;
                }
                switch (this.getNetworkStateCode()) {
                  case 0:
                    return "NETWORK_EMPTY";

                  case 1:
                    return "NETWORK_IDLE";

                  case 2:
                    return "NETWORK_LOADING";

                  case 3:
                    return "NETWORK_NO_SOURCE";

                  default:
                    return null;
                }
            };
            this.set = function(key, value) {
                if (!supported) {
                    return this;
                }
                this.sound[key] = value;
                return this;
            };
            this.get = function(key) {
                if (!supported) {
                    return null;
                }
                return key ? this.sound[key] : this.sound;
            };
            this.bind = function(types, func) {
                if (!supported) {
                    return this;
                }
                types = types.split(" ");
                var self = this, efunc = function(e) {
                    func.call(self, e);
                };
                for (var t = 0; t < types.length; t++) {
                    var type = types[t], idx = type;
                    type = idx.split(".")[0];
                    events.push({
                        idx: idx,
                        func: efunc
                    });
                    this.sound.addEventListener(type, efunc, true);
                }
                return this;
            };
            this.unbind = function(types) {
                if (!supported) {
                    return this;
                }
                types = types.split(" ");
                for (var t = 0; t < types.length; t++) {
                    var idx = types[t], type = idx.split(".")[0];
                    for (var i = 0; i < events.length; i++) {
                        var namespace = events[i].idx.split(".");
                        if (events[i].idx == idx || namespace[1] && namespace[1] == idx.replace(".", "")) {
                            this.sound.removeEventListener(type, events[i].func, true);
                            events.splice(i, 1);
                        }
                    }
                }
                return this;
            };
            this.bindOnce = function(type, func) {
                if (!supported) {
                    return this;
                }
                var self = this;
                eventsOnce[pid++] = false;
                this.bind(type + "." + pid, function() {
                    if (!eventsOnce[pid]) {
                        eventsOnce[pid] = true;
                        func.call(self);
                    }
                    self.unbind(type + "." + pid);
                });
                return this;
            };
            this.trigger = function(types) {
                if (!supported) {
                    return this;
                }
                types = types.split(" ");
                for (var t = 0; t < types.length; t++) {
                    var idx = types[t];
                    for (var i = 0; i < events.length; i++) {
                        var eventType = events[i].idx.split(".");
                        if (events[i].idx == idx || eventType[0] && eventType[0] == idx.replace(".", "")) {
                            var evt = doc.createEvent("HTMLEvents");
                            evt.initEvent(eventType[0], false, true);
                            this.sound.dispatchEvent(evt);
                        }
                    }
                }
                return this;
            };
            this.fadeTo = function(to, duration, callback) {
                if (!supported) {
                    return this;
                }
                if (duration instanceof Function) {
                    callback = duration;
                    duration = buzz.defaults.duration;
                } else {
                    duration = duration || buzz.defaults.duration;
                }
                var from = this.volume, delay = duration / Math.abs(from - to), self = this;
                this.play();
                function doFade() {
                    setTimeout(function() {
                        if (from < to && self.volume < to) {
                            self.setVolume(self.volume += 1);
                            doFade();
                        } else if (from > to && self.volume > to) {
                            self.setVolume(self.volume -= 1);
                            doFade();
                        } else if (callback instanceof Function) {
                            callback.apply(self);
                        }
                    }, delay);
                }
                this.whenReady(function() {
                    doFade();
                });
                return this;
            };
            this.fadeIn = function(duration, callback) {
                if (!supported) {
                    return this;
                }
                return this.setVolume(0).fadeTo(100, duration, callback);
            };
            this.fadeOut = function(duration, callback) {
                if (!supported) {
                    return this;
                }
                return this.fadeTo(0, duration, callback);
            };
            this.fadeWith = function(sound, duration) {
                if (!supported) {
                    return this;
                }
                this.fadeOut(duration, function() {
                    this.stop();
                });
                sound.play().fadeIn(duration);
                return this;
            };
            this.whenReady = function(func) {
                if (!supported) {
                    return null;
                }
                var self = this;
                if (this.sound.readyState === 0) {
                    this.bind("canplay.buzzwhenready", function() {
                        func.call(self);
                    });
                } else {
                    func.call(self);
                }
            };
            function timerangeToArray(timeRange) {
                var array = [], length = timeRange.length - 1;
                for (var i = 0; i <= length; i++) {
                    array.push({
                        start: timeRange.start(i),
                        end: timeRange.end(i)
                    });
                }
                return array;
            }
            function getExt(filename) {
                return filename.split(".").pop();
            }
            function addSource(sound, src) {
                var source = doc.createElement("source");
                source.src = src;
                if (buzz.types[getExt(src)]) {
                    source.type = buzz.types[getExt(src)];
                }
                sound.appendChild(source);
            }
            if (supported && src) {
                for (var i in buzz.defaults) {
                    if (buzz.defaults.hasOwnProperty(i)) {
                        options[i] = options[i] || buzz.defaults[i];
                    }
                }
                this.sound = doc.createElement("audio");
                if (src instanceof Array) {
                    for (var j in src) {
                        if (src.hasOwnProperty(j)) {
                            addSource(this.sound, src[j]);
                        }
                    }
                } else if (options.formats.length) {
                    for (var k in options.formats) {
                        if (options.formats.hasOwnProperty(k)) {
                            addSource(this.sound, src + "." + options.formats[k]);
                        }
                    }
                } else {
                    addSource(this.sound, src);
                }
                if (options.loop) {
                    this.loop();
                }
                if (options.autoplay) {
                    this.sound.autoplay = "autoplay";
                }
                if (options.preload === true) {
                    this.sound.preload = "auto";
                } else if (options.preload === false) {
                    this.sound.preload = "none";
                } else {
                    this.sound.preload = options.preload;
                }
                this.setVolume(options.volume);
                buzz.sounds.push(this);
            }
        },
        group: function(sounds) {
            sounds = argsToArray(sounds, arguments);
            this.getSounds = function() {
                return sounds;
            };
            this.add = function(soundArray) {
                soundArray = argsToArray(soundArray, arguments);
                for (var a = 0; a < soundArray.length; a++) {
                    sounds.push(soundArray[a]);
                }
            };
            this.remove = function(soundArray) {
                soundArray = argsToArray(soundArray, arguments);
                for (var a = 0; a < soundArray.length; a++) {
                    for (var i = 0; i < sounds.length; i++) {
                        if (sounds[i] == soundArray[a]) {
                            sounds.splice(i, 1);
                            break;
                        }
                    }
                }
            };
            this.load = function() {
                fn("load");
                return this;
            };
            this.play = function() {
                fn("play");
                return this;
            };
            this.togglePlay = function() {
                fn("togglePlay");
                return this;
            };
            this.pause = function(time) {
                fn("pause", time);
                return this;
            };
            this.stop = function() {
                fn("stop");
                return this;
            };
            this.mute = function() {
                fn("mute");
                return this;
            };
            this.unmute = function() {
                fn("unmute");
                return this;
            };
            this.toggleMute = function() {
                fn("toggleMute");
                return this;
            };
            this.setVolume = function(volume) {
                fn("setVolume", volume);
                return this;
            };
            this.increaseVolume = function(value) {
                fn("increaseVolume", value);
                return this;
            };
            this.decreaseVolume = function(value) {
                fn("decreaseVolume", value);
                return this;
            };
            this.loop = function() {
                fn("loop");
                return this;
            };
            this.unloop = function() {
                fn("unloop");
                return this;
            };
            this.setTime = function(time) {
                fn("setTime", time);
                return this;
            };
            this.set = function(key, value) {
                fn("set", key, value);
                return this;
            };
            this.bind = function(type, func) {
                fn("bind", type, func);
                return this;
            };
            this.unbind = function(type) {
                fn("unbind", type);
                return this;
            };
            this.bindOnce = function(type, func) {
                fn("bindOnce", type, func);
                return this;
            };
            this.trigger = function(type) {
                fn("trigger", type);
                return this;
            };
            this.fade = function(from, to, duration, callback) {
                fn("fade", from, to, duration, callback);
                return this;
            };
            this.fadeIn = function(duration, callback) {
                fn("fadeIn", duration, callback);
                return this;
            };
            this.fadeOut = function(duration, callback) {
                fn("fadeOut", duration, callback);
                return this;
            };
            function fn() {
                var args = argsToArray(null, arguments), func = args.shift();
                for (var i = 0; i < sounds.length; i++) {
                    sounds[i][func].apply(sounds[i], args);
                }
            }
            function argsToArray(array, args) {
                return array instanceof Array ? array : Array.prototype.slice.call(args);
            }
        },
        all: function() {
            return new buzz.group(buzz.sounds);
        },
        isSupported: function() {
            return !!buzz.el.canPlayType;
        },
        isOGGSupported: function() {
            return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/ogg; codecs="vorbis"');
        },
        isWAVSupported: function() {
            return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/wav; codecs="1"');
        },
        isMP3Supported: function() {
            return !!buzz.el.canPlayType && buzz.el.canPlayType("audio/mpeg;");
        },
        isAACSupported: function() {
            return !!buzz.el.canPlayType && (buzz.el.canPlayType("audio/x-m4a;") || buzz.el.canPlayType("audio/aac;"));
        },
        toTimer: function(time, withHours) {
            var h, m, s;
            h = Math.floor(time / 3600);
            h = isNaN(h) ? "--" : h >= 10 ? h : "0" + h;
            m = withHours ? Math.floor(time / 60 % 60) : Math.floor(time / 60);
            m = isNaN(m) ? "--" : m >= 10 ? m : "0" + m;
            s = Math.floor(time % 60);
            s = isNaN(s) ? "--" : s >= 10 ? s : "0" + s;
            return withHours ? h + ":" + m + ":" + s : m + ":" + s;
        },
        fromTimer: function(time) {
            var splits = time.toString().split(":");
            if (splits && splits.length == 3) {
                time = parseInt(splits[0], 10) * 3600 + parseInt(splits[1], 10) * 60 + parseInt(splits[2], 10);
            }
            if (splits && splits.length == 2) {
                time = parseInt(splits[0], 10) * 60 + parseInt(splits[1], 10);
            }
            return time;
        },
        toPercent: function(value, total, decimal) {
            var r = Math.pow(10, decimal || 0);
            return Math.round(value * 100 / total * r) / r;
        },
        fromPercent: function(percent, total, decimal) {
            var r = Math.pow(10, decimal || 0);
            return Math.round(total / 100 * percent * r) / r;
        }
    };
    return buzz;
});
},{}],15:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var aabb = require('aabb-2d');

module.exports = Entity;
inherits(Entity, EventEmitter);

function Entity(){
  return this;
}

Entity.prototype.addTo = function(game){
  this.game = game || {};

  if (!this.game.entities){
    this.game.entities = [];
  }

  this.game.entities.push(this);
  this.game.findEntity = this.findEntity;
  this.initializeListeners();
  this.setBoundingBox();

  this.on('update', function(interval){
    this.setBoundingBox();
  });

  this.exists = true;

  return this;
};

Entity.prototype.initializeListeners = function(){
  var self = this;
  
  this.findEntity(this, function(exists, entities, index){
    if (exists){
      self.game.on('update', function(interval){
        self.emit('update', interval)
      });

      self.game.on('draw', function(context){
        self.emit('draw', context);
      });
    }
  });
};

Entity.prototype.remove = function(){
  this.exists = false;
  
  this.removeAllListeners('update');
  this.removeAllListeners('draw');

  this.findEntity(this, function(exists, entities, index){
    if (exists){
      entities.splice(index, 1);
    }
  });
};

Entity.prototype.findEntity = function(entity, callback){
  var entities;

  if (this.game === undefined){
    entities = this.entities;
  } else {
    entities = this.game.entities;
  }

  for (var i=0; i<entities.length; i++){
    if (entities[i] === entity) {
      callback(true, entities, i);
    }
  }
};

Entity.prototype.touches = function(entity){
  if (entity.exists){
    return this.boundingBox.intersects(entity.boundingBox);
  }
  else {
    return false;
  }
}

Entity.prototype.setBoundingBox = function(){
  this.boundingBox = aabb([this.position.x, this.position.y], [this.size.x, this.size.y]);  
};

},{"aabb-2d":16,"events":2,"inherits":18}],16:[function(require,module,exports){
module.exports = AABB

var vec2 = require('gl-matrix').vec2

function AABB(pos, vec) {
  if(!(this instanceof AABB)) {
    return new AABB(pos, vec)
  }

  this.base = pos
  this.vec = vec

  this.mag = vec2.length(this.vec)

  this.max = vec2.create()
  vec2.add(this.max, this.base, this.vec)
}

var cons = AABB
  , proto = cons.prototype

proto.perimeter = function() {
  return 2 * (this.vec[0] + this.vec[1])
}

proto.area = function() {
  return this.vec[0] * this.vec[0] + this.vec[1] * this.vec[1]
}

proto.intperimeter = function() {
  return (this.vec[0] + this.vec[1]) << 1
}

proto.width = function() {
  return this.vec[0]
}

proto.height = function() {
  return this.vec[1]
}

proto.x0 = function() {
  return this.base[0]
}

proto.y0 = function() {
  return this.base[1]
}

proto.x1 = function() {
  return this.max[0]
}

proto.y1 = function() {
  return this.max[1]
}

proto.translate = function(by) {
  vec2.add(this.max, this.max, by)
  vec2.add(this.base, this.base, by)
  return this
}

proto.expand = function(aabb) {
  var max = vec2.create()
    , min = vec2.create()

  vec2.max(max, aabb.max, this.max)
  vec2.min(min, aabb.base, this.base)
  vec2.sub(max, max, min)

  return new AABB(min, max)
}

proto.intersects = function(aabb) {
  if(aabb.base[0] > this.max[0]) return false
  if(aabb.base[1] > this.max[1]) return false
  if(aabb.max[0] < this.base[0]) return false
  if(aabb.max[1] < this.base[1]) return false

  return true
}

proto.union = function(aabb) {
  if(!this.intersects(aabb)) return null

  var base_x = Math.max(aabb.base[0], this.base[0])
    , base_y = Math.max(aabb.base[1], this.base[1])
    , max_x = Math.min(aabb.max[0], this.max[0])
    , max_y = Math.min(aabb.max[1], this.max[1])

  return new AABB([base_x, base_y], [max_x - base_x, max_y - base_y])
}

},{"gl-matrix":17}],17:[function(require,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.0.0
 */

/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


(function() {
  "use strict";

  var shim = {};
  if (typeof(exports) === 'undefined') {
    if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      shim.exports = {};
      define(function() {
        return shim.exports;
      });
    } else {
      // gl-matrix lives in a browser, define its namespaces in global
      shim.exports = window;
    }    
  }
  else {
    // gl-matrix lives in commonjs, define its namespaces in exports
    shim.exports = exports;
  }

  (function(exports) {
    /* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */

var vec2 = {};

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}
 
/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    return new Float32Array(2);
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new Float32Array(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new Float32Array(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.sub = vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.mul = vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.div = vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {vec2} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.dist = vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.sqrDist = vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Caclulates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.len = vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Caclulates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.sqrLen = vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Caclulates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = x * m[0] + y * m[1];
    out[1] = x * m[2] + y * m[3];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 */
vec2.forEach = (function() {
    var vec = new Float32Array(2);

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}
;
/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */

var vec3 = {};

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}
 
/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    return new Float32Array(3);
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new Float32Array(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new Float32Array(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.sub = vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.mul = vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.div = vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {vec3} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.dist = vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.sqrDist = vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Caclulates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.len = vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Caclulates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.sqrLen = vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Caclulates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 */
vec3.forEach = (function() {
    var vec = new Float32Array(3);

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec3 = vec3;
}
;
/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */

var vec4 = {};

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    return new Float32Array(4);
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new Float32Array(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new Float32Array(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.sub = vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.mul = vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.div = vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {vec4} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.dist = vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.sqrDist = vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Caclulates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.len = vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Caclulates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.sqrLen = vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        out[3] = a[3] * len;
    }
    return out;
};

/**
 * Caclulates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 */
vec4.forEach = (function() {
    var vec = new Float32Array(4);

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec4 = vec4;
}
;
/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */

var mat2 = {};

var mat2Identity = new Float32Array([
    1, 0,
    0, 1
]);

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    return new Float32Array(mat2Identity);
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new Float32Array(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Caclulates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.mul = mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a1 * b2;
    out[1] = a0 * b1 + a1 * b3;
    out[2] = a2 * b0 + a3 * b2;
    out[3] = a2 * b1 + a3 * b3;
    return out;
};

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {mat2} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a1 * s;
    out[1] = a0 * -s + a1 * c;
    out[2] = a2 *  c + a3 * s;
    out[3] = a2 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {mat2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v1;
    out[2] = a2 * v0;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2 = mat2;
}
;
/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */

var mat3 = {};

var mat3Identity = new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
]);

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    return new Float32Array(mat3Identity);
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new Float32Array(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Caclulates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.mul = mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat3 = mat3;
}
;
/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */

var mat4 = {};

var mat4Identity = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    return new Float32Array(mat4Identity);
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new Float32Array(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Caclulates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.mul = mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat4 = mat4;
}
;
/* Copyright (c) 2012, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class Quaternion
 * @name quat
 */

var quat = {};

var quatIdentity = new Float32Array([0, 0, 0, 1]);

if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    return new Float32Array(quatIdentity);
};

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.mul = quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {quat} b amount to scale the vector by
 * @returns {quat} out
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle around the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle around the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Caclulates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = a[3];

    var cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw,
        halfTheta,
        sinHalfTheta,
        ratioA,
        ratioB;

    if (Math.abs(cosHalfTheta) >= 1.0) {
        if (out !== a) {
            out[0] = ax;
            out[1] = ay;
            out[2] = az;
            out[3] = aw;
        }
        return out;
    }

    halfTheta = Math.acos(cosHalfTheta);
    sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
        out[0] = (ax * 0.5 + bx * 0.5);
        out[1] = (ay * 0.5 + by * 0.5);
        out[2] = (az * 0.5 + bz * 0.5);
        out[3] = (aw * 0.5 + bw * 0.5);
        return out;
    }

    ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    out[0] = (ax * ratioA + bx * ratioB);
    out[1] = (ay * ratioA + by * ratioB);
    out[2] = (az * ratioA + bz * ratioB);
    out[3] = (aw * ratioA + bw * ratioB);

    return out;
};

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Caclulates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 */
quat.len = quat.length = vec4.length;

/**
 * Caclulates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
quat.sqrLen = quat.squaredLength = vec4.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 */
quat.normalize = vec4.normalize;

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.quat = quat;
}
;










  })(shim.exports);
})();

},{}],18:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],19:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var requestAnimationFrame = require('raf');
var inherits = require('inherits');

module.exports = Game;
inherits(Game, EventEmitter);

function Game(options){
  var options = options || {};

  EventEmitter.call(this);
  var self = this;
  
  if (!options.canvas){
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game';
    document.body.appendChild(this.canvas);
  } else if (typeof options.canvas === 'string'){
    this.canvas = document.getElementById(options.canvas);
  } else if (typeof options.canvas === 'object' && options.canvas.tagName) {
    this.canvas = options.canvas
  }

  this.context = this.canvas.getContext('2d');
  this.width = this.canvas.width = options.width || window.innerWidth;
  this.height = this.canvas.height = options.height || window.innerHeight;
  this.backgroundColor = options.backgroundColor || '#E187B8';

  this.ticker = requestAnimationFrame(this.canvas);
  this.paused = false;

  if (options.maxListeners){
    this.setMaxListeners(options.maxListeners);
  } else {
    this.setMaxListeners(0);
  }

  window.addEventListener('load', function(){
    self.start();
  });
}

Game.prototype.start = function(){
  var self = this;
  this.emit('start');
  this.ticker.on('data', function(interval) {
    self.update(interval);
    self.draw();
  });
};

Game.prototype.pause = function(){
  this.paused = true;
  this.ticker.pause();
  this.emit('pause');
};

Game.prototype.resume = function(){
  var self = this;
  
  this.paused = false;
  this.ticker = requestAnimationFrame(this.canvas);
  this.ticker.on('data', function(interval) {
    self.update(interval);
    self.draw();
  });

  this.emit('resume');
};

Game.prototype.update = function(interval){
  if (this.currentScene){
    this.sceneManager.update(interval);
  }
  this.emit('update', interval);
};

Game.prototype.draw = function(){
  if (this.currentScene){
    this.context.fillStyle = this.currentScene.backgroundColor;
    this.sceneManager.draw(this.context);
  } else {
    this.context.fillStyle = this.backgroundColor;
  }
  this.context.fillRect(0, 0, this.width, this.height);
  this.emit('draw-background', this.context);
  this.emit('draw', this.context);
  this.emit('draw-foreground', this.context);
};
},{"events":2,"inherits":20,"raf":21}],20:[function(require,module,exports){
module.exports=require(18)
},{}],21:[function(require,module,exports){
module.exports = raf

var EE = require('events').EventEmitter
  , global = typeof window === 'undefined' ? this : window
  , now = global.performance && global.performance.now ? function() {
    return performance.now()
  } : Date.now || function () {
    return +new Date()
  }

var _raf =
  global.requestAnimationFrame ||
  global.webkitRequestAnimationFrame ||
  global.mozRequestAnimationFrame ||
  global.msRequestAnimationFrame ||
  global.oRequestAnimationFrame ||
  (global.setImmediate ? function(fn, el) {
    setImmediate(fn)
  } :
  function(fn, el) {
    setTimeout(fn, 0)
  })

function raf(el) {
  var now = raf.now()
    , ee = new EE

  ee.pause = function() { ee.paused = true }
  ee.resume = function() { ee.paused = false }

  _raf(iter, el)

  return ee

  function iter(timestamp) {
    var _now = raf.now()
      , dt = _now - now
    
    now = _now

    ee.emit('data', dt)

    if(!ee.paused) {
      _raf(iter, el)
    }
  }
}

raf.polyfill = _raf
raf.now = now


},{"events":2}],22:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var vkey = require('vkey');

module.exports = Keyboard;
inherits(Keyboard, EventEmitter);

function Keyboard(game){
  this.game = game || {};
  this.keysDown = {};
  this.initializeListeners();
}

Keyboard.prototype.initializeListeners = function(){
  var self = this;

  document.addEventListener('keydown', function(e){
    self.emit('keydown', vkey[e.keyCode]);
    self.keysDown[vkey[e.keyCode]] = true;

    if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 32) {
      e.preventDefault();
    }
  }, false);

  document.addEventListener('keyup', function(e){
    self.emit('keyup', vkey[e.keyCode]);
    delete self.keysDown[vkey[e.keyCode]];
  }, false);
};
},{"events":2,"inherits":23,"vkey":24}],23:[function(require,module,exports){
module.exports=require(18)
},{}],24:[function(require,module,exports){
var ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  , isOSX = /OS X/.test(ua)
  , isOpera = /Opera/.test(ua)
  , maybeFirefox = !/like Gecko/.test(ua) && !isOpera

var i, output = module.exports = {
  0:  isOSX ? '<menu>' : '<UNK>'
, 1:  '<mouse 1>'
, 2:  '<mouse 2>'
, 3:  '<break>'
, 4:  '<mouse 3>'
, 5:  '<mouse 4>'
, 6:  '<mouse 5>'
, 8:  '<backspace>'
, 9:  '<tab>'
, 12: '<clear>'
, 13: '<enter>'
, 16: '<shift>'
, 17: '<control>'
, 18: '<alt>'
, 19: '<pause>'
, 20: '<caps-lock>'
, 21: '<ime-hangul>'
, 23: '<ime-junja>'
, 24: '<ime-final>'
, 25: '<ime-kanji>'
, 27: '<escape>'
, 28: '<ime-convert>'
, 29: '<ime-nonconvert>'
, 30: '<ime-accept>'
, 31: '<ime-mode-change>'
, 27: '<escape>'
, 32: '<space>'
, 33: '<page-up>'
, 34: '<page-down>'
, 35: '<end>'
, 36: '<home>'
, 37: '<left>'
, 38: '<up>'
, 39: '<right>'
, 40: '<down>'
, 41: '<select>'
, 42: '<print>'
, 43: '<execute>'
, 44: '<snapshot>'
, 45: '<insert>'
, 46: '<delete>'
, 47: '<help>'
, 91: '<meta>'  // meta-left -- no one handles left and right properly, so we coerce into one.
, 92: '<meta>'  // meta-right
, 93: isOSX ? '<meta>' : '<menu>'      // chrome,opera,safari all report this for meta-right (osx mbp).
, 95: '<sleep>'
, 106: '<num-*>'
, 107: '<num-+>'
, 108: '<num-enter>'
, 109: '<num-->'
, 110: '<num-.>'
, 111: '<num-/>'
, 144: '<num-lock>'
, 145: '<scroll-lock>'
, 160: '<shift-left>'
, 161: '<shift-right>'
, 162: '<control-left>'
, 163: '<control-right>'
, 164: '<alt-left>'
, 165: '<alt-right>'
, 166: '<browser-back>'
, 167: '<browser-forward>'
, 168: '<browser-refresh>'
, 169: '<browser-stop>'
, 170: '<browser-search>'
, 171: '<browser-favorites>'
, 172: '<browser-home>'

  // ff/osx reports '<volume-mute>' for '-'
, 173: isOSX && maybeFirefox ? '-' : '<volume-mute>'
, 174: '<volume-down>'
, 175: '<volume-up>'
, 176: '<next-track>'
, 177: '<prev-track>'
, 178: '<stop>'
, 179: '<play-pause>'
, 180: '<launch-mail>'
, 181: '<launch-media-select>'
, 182: '<launch-app 1>'
, 183: '<launch-app 2>'
, 186: ';'
, 187: '='
, 188: ','
, 189: '-'
, 190: '.'
, 191: '/'
, 192: '`'
, 219: '['
, 220: '\\'
, 221: ']'
, 222: "'"
, 223: '<meta>'
, 224: '<meta>'       // firefox reports meta here.
, 226: '<alt-gr>'
, 229: '<ime-process>'
, 231: isOpera ? '`' : '<unicode>'
, 246: '<attention>'
, 247: '<crsel>'
, 248: '<exsel>'
, 249: '<erase-eof>'
, 250: '<play>'
, 251: '<zoom>'
, 252: '<no-name>'
, 253: '<pa-1>'
, 254: '<clear>'
}

for(i = 58; i < 65; ++i) {
  output[i] = String.fromCharCode(i)
}

// 0-9
for(i = 48; i < 58; ++i) {
  output[i] = (i - 48)+''
}

// A-Z
for(i = 65; i < 91; ++i) {
  output[i] = String.fromCharCode(i)
}

// num0-9
for(i = 96; i < 107; ++i) {
  output[i] = '<num-'+(i - 96)+'>'
}

// F1-F24
for(i = 112; i < 136; ++i) {
  output[i] = 'F'+(i-111)
}

},{}],25:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

module.exports = Mouse;
inherits(Mouse, EventEmitter);

function Mouse(game){
  this.game = game || {};
  this.el = game.canvas;
  this.initializeListeners();
}

Mouse.prototype.initializeListeners = function(){
  var self = this;

  this.el.addEventListener('click', function(e){
    e.preventDefault();
    
    self.calculateOffset(e, function(location){
      self.emit('click', location);
    });
    return false;
  }, false);

  this.el.addEventListener('mousedown', function(e){
    e.preventDefault();

    self.calculateOffset(e, function(location){
      self.emit('mousedown', location);
    });
    return false;
  }, false);

  this.el.addEventListener('mouseup', function(e){
    e.preventDefault();

    self.calculateOffset(e, function(location){
      self.emit('mouseup', location);
    });

    return false;
  }, false);

  this.el.addEventListener('mousemove', function(e){
    e.preventDefault();

    self.calculateOffset(e, function(location){
      self.emit('mousemove', location);
    });
    return false;
  }, false);
};

Mouse.prototype.calculateOffset = function(e, callback){
  var canvas = e.target;
  var offsetX = canvas.offsetLeft - canvas.scrollLeft;
  var offsetY = canvas.offsetTop - canvas.scrollTop;

  var location = {
    x: e.pageX - offsetX,
    y: e.pageY - offsetY
  };

  callback(location);
}

},{"events":2,"inherits":27}],26:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

module.exports = SceneManager;

function SceneManager(game){
  this.game = game || {};
  this.game.scenes = [];
  this.game.sceneManager = this;
  this.game.currentScene = null;
  this.game.previousScene = null;

  return this;
};

SceneManager.prototype.add = function(scene){
  this.game.scenes.push(scene);

  return this;
};

SceneManager.prototype.create = function(options){
  var scene = new Scene(options);
  this.add(scene);
  return scene;
};

SceneManager.prototype.set = function(scene){
  if (this.game.currentScene !== null) {
    this.game.currentScene.emit('end');
  }
  this.game.currentScene = scene;
  scene.emit('start', scene);
};

SceneManager.prototype.get = function(sceneName){
  for (var i=0; i<this.game.scenes.length; i++){
    if (this.game.scenes[i].name === sceneName) {
      return this.game.scenes[i];
    }
  }
};

SceneManager.prototype.update = function(interval){
  this.game.currentScene.update(interval);
};

SceneManager.prototype.draw = function(context){
  this.game.currentScene.draw(context);
};


exports.Scene = Scene;
inherits(Scene, EventEmitter);

function Scene(options){
  this.name = options.name;
  this.backgroundColor = options.backgroundColor;

  return this;
}

Scene.prototype.update = function(interval){
  this.emit('update', interval)
};

Scene.prototype.draw = function(context){
  this.emit('draw', context);
};

},{"events":2,"inherits":27}],27:[function(require,module,exports){
module.exports=require(18)
},{}],28:[function(require,module,exports){
/*
 * tic
 * https://github.com/shama/tic
 *
 * Copyright (c) 2013 Kyle Robinson Young
 * Licensed under the MIT license.
 */

function Tic() { this._things = []; }
module.exports = function() { return new Tic(); };

Tic.prototype._stack = function(thing) {
  var self = this;
  self._things.push(thing);
  var i = self._things.length - 1;
  return function() { delete self._things[i]; }
};

Tic.prototype.interval = Tic.prototype.setInterval = function(fn, at) {
  return this._stack({
    fn: fn, at: at, args: Array.prototype.slice.call(arguments, 2),
    elapsed: 0, once: false
  });
};

Tic.prototype.timeout = Tic.prototype.setTimeout = function(fn, at) {
  return this._stack({
    fn: fn, at: at, args: Array.prototype.slice.call(arguments, 2),
    elapsed: 0, once: true
  });
};

Tic.prototype.tick = function(dt) {
  var self = this;
  self._things.forEach(function(thing, i) {
    thing.elapsed += dt;
    if (thing.elapsed > thing.at) {
      thing.elapsed -= thing.at;
      thing.fn.apply(thing.fn, thing.args || []);
      if (thing.once) {
        delete self._things[i];
      }
    }
  });
};

},{}],29:[function(require,module,exports){
var inherits = require('inherits');
var Entity = require('crtrdg-entity');
var randomInt = require('./util/math').randomInt;
var randomRGB = require('./util/math').randomRGB;
var randomRGBA = require('./util/math').randomRGBA;
var AssetLoader = require('./asset_loader');
var Menu = require('./menu');

module.exports = Player;

function Player(options){
  Entity.call(this);
  var self = this;

  this.game = options.game;
  this.keysDown = options.keysDown;
  this.camera = options.camera;

  this.size = { x: 16, y: 16 };
  this.velocity = { x: 0, y: 0 };
  this.position = options.position;

  this.speed = 8;
  this.friction = 0.4;
  this.health = 100;
  this.strength = 5;
  this.color = '#fff';
  this.visible = true;
  this.points = 00;
  this.blockers = {};
  this.step = 0;
  this.can_move = true;

  this.particles = {
    jump: {
      size: 3,
      number: 10,
      color: '#b4b4ad'
    }
  }

  var assetData = {
    images: [ "assets/basictiles.png" ],
    frames: [
      [0,   160, 16, 16, 0],
      [16,  160, 16, 16, 0],
      [32,  160, 16, 16, 0],
      [48,  160, 16, 16, 0],
      [64,  160, 16, 16, 0],
      [80,  160, 16, 16, 0],
      [96,  160, 16, 16, 0],
      [112, 160, 16, 16, 0],
    ],
    animations: {
      down: [0, 1],
      right: [2, 3],
      up: [4, 5],
      left: [6, 7]
    }
  };
  this.assetLoader = new AssetLoader();
  var spriteSheet = this.assetLoader.load(assetData);

  this.anims = {
    "up": new createjs.Sprite(spriteSheet, "up"),
    "down": new createjs.Sprite(spriteSheet, "down"),
    "right": new createjs.Sprite(spriteSheet, "right"),
    "left": new createjs.Sprite(spriteSheet, "left")
  }

  this.on('update', function(interval){
    self.input(self.keysDown);
    self.handleBlockers();
    self.move();
    self.velocity.x *= this.friction;
    self.velocity.y *= this.friction;
    self.boundaries();
  });

  this.on('draw', function(c){
    c.save();
    c.fillStyle = self.color;

    var x_pos = self.position.x - this.camera.position.x;
    var y_pos = self.position.y - this.camera.position.y;

    //c.fillRect(x_pos, y_pos, self.size.x, self.size.y);

    var frame = (this.step >= 20) ? 0 : 1;
    if (this.direction && (this.direction.length > 0)) {
      this.assetLoader.drawSprite(c, this.anims[this.direction],
                                  x_pos, y_pos, frame);
    } else {
      this.assetLoader.drawSprite(c, this.anims["down"],
                                  x_pos, y_pos);
    }

    c.restore();
  });
}

inherits(Player, Entity);

Player.prototype.move = function(){
  this.position.x += this.velocity.x * this.friction;
  this.position.y += this.velocity.y * this.friction;

  if (this.direction && (this.direction.length > 0)) {
    var anim = this.anims[this.direction];
    anim.x = this.position.x;
    anim.y = this.position.y;
  }

  if (this.step == 40) {
    this.step = 0;
  }
};

Player.prototype.handleBlockers = function() {
  for (var blocker in this.blockers) {
    if (this.blockers[blocker]) {
      var b = this.blockers[blocker];
      var x_overlap, y_overlap;

      // TODO: more intelligently do this based on center of objects
      if (this.position.x <= (b.position.x + b.size.x) &&
          (((b.position.x + b.size.x) - this.position.x) < this.size.x)) {
        x_overlap = this.position.x - (b.position.x + b.size.x);
        this.position.x -= x_overlap - 1;
        if (this.velocity.x < 0) {
          this.velocity.x = 0;
        }
      } else if ((this.position.x + this.size.y) >= b.position.x) {
        x_overlap = (this.position.x + this.size.x) - b.position.x;
        this.position.x -= x_overlap + 2;
        if (this.velocity.x < 0) {
          this.velocity.x = 0;
        }
      }
    }
  };
};

Player.prototype.addBlocker = function(blocker) {
  this.blockers[blocker.uid] = blocker;
}

Player.prototype.removeBlocker = function(blocker) {
  this.blockers[blocker.uid] = false;
}

Player.prototype.boundaries = function(){
  if (this.position.x <= 0){
    this.position.x = 0;
  }

  if (this.position.x >= this.camera.map.width - this.size.x){
    this.position.x = this.camera.map.width - this.size.x;
  }

  if (this.position.y <= 0){
    this.position.y = 0;
  }

  if (this.position.y >= this.camera.map.height - this.size.y){
    this.position.y = this.camera.map.height - this.size.y;
  }
};

Player.prototype.input = function(){
  if (this.can_move) {
    if ('W' in this.keysDown){
      this.velocity.y -= this.speed;
      this.direction = "up";
      this.step += 1;
    }

    if ('S' in this.keysDown){
      this.velocity.y += this.speed;
      this.direction = "down";
      this.step += 1;
    }

    if ('A' in this.keysDown){
      this.velocity.x -= this.speed;
      this.direction = "left";
      this.step += 1;
    }

    if ('D' in this.keysDown){
      this.velocity.x += this.speed;
      this.direction = "right";
      this.step += 1;
    }
  }
};

Player.prototype.workingMessageFunc = function(menu) {
  var str = "<p>Money earned: " + menu.timer.toString() + "</p><p>Time remaining: " + (menu.close_timeout - menu.timer).toString() + "</p>";
  return str;
};

Player.prototype.goToWork = function() {
  var menu = new Menu({
    game: this.game,
    name: "working",
    window: document.getElementById("dialog"),
    message: "You are at work.",
    close_timeout: 5,
    modal: true,
    timer_message: this.workingMessageFunc
  });
  menu.opened = true;
  menu.open();
  this.wallet.add(5);
}

},{"./asset_loader":4,"./menu":12,"./util/math":30,"crtrdg-entity":15,"inherits":27}],30:[function(require,module,exports){
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomRGBA(rmin, rmax, gmin, gmax, bmin, bmax, alpha){
  var r = randomInt(rmin, rmax);
  var g = randomInt(gmin, gmax);
  var b = randomInt(bmin, bmax);
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

function randomGray(min, max){
  var num = randomInt(min, max);
  return 'rgb(' + num + ', ' + num + ', ' + num + ')';
}

function randomGrayAlpha(min, max, alpha){
  var num = randomInt(min, max);
  return 'rgb(' + num + ', ' + num + ', ' + num + ', ' + alpha + ')';
}

function randomRGB(rmin, rmax, gmin, gmax, bmin, bmax){
  var r = randomInt(rmin, rmax);
  var g = randomInt(gmin, gmax);
  var b = randomInt(bmin, bmax);
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

module.exports = {
  randomInt: randomInt,
  randomRGB: randomRGB,
  randomRGBA: randomRGBA,
  randomGray: randomGray,
  randomGrayAlpha: randomGray
};
},{}],31:[function(require,module,exports){
var inherits = require('inherits');

module.exports = Wallet;

function Wallet(game, options) {
  this.game = game;
  this.cash = 100;
  this.createHTML();
  this.meter = options.meter
}

Wallet.prototype.createHTML = function(){
  this.el = document.createElement('div');
  this.el.id = 'wallet';
  this.el.innerHTML = '$' + this.cash;

  document.body.appendChild(this.el);
};

Wallet.prototype.add = function(amount){
  this.cash += amount;
  this.draw();
  this.meter.add(amount);
}

Wallet.prototype.remove = function(amount){
  this.cash -= amount;
  this.draw();
  this.meter.remove(amount);
}

Wallet.prototype.changeEvent = function(type, amount) {
  if (type == "remove") {
    this.cash -= amount;
  } else if (type == "add") {
    this.cash += amount;
  }
  this.draw();
}

Wallet.prototype.draw = function() {
  this.el.innerHTML = '$' + this.cash;
}

},{"inherits":27}]},{},[6])
;