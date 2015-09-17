export function allDone(done, promise, thenFn){
  promise.then((res) => {
    var newRez = thenFn(res);
    done();
    return newRez;
  },
  (rej) => {
    expect(rej.stack).toBe(NaN);
    done();
  });
}
