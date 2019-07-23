/**
 * Promise实现 遵循promise/A+规范
 * @see https://promisesaplus.com/
 */

var PENDING = 'pending';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';

function Promise(executor) {
  var that = this;

  // 初始状态
  that.status = PENDING;
  // fulfilled状态时 返回的值
  that.value = undefined;
  // rejected状态时 拒绝的原因
  this.reason = undefined;
  // 存储fulfilled状态对应的onFulfilled函数
  this.onFulfilledFns = [];
  // 存储rejected状态对应的onRejected函数
  this.onRejectedFns = [];

  function resolve(value) {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }

    if (that.status === PENDING) {
      that.status = FULFILLED;
      that.value = value;
      that.onFulfilledFns.forEach(function(cb) {
        cb(that.value);
      });
    }
  }

  function reject(reason) {
    if (that.status === PENDING) {
      that.status = REJECTED;
      that.reason = reason;
      that.onRejectedFns.forEach(function(cb) {
        cb(that.reason);
      });
    }
  }

  // 捕获在excutor执行器中抛出的异常
  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

/**
 * 2.2 Promise必须提供一个then方法来获取它当前的值或者拒绝原因
 * 2.2.1 onFulfilled和onRejected都是可选的参数
 * 
 * 
 */
Promise.prototype.then = function (onFulfilled, onRejected) {
  /**
   * 2.2.2 如果onFulfilled是函数:
   * 2.2.2.1 此函数必须在promise成功(fulfilled)后被调用,并把promise的value作为它的第一个参数。
   * 2.2.2.2 此函数在promise成功(fulfilled)之前不可被调用。
   * 2.2.2.3 此函数不可被调用超过一次。
   */
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;

  /**
   * 2.2.3 如果onRejected是函数:
   * 2.2.3.1 此函数必须在promise拒绝(rejected)后被调用,并把promise的reason作为它的第一个参数。
   * 2.2.3.2 此函数在promise拒绝(rejected)之前不可被调用。
   * 2.2.3.3 此函数不可被调用超过一次。
   */
  onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason};
  
  var that = this;
  var promise2 = null;

  /**
   * 2.2.7 then方法必须返回一个promise对象
   * `promise2 = promise1.then(onFulfilled, onRejected);`
   * 2.2.7.1 如果onFulfilled或onRejected返回一个值x，运行 Promise Resolution Procedure [[Resolve]](promise2, x)
   * 2.2.7.2 如果onFulfilled或onRejected抛出一个异常e，promise2 必须被拒绝（rejected）并把e当作reason
   * 2.2.7.3 如果onFulfilled不是一个函数并且promise1已经完成（fulfilled）, promise2 必须成功执行并返回相同的value
   * 2.2.7.4 如果onRejected不是一个函数并且promise1已经被拒绝（rejected）, promise2 必须拒绝执行并返回相同的reason
   * 
   */
  // 等待态
  if(that.status === PENDING) {
    return promise2 = new Promise(function(resolve, reject) {
      that.onFulfilledFns.push(function(value) {
        setTimeout(function(){
          try {
            var x = onFulfilled(value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        
      });

      that.onRejectedFns.push(function(reason) {
        setTimeout(function(){
          try {
            var x = onRejected(reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        
      });
    });
  }

  // 成功态
  if(that.status === FULFILLED) {
    return promise2 = new Promise(function(resolve, reject) {
      setTimeout(function(){
        try {
          var x = onFulfilled(that.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      });
    });
  }

  // 失败态
  if(that.status == REJECTED) {
    return promise2 = new Promise(function(resolve, reject) {
      setTimeout(function(){
        try {
          var x = onRejected(this.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch(e) {
          reject(e);
        };
      })
    });
  }
}

Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
}

Promise.prototype.finally = function () {

}

Promise.resolve = function (value) {
  return new Promise(function(resolve) {
    resolve(value);
  });
}

Promise.reject = function (reason) {
  return new Promise(function(resolve, reject) {
    reject(reason);
  });
}

/**
 * Promise.all(iterable) 方法返回一个 Promise 实例，
 * 此实例在 iterable 参数内所有的 promise 都“完成（resolved）”或参数中不包含 promise 时回调完成（resolve）；
 * 如果参数中 promise 有一个失败（rejected），此实例回调失败（reject），失败原因的是第一个失败 promise 的结果。
 * 
 */
Promise.all = function (iterable) {
  iterable = Array.from(iterable);

  var result = [];
  var l = iterable.length;
  var n = l;

  return new Promise(function(resolve, reject) {
    for(let i = 0; i < l; i++) {
      var promise = iterable[i];
      if(!(promise instanceof Promise)) {
        promise = new Promise(function(resolve) {
          resolve(promise);
        });
      }

      promise.then(function(value) {
        result[i] = value;

        if(--n == 0) {
          resolve(result);
        }
      }, function(reason) {
        reject(reason);
      });
    }
  });
}

/**
 * Promise.race(iterable) 方法返回一个 promise，
 * 一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。
 * 
 * @param  {Iterable} iterable
 * @return {Promise}
 */
Promise.race = function (iterable) {
  iterable = Array.from(iterable);

  var l = iterable.length;

  return new Promise(function(resolve, reject) {
    for(let i = 0; i < l; i++) {
      var promise = iterable[i];
      if(!(promise instanceof Promise)) {
        promise = new Promise(function(resolve) {
          resolve(promise);
        });
      }

      promise.then(function(value) {
        resolve(value);
      }, function(reason) {
        reject(reason);
      });
    }
  });
}

/**
 * 2.3 The Promise Resolution Procedure
 * 
 * 2.3.1 如果promise和x引用同一个对象，则用TypeError作为原因拒绝（reject）promise。
 */
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    // 如果从onFulfilled中返回的x 就是promise2 就会导致循环引用报错
    reject(new TypeError('Circular reference'));
  }

  var called = false;

  /**
   * 2.3.2 如果x是一个promise,采用promise的状态
   * 2.3.2.1如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
   * 2.3.2.2如果 x 处于执行态，用相同的值执行 promise
   * 2.3.2.3如果 x 处于拒绝态，用相同的原因拒绝 promise
   */
  if (x instanceof Promise) {
    if (x.status === PENDING) {
      x.then(y => {
        resolvePromise(promise2, y, resolve, reject);
      }, reason => {
        reject(reason);
      });
    } else {
      x.then(resolve, reject);
    }
  } 
  /**
   * 2.3.3 如果x是个对象或者方法
   * 2.3.3.1把x.then赋值给then
   * 2.3.3.2如果取 x.then 的值时抛出错误 e ，则以 e 为原因拒绝 promise
   * 2.3.3.3如果 then 是函数，将x作为函数的作用域this调用之。传递两个回调函数作为参数，
   * 第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
   * 2.3.3.3.1 如果/当 resolvePromise被一个值y调用，运行 [[Resolve]](promise2, y)
   * 2.3.3.3.2 如果/当 rejectPromise被一个原因r调用，用r拒绝（reject）promise
   * 2.3.3.3.3 如果resolvePromise和 rejectPromise都被调用，
   * 或者对同一个参数进行多次调用，第一次调用执行，任何进一步的调用都被忽略
   * 2.3.3.3.4 如果调用then抛出一个异常e
   * 2.3.3.3.4.1 如果resolvePromise或 rejectPromise已被调用，忽略。
   * 2.3.3.3.4.2 或者， 用e作为reason拒绝（reject）promise
   * 2.3.3.4 如果then不是一个函数，用x完成(fulfill)promise
   */
  else if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x, function(y) {
          if(called) {
            return;
          }
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, function(reason) {
          if(called) {
            return;
          }
          called = true;
          reject(reason);
        })
      } else {
        resolve(x);
      }
    } catch(e) {
      if(called) {
        return;
      }
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}