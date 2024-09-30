class Lock {
  constructor() {
    this.promise = Promise.resolve();
  }

  acquire() {
    let release;
    const newPromise = new Promise((resolve) => (release = resolve));
    const acquired = this.promise.then(() => release);
    this.promise = newPromise;
    return acquired;
  }
}

const lock = new Lock();

module.exports = lock;
