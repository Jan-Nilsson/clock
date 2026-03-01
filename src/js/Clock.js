export default class Clock extends HTMLElement {
  #intervalCallback;
  #intervalId = 0;

  constructor() {
    super();
    this.#intervalCallback = () => {
      const time = this.querySelector("time");
      const date = new Date();
      time.dateTime = date.toISOString();
      time.textContent = date.toLocaleTimeString();

      let tz = this.querySelector(".timezone");
      if (!tz) {
        tz = document.createElement("div");
        tz.className = "timezone";
        time.after(tz);
      }
      tz.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    };
  }

  connectedCallback() {
    if (!this.#intervalId) {
      this.#intervalCallback();
      this.#intervalId = setInterval(this.#intervalCallback, 1000);
    }
  }

  disconnectedCallback() {
    clearInterval(this.#intervalId);
  }
}
