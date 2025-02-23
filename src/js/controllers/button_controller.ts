import { Controller } from "@hotwired/stimulus";
import { gsap } from "gsap";
import { wrapWordsInSpan } from "../lib/utils";

export default class extends Controller {
  static targets = ["text"];
  private words!: Array<HTMLSpanElement>;
  private animating: boolean = false;

  declare readonly textTarget: HTMLSpanElement;

  connect(): void {
    this.words = wrapWordsInSpan(this.textTarget);
  }

  hover() {
    if (this.animating) return;
    this.animating = true;
    gsap
      .timeline({
        onComplete: () => {
          this.animating = false;
        },
      })
      .to(this.words, {
        yPercent: 100,
        duration: 1,
        ease: "elastic.out(1, 0.6)",
        stagger: 0.08,
      })
      .set(this.words, {
        yPercent: 0,
      });
  }
}
