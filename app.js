const bells = new Audio('./sounds/bells.wav');

const $clockTemplate = (minutes) => `
  <div class="container">
    <div class="app-counter-box">
      <p id="minutes" class="minutes">${minutes}:00</p>
    </div>
    <button id="btn-start" class="btn-start">start</button>
    <button id="btn-reset" class="btn-reset">reset</button>
  </div>
`;

const $inputTemplate = `
  <div class="container">
    <label>Work<input type="number" id="inp-work" value="25"></label>
    <label>Rest<input type="number" id="inp-rest" value="5"></label>
  <div>
`;

//TODO: Add a pubsub component to deal with the data
class PomodoroClock extends HTMLElement {
  constructor() {
    super();

    this.work = this.getAttribute("work");
    this.rest = this.getAttribute("rest");

    this.innerHTML = $clockTemplate(this.work);

    this.$session = this.querySelector("#minutes");
    this.$startButton = this.querySelector('#btn-start');
    this.$resetButton = this.querySelector('#btn-reset');
  }
  
  connectedCallback() {
    this.totalSeconds = localStorage.getItem("remainingTime") ? localStorage.getItem("remainingTime") : this.work * 60;
    
    this.$startButton.addEventListener('click', (e) => {e.preventDefault(); this.appTimer();});
    this.$resetButton.addEventListener('click', (e) => {e.preventDefault(); this.resetTimer();});

    this.update();
  }
  
  appTimer() {
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
    this.totalSeconds = this.work * 60;
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
    }
  }
}

class PomodoroInput extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = $inputTemplate;

    this.workInput = this.querySelector("#inp-work");
    this.restInput = this.querySelector("#inp-rest");

  }

  connectedCallback() {
    this.workInput.addEventListener("change", () => this.dispatchEvent("change"));
    this.restInput.addEventListener("change", () => this.dispatchEvent("change"));
  }
}

customElements.define("jn-pomodoro", PomodoroClock);
customElements.define("jn-pomoinput", PomodoroInput);
