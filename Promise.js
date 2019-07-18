/**
 * Promise实现 遵循promise/A+规范
 * 
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
      this.reason = reason;
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

Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason};
  
  var that = this;
  var promise2 = null;

  // 等待态
  if(that.status === PENDING) {
    return promise2 = new Promise(function(resolve, reject) {
      that.onFulfilledFns.push(function(value) {
        try {
          var x = onFulfilled(that.value);
        } catch (e) {
          reject(e);
        }
      });

      that.onRejectedFns.push(function(reason) {
        try {
          var x = onRejected(that.reason);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  // 成功态
  if(that.status === FULFILLED) {
    return promise2 = new Promise(function(resolve, reject) {
      try {
        var x = onFulfilled(that.value);
      } catch(e) {
        reject(e);
      }
    });
  }

  // 失败态
  if(that.status == REJECTED) {
    return promise2 = new Promise(function(resolve, reject) {
      try {
        var x = onRejected(this.reason);
      } catch(e) {
        reject(e);
      }
    });
  }
}

Promise.prototype.catch = function () {

}

Promise.prototype.finally = function () {

}