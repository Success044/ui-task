import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Course } from "../data/content";
import { COURSE_TEXT_EASE, COURSE_TRANSITION_DURATION } from "../data/motion";

export function CourseCopy({
  course,
  active,
}: {
  course: Course;
  active: boolean;
}) {
  const reduced = useReducedMotion();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [expandedWidth, setExpandedWidth] = useState<number | null>(null);
  const movement = {
    duration: reduced ? 0 : COURSE_TRANSITION_DURATION,
    ease: COURSE_TEXT_EASE,
  };
  const fade = {
    duration: reduced ? 0 : 0.55,
    delay: reduced ? 0 : 0.42,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!active || !anchor) return;
    // Keep the outgoing horizontal copy at its last width while it collapses,
    // so its heading and description cannot rewrap on the click frame.
    const observer = new ResizeObserver(() =>
      setExpandedWidth(anchor.clientWidth),
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [active]);

  return (
    <motion.div
      ref={anchorRef}
      layout="position"
      className="course-copy-position"
      transition={{ layout: movement }}
    >
      <motion.div
        className="course-copy"
        initial={false}
        animate={{ rotate: active ? 0 : -90, x: active ? 0 : -110 }}
        transition={movement}
      >
        <motion.div
          className="course-copy-expanded"
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={fade}
          style={{ width: expandedWidth ?? "100%" }}
          aria-hidden={!active}
        >
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </motion.div>
        <motion.div
          className="course-copy-collapsed"
          initial={false}
          animate={{ opacity: active ? 0 : 1 }}
          transition={fade}
          aria-hidden={active}
        >
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
