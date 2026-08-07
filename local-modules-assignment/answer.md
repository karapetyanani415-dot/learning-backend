# CommonJS and ES Modules – Answers

## 1. What would happen if you wrote `exports = { add, subtract, multiply }` instead of attaching each function to `exports` individually?

`require()` always returns the value of `module.exports`. At the beginning of a CommonJS module, `exports` is simply a reference to `module.exports`. If you assign a new object to `exports`, you only change the local variable and break its connection with `module.exports`. As a result, `module.exports` remains unchanged (typically an empty object), so `require()` will return an empty object instead of the exported functions.

---

## 2. Why does `utils/strings.js` use `module.exports = ...` while `utils/math.js` uses `exports.xxx = ...`? Could `math.js` have been written using `module.exports` instead? What would change when importing it?

`module.exports` is used when replacing the entire exported object with a new value, while `exports.xxx = ...` is used to add properties to the existing exported object. Both approaches are valid because `exports` initially references `module.exports`.

Yes, `math.js` could also have been written using `module.exports`, for example:

```js
module.exports = {
  add,
  subtract,
  multiply
};
```

As long as the exported object has the same structure, nothing would change on the importing side. `require()` would still return the same object containing the exported functions.

---

## 3. Why does ES Modules require the exact file extension in `import './utils/math.js'`, while CommonJS works with `require('./utils/math')`?

CommonJS uses Node.js's legacy module resolution algorithm. When `require('./utils/math')` is called, Node automatically searches for several possible files, such as:

* `./utils/math.js`
* `./utils/math.json`
* `./utils/math.node`
* `./utils/math/index.js`

ES Modules follow the ECMAScript module specification, which treats module specifiers more like URLs than file system paths. Because of this, the import path must match the file exactly, including its extension.

---

## 4. Name one thing ES Modules can do that CommonJS cannot, and explain why the difference exists.

CJS works synchronously, while ESM is asynchronous. Since the entire module system in CJS is built around synchronous loading, it is not possible to pause in the middle of code execution and wait for an asynchronous operation without blocking the whole process.
