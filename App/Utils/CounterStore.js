import { action, observable, makeObservable } from "mobx";

class CounterStore {
  @observable listofCounter = [];
  @observable counter = 0;

  constructor() {
    makeObservable(this);
  }

  @action
  push(a) {
    this.listofCounter.push(a);
  }

  @action
  incrementList(pos) {
    this.listofCounter[pos] = this.listofCounter[pos] + 1;
  }

  @action
  decrementList(pos) {
    if (this.listofCounter[pos] > 0)
      this.listofCounter[pos]--;
  }

  @action
  setText(pos, val) {
    this.listofCounter[pos] = Number(val);
  }

  @action
  increment() {
    this.counter++;
  }

  @action
  decrement() {
    this.counter--;
  }
}

export default new CounterStore();