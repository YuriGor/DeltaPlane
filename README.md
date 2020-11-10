# DeltaPlane
Proxy to keep original data unchanged,
but read and write changes using additional layer - 'delta' object.

```
var o = { a:{b:{c:'original'}}, hello: 'world'};
var dp = new DeltaPlane(o);
var p = dp.getPlane();
// if not changed then read from original
console.log(p.a.b.c); // 'original'
console.log(p.hello); // 'world'
// collect all changes in separate 'delta' object
p.a.b.c = 1;
// read changed values from delta
console.log(p.a.b.c); // '1'
// not changed value is still there
console.log(p.hello); // 'world'
// delta will have only changes
console.log(dp.getDelta()); // { a:{b:{c:1}}};
console.log(o);// original object is still safe.
// use existing deltas
dp = new DeltaPlane(o, {hello:"hi"});
p = dp.getPlane();
console.log(p.hello)
```


