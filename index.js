import merge from 'lodash-es/merge';
import forOwn from 'lodash-es/forOwn';
import isObject from 'lodash-es/isObject';
import isFunction from 'lodash-es/isFunction';

const planes = new WeakMap();
const originals = new WeakMap();

// reIsUint: https://github.com/lodash/lodash/blob/master/.internal/isIndex.js
const rxIsIndex = /^(?:0|[1-9]\d*)$/;

function get(obj, path) {
  for (let i = 0; i < path.length; i++) {
    if (!isObject(obj)) {
      return undefined;
    }

    obj = obj[path[i]];
  }

  return obj;
}

function set(obj, path, val) {
  if (!isObject(obj)) {
    throw new Error('Cannot set property ' + path[0] + ' of not an object.');
  }

  for (let i = 0; i < path.length - 1; i++) {
    if (!isObject(obj[path[i]])) {
      obj[path[i]] = rxIsIndex.test(path[i + 1]) ? [] : {};
    }

    obj = obj[path[i]];
  }

  obj[path[path.length - 1]] = val;
}

class DeltaPlane {
  constructor(original, delta) {
    this.original = original;
    if (delta === undefined) {
      delta = Array.isArray(original) ? [] : {};
    }

    this.delta = delta;
  }

  getValue(val) {
    const v = planes.get(val);
    if (v !== undefined) {
      const delta = v.getDelta();
      const original = v.getOriginal();
      val = Array.isArray(delta || original) ? [] : {};
      val = merge(val, original, delta);
    }

    if (isObject(val)) {
      forOwn(val, (v, k) => {
        val[k] = this.getValue(v);
      });
    }

    return val;
  }

  getPlane(path = []) {
    var me = this;

    const plane = new Proxy(me.delta, {
      get(delta, prop) {
        const p = [...path, prop];

        let val = get(delta, p);
        if (val === undefined) {
          val = get(me.original, p);
        }

        if (!isObject(val) || isFunction(val)) {
          return val;
        }

        return me.getPlane(p);
      },
      set(delta, prop, val) {
        set(delta, [...path, prop], me.getValue(val));
      },
      has(target, prop) {
        const delta = get(me.delta, path);
        // if (delta && Object.hasOwnProperty(delta, prop)) {
        if (delta && isObject(delta) && prop in delta) {
          return true;
        }

        const original = get(me.original, path);
        //return (original && Object.hasOwnProperty(original, prop)) || false;
        return (original && isObject(original) && prop in original) || false;
      },
      deleteProperty(delta, prop) {
        const p = [...path, prop];
        const val = get(me.original, p);
        set(delta, [...path, prop], val === undefined ? undefined : null);
      },
      ownKeys() {
        const delta = get(me.delta, path);
        const deltaKeys = delta
          ? Array.isArray(delta)
            ? Object.keys(delta)
            : Object.getOwnPropertyNames(delta)
          : [];
        const original = get(me.original, path);
        const originalKeys = original
          ? Array.isArray(original)
            ? Object.keys(original)
            : Object.getOwnPropertyNames(original)
          : [];
        return [...deltaKeys, ...originalKeys].filter((v, i, a) => a.indexOf(v) === i);
      },
      getOwnPropertyDescriptor(target, prop) {
        const delta = get(me.delta, path);
        let descriptor =
          (isObject(delta) && Object.getOwnPropertyDescriptor(delta, prop)) || undefined;
        if (descriptor === undefined) {
          const original = get(me.original, path);
          descriptor =
            (isObject(original) && Object.getOwnPropertyDescriptor(original, prop)) || undefined;
        }

        return descriptor;
      },
      getPrototypeOf(target) {
        const source = get(me.delta, path) || get(me.original, path);
        return Object.getPrototypeOf(source);
      },
    });
    planes.set(plane, {
      getDelta: () => {
        return get(me.delta, path);
      },
      getOriginal: () => {
        return get(me.original, path);
      },
    });
    return plane;
  }

  getDelta() {
    return this.delta;
  }

  getOriginal() {
    return this.original;
  }
}

export default function obtain(original, delta) {
  let dp = originals.get(original);
  if (!dp) {
    dp = new DeltaPlane(original, delta);
    originals.set(original, dp);
  }

  return dp;
}
