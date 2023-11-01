import {save} from "./data.js";

let sub = {};

const TypeEvents = {
  CHANGE_WORK: "changeWork",
  CHANGE_REST: "changeRest",
  CHANGE_STAGE: "stage",
  TIME_LEFT: "remainingTime",
}

const publish = (ev, value) => {
  save(ev, value);
  
  sub[ev]?.forEach(notify => {
    notify(value);
  });
};

const subscribe = (ev, notify) => {
  if (sub[ev]) {
    sub[ev].push(notify);
  } else {
    sub[ev] = [notify];
  }
} 

export {TypeEvents, publish, subscribe};