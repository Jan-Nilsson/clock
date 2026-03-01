import Alarm from "./Alarm.js";
import Clock from "./Clock.js";
import Stopwatch from "./Stopwatch.js";
import Timer from "./Timer.js";
import Tab from "./Commons.js";

customElements.define("x-alarm", Alarm);
customElements.define("x-clock", Clock);
customElements.define("x-stopwatch", Stopwatch);
customElements.define("x-timer", Timer);
customElements.define("x-tab", Tab);

document.addEventListener("ring", () => {
  const audio = new Audio("/audio/alarm-sound.mp3");
  audio.play(); 
});