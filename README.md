# Promise.js
> 基于Promise/A+规范的Promise实现

**An open standard for sound, interoperable JavaScript promises—by implementers, for implementers.**

Promise表示异步操作的最终结果。与之进行交互的主要方式是通过`then`方法，该方法通过注册回调以接收promise的最终值或promise未完成的原因。

本规范详细描述了`then`方法的执行过程，提供了一个可互操作的基础，所有遵循`Promises/A+`规范的promise实现都可以依赖于它来提供。因此，规范应该被认为是非常稳定的。尽管`Promise/A+`组织有时可能会修订本规范，但主要是为了处理一些特殊的边界情况，且这些改动都是微小且向下兼容的，只有经过仔细考虑、讨论和测试之后，我们才会进行大的或向后不兼容的更改。

从历史上看，`Promises/A+`明确了早期`Promises/A`提案的行为条款，一方面扩展了原有规范约定俗成的行为，一方面删减了原规范的一些未指明的情况和有问题的部分。

最后，核心的`Promises/A+`规范不涉及如何创建、解决和拒绝 promise，而是专注于提供一个可交互的`then`方法。上述对于 promises 的操作方法将来在其他规范中可能会提及。

# 1.术语
1.1“promise” 是一个拥有`then`方法的对象或函数，其行为符合本规范。
1.2“thenable” 是一个定义了`then`方法的对象或函数。
1.3“value” 是任意合法的Javascript值，（包括undefined,thenable, promise）。
1.4“exception”是使用throw语句抛出的值。
1.5“reason”是表示promise为什么被rejected的值。

# 2.要求
## 2.1 Promise状态
一个promise必须处于三种状态之一： 等待态（pending）， 完成态（fulfilled），拒绝态（rejected）
### 2.1.1 当promise处于等待状态（pending）时：
1. 2.1.1.1 promise可以转为fulfilled或rejected状态。

### 2.1.2 当promise处于完成状态（fulfilled）时：
1. 2.1.2.1 promise不能转为任何其他状态。
2. 2.1.2.2 必须有一个值，且此值不能改变。

### 2.1.3 当promise处于拒绝状态（rejected）时:
1. 2.1.3.1 promise不能转为任何其他状态。
2. 2.1.3.2 必须有一个原因（reason），且此原因不能改变。

## 2.2 then方法
promise必须提供一个then方法来获取它当前或最终的值或者原因。
promise的then方法接收两个参数：
```
promise.then(onFulfilled, onRejected)
```

### 2.2.1 onFulfilled和onRejected都是可选的参数：
1. 2.2.1.1 如果 onFulfilled不是函数，必须忽略。
2. 2.2.1.1 如果 onRejected不是函数，必须忽略。

### 2.2.2 如果onFulfilled是函数:
1. 2.2.2.1 此函数必须在promise完成(fulfilled)后被调用,并把promise的值作为它的第一个参数。
2. 2.2.2.2 此函数在promise完成(fulfilled)之前不可被调用。
2. 2.2.2.3 此函数不可被调用超过一次。

### 2.2.3 如果onRejected是函数:

1. 2.2.2.1 此函数必须在promise拒绝(rejected)后被调用,并把promise 的reason作为它的第一个参数。
2. 2.2.2.2 此函数在promise拒绝(rejected)之前不可被调用。
3. 2.2.2.2 此函数不可被调用超过一次。

### 2.2.4 onFulfilled 和 onRejected 只有在[execution context](https://es5.github.io/#x10.3 "execution context")堆栈仅包含平台代码时才可被调用

### 2.2.5 onFulfilled和onRejected必须被作为函数调用（即没有 this 值）

### 2.2.6 then方法可以在同一个promise里被多次调用
1. 2.2.6.1 当promise完成执行（fulfilled），所有onFulfilled回调必须根据then方法的注册顺序来调用。
2. 2.2.6.2 当promise被拒绝（rejected），所有onRejected回调必须根据then方法的注册顺序来调用。

