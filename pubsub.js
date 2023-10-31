const sub = {};

const publish = (ev, value) => {
  sub[ev]?.forEach(notify => {
    notify(value);
  });
  localStorage.setItem(ev, value);
};

const subscribe = (ev, notify) => {
  if (sub[ev]) {
    sub[ev].append(notify);
  } else {
    sub[ev] = [notify];
  }
} 

export {publish, subscribe};