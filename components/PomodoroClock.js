import {TypeEvents, publish, subscribe} from ".././pubsub.js";
import { fetchData } from "../data.js";

const bells = new Audio('./sounds/bells.wav');


const $clockTemplate = (minutes) => `
  <div class="container base-timer__label">
    <p id="stage"></p>
    <div class="app-counter-box">
      <p id="minutes" work="25" class="minutes">${minutes}:00</p>
    </div>
    <button id="btn-start" class="btn-start">start</button>
    <button id="btn-reset" class="btn-reset">reset</button>
  </div>
`;

class PomodoroClock extends HTMLElement {
  constructor() {
    super();

    this.work = this.getAttribute("work") ?? 25;
    this.rest = this.getAttribute("rest") ?? 5;
    
    this.innerHTML = $clockTemplate(this.work);
    
    this.$stage = this.querySelector("#stage");
    this.$session = this.querySelector("#minutes");
    this.$startButton = this.querySelector('#btn-start');
    this.$resetButton = this.querySelector('#btn-reset');
  }
  
  async connectedCallback() {
    let work = await fetchData(TypeEvents.CHANGE_WORK);
    let rest = await fetchData(TypeEvents.CHANGE_REST);
    if (work) {
      this.setAttribute("work", work);
      this.work = work;
    }
  
    if (rest) {
      this.setAttribute("rest", rest);
      this.rest = rest;
    }

    let stage = await fetchData(TypeEvents.CHANGE_STAGE);
    this.stage = stage ? stage : "work";
    const defaultTime = this.stage == "work" ? this.work * 60 : this.rest * 60;

    this.$stage.innerText = this.stage;

    let timeLeft = await fetchData(TypeEvents.TIME_LEFT);
    this.totalSeconds = timeLeft ? timeLeft : defaultTime;

    subscribe(TypeEvents.CHANGE_WORK, (value) => {this.onNotify("work",value)})
    subscribe(TypeEvents.CHANGE_REST, (value) => {this.onNotify("rest",value)})
    
    this.$startButton.addEventListener('click', (e) => {e.preventDefault(); this.appTimer();});
    this.$resetButton.addEventListener('click', (e) => {e.preventDefault(); this.resetTimer();});

    this.update();
  }

  onNotify = (att, value) => {
    this.setAttribute(att, value);

    if (att === "work") {
      this.work = this.getAttribute("work");
    } else if (att === "rest") {
      this.rest = this.getAttribute("rest");
    }

    if (this.stage == att) {
      this.resetTimer();
    }
  }
  
  appTimer() {
    if (this.stage == "work" && this.totalSeconds <= 0) {
      this.resetTimer();
      return;
    } else if ( this.stage == "rest" && this.totalSeconds <= 0) {
      this.resetTimer();
      return;
    }


    if(!this.state) {
      this.state = true;

      this.lastDate = Date.now();
      
      this.myInterval = setInterval(this.updateSeconds, 300);
    } else {
      this.state = false;
      
      clearInterval(this.myInterval);
      this.update();
    }
  }

  resetTimer() {
    this.state = false;
    const defaultTime = this.stage === "work" ? this.work * 60 : this.rest * 60;
    this.totalSeconds = defaultTime;

    publish(TypeEvents.TIME_LEFT, this.totalSeconds);
    publish(TypeEvents.CHANGE_STAGE, this.stage);

    clearInterval(this.myInterval);

    this.update();
  }
  
  updateSeconds = () => {
    this.deltaTime = Date.now() - this.lastDate;
    this.totalSeconds -= this.deltaTime / 1000;
    
    this.lastDate = Date.now();

    publish(TypeEvents.TIME_LEFT, this.totalSeconds);

    this.update(); 
  }
  
  update = () => {
    this.$startButton.innerHTML = !this.state ? "start" : "pause";
    
    if(this.totalSeconds <= 0) {
      this.totalSeconds = 0;
      bells?.play();
      clearInterval(this.myInterval);
      this.stage = this.stage === "work" ? "rest" : "work";
      this.$startButton.innerHTML = "start " + this.stage;
      this.$stage.innerText = this.stage;  
    }

    let minutesLeft = Math.floor(this.totalSeconds/60);
    let secondsLeft = Math.floor(this.totalSeconds) % 60;

    publish(TypeEvents.TIME_LEFT, this.totalSeconds);
    this.$session.innerHTML = `${`0${minutesLeft}`.slice(-2)}:${`0${secondsLeft}`.slice(-2)}`;
  }
}

customElements.define("jn-pomodoro", PomodoroClock);
export default PomodoroClock;