### 2.2.7 then方法必须返回一个promise对象
```
promise2 = promise1.then(onFulfilled, onRejected);
```
1. 2.2.7.1 如果onFulfilled或onRejected返回一个值x, 运行 Promise Resolution Procedure [[Resolve]](promise2, x)
2. 2.2.7.2 如果onFulfilled或onRejected抛出一个异常e,promise2 必须被拒绝（rejected）并把e当作原因
3. 2.2.7.3 如果onFulfilled不是一个函数并且promise1已经完成（fulfilled）, promise2 必须成功执行并返回相同的值
4. 2.2.7.4 如果onRejected不是一个函数并且promise1已经被拒绝（rejected）, promise2 必须拒绝执行并返回相同的据因

## 2.3 Promise解决程序
`Promise解决程序`是一个抽象的操作，其需输入一个 promise 和一个值，我们表示为 [[Resolve]](promise, x)，如果 x 有 then 方法且看上去像一个 Promise ，解决程序即尝试使 promise 接受 x 的状态；否则其用`x`的值来成功执行 promise 。

运行 [[Resolve]](promise, x) 需遵循以下步骤：

### 2.3.1 如果promise和x引用同一个对象，则用TypeError作为原因拒绝（reject）promise。
### 2.3.2 如果x是一个promise,采用promise的状态
1. 2.3.2.1如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
2. 2.3.2.2如果 x 处于执行态，用相同的值执行 promise
3. 2.3.2.3如果 x 处于拒绝态，用相同的原因拒绝 promise

### 2.3.3 如果x是个对象或者方法
1. 2.3.3.1把 x.then 赋值给 then
2. 2.3.3.2如果取 x.then 的值时抛出错误 e ，则以 e 为原因拒绝 promise
3. 2.3.3.3如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
	1. 2.3.3.3.1  如果/当 resolvePromise被一个值y调用，运行 [[Resolve]](promise, y)
	2. 2.3.3.3.2  如果/当 rejectPromise被一个原因r调用，用r拒绝（reject）promise
	3. 2.3.3.3.3  如果resolvePromise和 rejectPromise都被调用，或者对同一个参数进行多次调用，第一次调用执行，任何进一步的调用都被忽略
	4. 2.3.3.3.4  如果调用then抛出一个异常e,
		1. 2.3.3.3.4.1 如果resolvePromise或 rejectPromise已被调用，忽略。
		2. 2.3.3.3.4.2 或者， 用e作为reason拒绝（reject）promise
4. 2.3.3.4 如果then不是一个函数，用x完成(fulfill)promise

### 2.3.4 如果 x既不是对象也不是函数，用x完成(fulfill)promise
如果一个 promise 被一个循环的 thenable 链中的对象解决，而 [[Resolve]](promise, thenable) 的递归性质又使得其被再次调用，根据上述的算法将会陷入无限递归之中。算法虽不强制要求，但也鼓励施者检测这样的递归是否存在，若检测到存在则以一个信息性的`TypeError`作为原因拒绝Promise

# 3.注释
1. 3.1 这里的平台代码指的是引擎、环境以及 promise 的执行代码。实践中要确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。这个事件队列可以采用“宏任务（macro-task）”机制或者“微任务（micro-task）”机制来实现。由于 promise 的执行代码本身就是平台代码，故代码自身在处理程序时可能已经包含一个任务调度队列。
2. 3.2 也就是说在严格模式（strict）中，函数 this 的值为 undefined ；在非严格模式中其为全局对象。
3. 3.3 代码实现在满足所有要求的情况下可以允许 promise2 === promise1 。每个实现都要文档说明其是否允许以及在何种条件下允许 promise2 === promise1 。
4. 3.4 总体来说，如果 x 符合当前实现，我们才认为它是真正的 promise 。这一规则允许那些特例实现接受符合已知要求的 Promises 状态。
5. 3.5 这步我们先是存储了一个指向 x.then 的引用，然后测试并调用该引用，以避免多次访问 x.then 属性。这种预防措施确保了该属性的一致性，因为其值可能在检索调用时被改变。
6. 3.6 实现不应该对 thenable 链的深度设限，并假定超出本限制的递归就是无限循环。只有真正的循环递归才应能导致 TypeError 异常；如果一条无限长的链上 thenable 均不相同，那么递归下去永远是正确的行为。