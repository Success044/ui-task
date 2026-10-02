export const COURSE_TRANSITION_DURATION = 1.4;

export const COURSE_COPY_EASE = (progress: number) => {
  // Let the card's tiny pull-back carry the copy; do not amplify it with
  // backwards rotation or a second recoil along the text's longer travel path.
  if (progress <= 0.3) return 0;
  const t = (progress - 0.3) / 0.7;
  return t * t * t * (t * (6 * t - 15) + 10);
};

export const COURSE_TEXT_EASE = (progress: number) => {
  // Stacked-card text glides directly into place.
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches) {
    return progress * progress * progress * (progress * (6 * progress - 15) + 10);
  }
  return COURSE_COPY_EASE(progress);
};

export const COURSE_TRANSITION_EASE = (progress: number) => {
  const pullBackEnd = 0.3;
  const pullBackAmount = 0.008;
  const smooth = (t: number) => t * t * t * (t * (6 * t - 15) + 10);

  // Match the vertical stack breakpoint and skip anticipation on mobile.
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches) {
    return smooth(progress);
  }

  // A shallow 420ms pull-back. Both velocity and acceleration are zero at
  // its endpoints, so the reversal flows into the forward glide without a kick.
  if (progress <= pullBackEnd) {
    const t = progress / pullBackEnd;

    return -pullBackAmount * smooth(t);
  }

  // Then smoothly move forward
  const t = (progress - pullBackEnd) / (1 - pullBackEnd);

  return -pullBackAmount + (1 + pullBackAmount) * smooth(t);
};
