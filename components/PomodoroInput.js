import {TypeEvents, publish, subscribe} from "../pubsub.js";
import { fetchData } from "../data.js";

const $inputTemplate = `
  <div class="container">
    <label>Work<input type="number" min="1" id="inp-work" value="25"></label>
    <label>Rest<input type="number" min="1" id="inp-rest" value="5"></label>
  <div>
`;

//TODO: Add a pubsub component to deal with the data


class PomodoroInput extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = $inputTemplate;

    this.$workInput = this.querySelector("#inp-work");
    this.$restInput = this.querySelector("#inp-rest");
  }

  async connectedCallback() {
    this.workValue = await fetchData(TypeEvents.CHANGE_WORK) ?? 25;
    this.restValue = await fetchData(TypeEvents.CHANGE_REST) ?? 5;

    this.$workInput.value = this.workValue;
    this.$restInput.value = this.restValue;

    this.$workInput.addEventListener("change", (ev) => publish(TypeEvents.CHANGE_WORK, ev.target.value));
    this.$restInput.addEventListener("change", (ev) => publish(TypeEvents.CHANGE_REST, ev.target.value));
  }
}

customElements.define("jn-pomoinput", PomodoroInput);
export default PomodoroInput;