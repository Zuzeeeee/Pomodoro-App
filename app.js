import {publish, subscribe} from "./pubsub.js";

const bells = new Audio('./sounds/bells.wav');

const $clockTemplate = (minutes) => `
  <div class="container">
    <p id="stage"></p>
    <div class="app-counter-box">
      <p id="minutes" work="25" class="minutes">${minutes}:00</p>
    </div>
    <button id="btn-start" class="btn-start">start</button>
    <button id="btn-reset" class="btn-reset">reset</button>
  </div>
`;

const $inputTemplate = `
  <div class="container">
    <label>Work<input type="number" min="1" id="inp-work" value="25"></label>
    <label>Rest<input type="number" min="1" id="inp-rest" value="5"></label>
  <div>
`;

//TODO: Add a pubsub component to deal with the data
class PomodoroClock extends HTMLElement {
  constructor() {
    super();

    let work = localStorage.getItem("changeWork");
    let rest = localStorage.getItem("changeRest");
    if (work) {
      this.setAttribute("work", work);
    }

    if (rest) {
      this.setAttribute("rest", rest);
    }

    this.work = this.getAttribute("work") ?? 25;
    this.rest = this.getAttribute("rest") ?? 5;

    this.innerHTML = $clockTemplate(this.work);

    this.$stage = this.querySelector("#stage");
    this.$session = this.querySelector("#minutes");
    this.$startButton = this.querySelector('#btn-start');
    this.$resetButton = this.querySelector('#btn-reset');
  }
  
  connectedCallback() {
    this.stage = localStorage.getItem("stage") ? localStorage.getItem("stage") : "work";
    const defaultTime = this.stage == "work" ? this.work * 60 : this.rest * 60;

    this.$stage.innerText = this.stage;

    this.totalSeconds = localStorage.getItem("remainingTime") ? localStorage.getItem("remainingTime") : defaultTime;

    subscribe("changeWork", (value) => {this.onNotify("work",value)})
    subscribe("changeRest", (value) => {this.onNotify("rest",value)})
    
    this.$startButton.addEventListener('click', (e) => {e.preventDefault(); this.appTimer();});
    this.$resetButton.addEventListener('click', (e) => {e.preventDefault(); this.resetTimer();});

    this.update();
  }

  onNotify = (att, value) => {
    this.setAttribute(att, value);

    this.work = this.getAttribute("work");
    this.rest = this.getAttribute("rest");

    if (this.stage == att) {
      this.resetTimer();
    }
  }
  
  appTimer() {
    if (this.stage == "work" && this.totalSeconds <= 0) {
      this.resetTimer();
      return;
    } else if ( this.stage == "rest" && this.totalSeconds <= 0) {
      console.log("oi");
      this.resetTimer();
      return;
    }


    if(!this.state) {
      this.state = true;
      
      this.myInterval = setInterval(this.updateSeconds, 1000);
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

    localStorage.setItem("remainingTime", this.totalSeconds);
    localStorage.setItem("stage", this.stage);

    this.update();
  }
  
  updateSeconds = () => {
    this.totalSeconds--;

    localStorage.setItem("remainingTime", this.totalSeconds);

    this.update(); 
  }
  
  update = () => {
    let minutesLeft = Math.floor(this.totalSeconds/60);
    let secondsLeft = this.totalSeconds % 60;
    this.$session.innerHTML = `${`0${minutesLeft}`.slice(-2)}:${`0${secondsLeft}`.slice(-2)}`;
    this.$startButton.innerHTML = !this.state ? "start" : "pause";

    if(minutesLeft === 0 && secondsLeft === 0) {
      bells.play();
      clearInterval(this.myInterval);
      this.stage = this.stage === "work" ? "rest" : "work";
      this.$startButton.innerHTML = "start " + this.stage;
      this.$stage.innerText = this.stage;

      localStorage.setItem("remainingTime", this.totalSeconds);
    }
  }
}

class PomodoroInput extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = $inputTemplate;

    this.$workInput = this.querySelector("#inp-work");
    this.$restInput = this.querySelector("#inp-rest");
  }

  connectedCallback() {
    this.workValue = localStorage.getItem("changeWork") ?? 25;
    this.restValue = localStorage.getItem("changeRest") ?? 5;

    this.$workInput.value = this.workValue;
    this.$restInput.value = this.restValue;

    this.$workInput.addEventListener("change", (ev) => publish("changeWork", ev.target.value));
    this.$restInput.addEventListener("change", (ev) => publish("changeRest", ev.target.value));
  }
}

customElements.define("jn-pomodoro", PomodoroClock);
customElements.define("jn-pomoinput", PomodoroInput);
