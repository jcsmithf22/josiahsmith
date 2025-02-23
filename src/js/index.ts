import { Application } from "@hotwired/stimulus";

import button_controller from "./controllers/button_controller.ts";
import works_controller from "./controllers/works_controller.ts";

declare global {
  interface Window {
    Stimulus: Application;
  }
}

window.Stimulus = Application.start();
window.Stimulus.register("button", button_controller);
window.Stimulus.register("works", works_controller);
