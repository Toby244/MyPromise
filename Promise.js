//Promise的三个状态
const PENDING = "pending";  //准备阶段
const FULFILLED = "fulfilled";//完成阶段
const REJECTED = "rejected";//失败阶段

class Promise{
    constructor(executor) {  //函数executor作为参数，executor带有两个参数resolve, reject;resolve成功后回调函数，reject失败后回调函数
        this.state = PENDING;  //默认状态
        this.value = undefined; //执行成功后返回值
        this.reason = undefined;//执行失败原因

        this.onResolvedCallbacks = [];//执行成功后回调函数集合（因为可能先指定回调函数，再调用resolve改变状态）
        this.onRejectedCallbacks = [];//执行失败后回调函数集合（因为可能先指定回调函数，再调用reject改变状态）

        //成功函数(this指针指向当前对象)
        let resolve=(value)=>{
            if(value instanceof Promise) {
                return value.then(resolve, reject);
            }
            setTimeout(()=>{
                if (this.state===PENDING){
                    this.value=value;
                    this.state=FULFILLED;
                    this.onResolvedCallbacks.forEach(fn=>fn(this.value))
                }
            })
        };

        //失败函数(this指针指向当前对象)
        let reject=(reason)=>{
            setTimeout(()=>{
                if (this.state === PENDING) {
                    this.state = REJECTED;
                    this.reason = reason;
                    this.onRejectedCallbacks.forEach(fn => fn(this.reason))
                }
            })

        };

        try {
            executor(resolve, reject);  //调用executor函数(执行器函数会立即执行)
        } catch (err) {
            reject(err);
        }
    };

    /*
    *   then方法
    */
    then(onFulfilled,onRejected){
        // 如果then的两个回调不是函数或者不传做处理
        // 指定默认的成功回调函数，如果onFulfilled不是函数，就把 value => value 作为回调函数传给onFulfilled
        onFulfilled = typeof onFulfilled === 'function'?onFulfilled:value=>value;
        // 指定默认的失败回调函数，如果onRejected不是函数，就把err => {throw  err}作为回调函数传给onRejected
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };


        //then方法返回一个新的promise，这样支持链式调用
        //链式调用前提需要知道前一个回调函数的结果，作为下一个promise的参数
        //x为上一个then返回值,
        //* 上一个then, 1.抛出错误 或 2.返回失败promise，下一个then才走失败 (调用promise2的reject)
        // 否则都走成功（调用promise2的resolve）
        let newPromise=new Promise((resolve, reject) => {
            if (this.state === FULFILLED) { // 成功态
                setTimeout(() => {
                    try{
                        let x = onFulfilled(this.value);
                        resolvePromise(newPromise, x, resolve, reject);
                    } catch(e) {
                        reject(e); // 捕获前面onFulfilled中抛出的异常 then(onFulfilled, onRejected);
                    }
                });
            }

            if (this.state === REJECTED) { // 失败态
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason);
                        resolvePromise(newPromise, x, resolve, reject);
                    } catch(e) {
                        reject(e);
                    }
                });
            }

            if (this.state === PENDING) { // 等待态
                // 当异步调用resolve/rejected时 将onFulfilled/onRejected收集暂存到集合中
                this.onResolvedCallbacks.push((value) => {
                    try {
                        let x = onFulfilled(value);
                        resolvePromise(newPromise, x, resolve, reject);
                    } catch(e) {
                        reject(e);
                    }
                });
                this.onRejectedCallbacks.push((reason) => {
                    try {
                        let x = onRejected(reason);
                        resolvePromise(newPromise, x, resolve, reject);
                    } catch(e) {
                        reject(e);
                    }
                });
            }

        });
        return newPromise;
    };

    /*
     * catch方法
     * */
    catch(onRejected){
        return this.then(undefined, onRejected);
    }

    /*
    * resolve静态方法
    * */
    static resolve(value){
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }

    /*
    * reject静态方法
    * */
    static reject(reason){
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }

    /*
    * all静态方法
    * */
    static all(promises){
        const values = new Array(promises.length);
        let resolvedCount = 0;
        return new Promise((resolve, reject) => {
            promises.forEach((p, index) => {
                p.then(value => {
                        resolvedCount++;
                        values[index] = value;
                        if (resolvedCount === promises.length) {
                            resolve(values);
                        }
                    },
                    reason => {
                        reject(reason)
                    }

                )
            })
        })
    }

    /*
    * race静态方法
    * */
    static race(promises){
        return new Promise(function(resolve,reject){
            for(let i=0;i<promises.length;i++){
                promises[i].then(resolve,reject);
            }
        });
    }

    static deferred(){ //
        let defer = {};
        defer.promise = new Promise((resolve, reject) => {
            defer.resolve = resolve;
            defer.reject = reject;
        });
        return defer;
    }
}

let resolvePromise=(promise2, x, resolve, reject)=>{
    if (promise2 === x) {  // 如果从onFulfilled中返回的x 就是promise2 就会导致循环引用报错
        return reject(new TypeError(`Chaining cycle detected for promise #<Promise>`));
    }

    let called = false; // 避免多次调用
    // 如果x是一个promise对象 （该判断和下面 判断是不是thenable对象重复 所以可有可无）
    if (x instanceof Promise) { // 获得它的终值 继续resolve
        if (x.state === PENDING) { // 如果为等待态需等待直至 x 被执行或拒绝 并解析y值
            x.then(y => {
                resolvePromise(promise2, y, resolve, reject);
            }, reason => {
                reject(reason);
            });
        } else { // 如果 x 已经处于执行态/拒绝态(值已经被解析为普通值)，用相同的值执行传递下去 promise
            x.then(resolve, reject);
        }
        // 如果 x 为对象或者函数
    } else if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
        try { // 是否是thenable对象（具有then方法的对象/函数）
            let then = x.then;
            if (typeof then === 'function') {
                then.call(x, y => {
                    if(called) return;
                    called = true;
                    resolvePromise(promise2, y, resolve, reject);
                }, reason => {
                    if(called) return;
                    called = true;
                    reject(reason);
                })
            } else { // 说明是一个普通对象/函数
                resolve(x);
            }
        } catch(e) {
            if(called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}

try {
    module.exports = Promise
} catch (e) {
}