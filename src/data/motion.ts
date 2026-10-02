export const COURSE_TRANSITION_DURATION = 1.4;

export const COURSE_COPY_EASE = (progress: number) => {
  if (progress <= 0.3) return 0;
  const normalizedProgress = (progress - 0.3) / 0.7;
  return (
    normalizedProgress *
    normalizedProgress *
    normalizedProgress *
    (normalizedProgress * (6 * normalizedProgress - 15) + 10)
  );
};

export const COURSE_TEXT_EASE = (progress: number) => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 800px)").matches
  ) {
    return (
      progress * progress * progress * (progress * (6 * progress - 15) + 10)
    );
  }
  return COURSE_COPY_EASE(progress);
};

export const COURSE_TRANSITION_EASE = (progress: number) => {
  const pullBackEnd = 0.3;
  const pullBackAmount = 0.008;
  const smootherStep = (value: number) =>
    value * value * value * (value * (6 * value - 15) + 10);

  if (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 800px)").matches
  ) {
    return smootherStep(progress);
  }

  if (progress <= pullBackEnd) {
    const pullBackProgress = progress / pullBackEnd;

    return -pullBackAmount * smootherStep(pullBackProgress);
  }

  const forwardProgress = (progress - pullBackEnd) / (1 - pullBackEnd);

  return (
    -pullBackAmount +
    (1 + pullBackAmount) * smootherStep(forwardProgress)
  );
};
