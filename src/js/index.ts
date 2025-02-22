import { Application } from "@hotwired/stimulus";

import ButtonController from "./controllers/button_controller.ts";

declare global {
  interface Window {
    Stimulus: Application;
  }
}

window.Stimulus = Application.start();
window.Stimulus.register("button", ButtonController);
