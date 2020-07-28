export default function outerDecorator(duration) {
  return function innerDecorator(target, key, descriptor) {
    return {
      configurable: true,
      enumerable: descriptor.enumerable,
      get: function getter() {
        // Attach this function to the instance (not the class)
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: descriptor.enumerable,
          value: throttle(descriptor.value, duration)
        });

        return this[key];
      }
    };
  };
}

/** throttles the specified function and returns a wrapper function */
export function throttle(method, duration) {
  let timeoutId;
  let execAfterTimeout = false;

  function throttleWrapper(...args) {
    if (timeoutId) {
      execAfterTimeout = true;
      return;
    }

    function delay() {
      timeoutId = null;

      if (execAfterTimeout) {
        execAfterTimeout = false;
        method.apply(this, args);

        timeoutId = setTimeout(delay, duration);
      }
    }

    timeoutId = setTimeout(delay, duration);
    method.apply(this, args);
  }

  return throttleWrapper;
}