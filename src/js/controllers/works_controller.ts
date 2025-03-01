import { Controller } from "@hotwired/stimulus";
import { gsap } from "gsap";

export default class extends Controller {
  static targets = ["info", "overlay", "content"];

  private setY!: gsap.QuickToFunc;
  private setX!: gsap.QuickToFunc;
  private overlayAnimationDuration = 0.4;
  private overlayTextAnimation!: gsap.core.Tween;

  declare readonly infoTarget: HTMLDivElement;
  declare readonly overlayTarget: HTMLDivElement;
  declare readonly contentTarget: HTMLDivElement;

  connect() {
    this.setY = gsap.quickTo(this.overlayTarget, "y", {
      duration: this.overlayAnimationDuration,
      ease: "power1",
    });
    this.setX = gsap.quickTo(this.overlayTarget, "x", {
      duration: this.overlayAnimationDuration,
      ease: "power1",
    });

    this.overlayTextAnimation = this.animateOverlayText();
  }

  enter() {
    gsap.to(this.contentTarget, {
      scale: 0.9,
    });

    gsap.to(this.infoTarget, {
      opacity: 0,
      scale: 1.025,
    });

    gsap.to(this.overlayTarget, {
      scale: 1,
      duration: 0.5,
      ease: "power1",
    });

    this.overlayTextAnimation.play();
  }

  leave() {
    gsap.killTweensOf(this.overlayTarget, "scale");

    gsap.to(this.contentTarget, {
      scale: 1,
    });

    gsap.to(this.infoTarget, {
      opacity: 1,
      scale: 1,
    });

    gsap.to(this.overlayTarget, {
      scale: 0,
      duration: 0.3,
      ease: "power1",
    });

    this.setY(0);
    this.setX(0);

    this.overlayTextAnimation.pause();
  }

  move(e: MouseEvent) {
    const { left, top, width, height } = this.element.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = (e.clientX - centerX) / 2;
    const distanceY = (e.clientY - centerY) / 2;

    this.setY(distanceY);
    this.setX(distanceX);
  }
  animateOverlayText(): gsap.core.Tween {
    const textTarget =
      this.overlayTarget.querySelector<HTMLSpanElement>("span");

    return gsap.to(textTarget, {
      xPercent: -25, // Start at -50% to center the first text
      duration: 3, // Adjust duration for desired speed
      repeat: -1, // Infinite repeat
      ease: "linear",
      paused: true,
    });
  }
}
