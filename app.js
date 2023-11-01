import {TypeEvents, publish, subscribe} from "./pubsub.js";
import PomodoroClock from "./components/PomodoroClock.js";
import PomodoroInput from "./components/PomodoroInput.js";
import { fetchData } from "./data.js";


const COLOR_CODES = {
  info: {
    color: "#03A44E"
  }
};

let remainingPathColor = COLOR_CODES.info.color;

const $circleDash = document.querySelector("#base-timer-path-remaining");
$circleDash.style["color"] = remainingPathColor;

const updateCountdown = async () => {
  let timeLeft = await fetchData(TypeEvents.TIME_LEFT);
  let stage = await fetchData("stage");

  const per = ( timeLeft / ((stage === "work" ? await getWorkValue()??25 : await getRestValue()??5) * 60)) * 283;
  const circleDash = `${per.toFixed(0)} 283`;
  $circleDash.setAttribute("stroke-dasharray", circleDash);
};

const notifyChange = () => {
  updateCountdown();
}

const getWorkValue = async () => {
  return await fetchData(TypeEvents.CHANGE_WORK);
}

const getRestValue = async () => {
  return await fetchData(TypeEvents.CHANGE_REST);
}

subscribe(TypeEvents.CHANGE_WORK, notifyChange);
subscribe(TypeEvents.CHANGE_REST, notifyChange);
subscribe(TypeEvents.TIME_LEFT, notifyChange);

updateCountdown();
