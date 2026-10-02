import {
  cancelFrame,
  frame,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { courseIllustrations, courses } from "../data/content";
import type { Course } from "../data/content";
import { CourseCardBackground } from "./CourseCardBackground";
import { CourseCopy } from "./CourseCopy";
import { useStackedCourses } from "../hooks/useStackedCourses";
import {
  COURSE_COPY_EASE,
  COURSE_TRANSITION_DURATION,
  COURSE_TRANSITION_EASE,
} from "../data/motion";

const courseTransitionEase = COURSE_TRANSITION_EASE;
const ACTIVE_GROW = 592 / 280;

function cardStyle(active: boolean): CSSProperties {
  return { "--course-grow": active ? ACTIVE_GROW : 1 } as CSSProperties;
}

function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClickHint() {
  return (
    <span className="click-hint" aria-hidden="true">
      <span>Click me!</span>
      <svg width="52" height="57" viewBox="0 0 52 57" fill="none">
        <path
          d="M22 2C5 22 16 35 25 23c8-11-7-26-6-6 1 15 12 29 24 34M34 39l9 12-15-4"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function CourseCard({
  course,
  active,
  onSelect,
}: {
  course: Course;
  active: boolean;
  onSelect: () => void;
}) {
  const reduced = useReducedMotion();
  const stacked = useStackedCourses();
  const transition = {
    duration: reduced ? 0 : COURSE_TRANSITION_DURATION,
    ease: courseTransitionEase,
  };

  return (
    <motion.article
      layout={stacked ? false : true}
      initial={false}
      className={`course-card ${active ? "is-active" : ""}`}
      style={{ ...cardStyle(active), borderRadius: 32 }}
      animate={{
        color: active ? "#F9EBEC" : "#C33241",
      }}
      transition={{ ...transition, layout: transition }}
    >
      <CourseCardBackground active={active} />
      <button
        className="course-select"
        onClick={onSelect}
        aria-expanded={active}
        aria-controls={`course-content-${course.id}`}
        aria-label={`${course.title}, ${course.count} plus. ${active ? "Expanded" : "Expand card"}`}
      />
      {!active && <ClickHint />}
      <motion.div
        layout="position"
        initial={false}
        className="course-count"
        transition={{
          layout: { duration: transition.duration, ease: COURSE_COPY_EASE },
        }}
        aria-hidden="true"
      >
        <span>{course.count}</span>
        <span className="course-plus">+</span>
      </motion.div>
      <CourseCopy course={course} active={active} />
      <ExpandedCourseContent course={course} active={active} />
    </motion.article>
  );
}

function ExpandedCourseContent({
  course,
  active,
}: {
  course: Course;
  active: boolean;
}) {
  const reduced = useReducedMotion();
  const positionRef = useRef<HTMLDivElement>(null);
  const [expandedLeft, setExpandedLeft] = useState<number | null>(null);
  const transition = {
    duration: reduced ? 0 : COURSE_TRANSITION_DURATION,
    ease: COURSE_COPY_EASE,
  };

  useEffect(() => {
    const position = positionRef.current;
    const card = position?.parentElement;
    if (!active || !position || !card) return;
    // Hold the link in place while its card collapses.
    const observer = new ResizeObserver(() =>
      setExpandedLeft(position.offsetLeft),
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [active]);

  return (
    <motion.div
      ref={positionRef}
      layout="position"
      id={`course-content-${course.id}`}
      className="course-view-position"
      initial={false}
      transition={{ layout: transition }}
      style={{
        pointerEvents: active ? "auto" : "none",
        ...(!active && expandedLeft !== null
          ? { left: expandedLeft, right: "auto" }
          : {}),
      }}
      aria-hidden={!active}
    >
      <motion.button
        className="course-view inline-flex items-center"
        initial={false}
        animate={{ opacity: active ? 1 : 0, x: active ? 0 : 72 }}
        transition={transition}
        type="button"
        tabIndex={active ? 0 : -1}
      >
        View all Courses <ArrowIcon />
      </motion.button>
    </motion.div>
  );
}

function CourseIllustrations({ activeCard }: { activeCard: number }) {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const visibleCards = useRef(new Set([activeCard]));

  useLayoutEffect(() => {
    const track = trackRef.current;
    const row = track?.parentElement;
    if (!track || !row) return;
    const cards = Array.from(row.querySelectorAll<HTMLElement>(".course-card"));
    if (reduced) visibleCards.current = new Set([activeCard]);
    else visibleCards.current.add(activeCard);
    let settleTimer: number;

    const updateClip = () => {
      const origin = track.getBoundingClientRect();
      const paths = cards.flatMap((card, index) => {
        if (!visibleCards.current.has(index)) return [];
        const bounds = card.getBoundingClientRect();
        const left = bounds.left - origin.left;
        const top = bounds.top - origin.top;
        const right = bounds.right - origin.left;
        const bottom = bounds.bottom - origin.top;
        const radius = Math.min(32, bounds.width / 2, bounds.height / 2);
        return [
          `M ${left + radius} ${top} H ${right - radius}
          A ${radius} ${radius} 0 0 1 ${right} ${top + radius}
          V ${bottom - radius} A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}
          H ${left + radius} A ${radius} ${radius} 0 0 1 ${left} ${bottom - radius}
          V ${top + radius} A ${radius} ${radius} 0 0 1 ${left + radius} ${top} Z`,
        ];
      });
      track.style.clipPath = `path("${paths.join(" ").replace(/\s+/g, " ")}")`;
    };

    // Keep the artwork clipped to the two cards during the handoff.
    const syncClip = () => {
      updateClip();
      frame.postRender(updateClip, true);
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(
        () => {
          cancelFrame(updateClip);
          visibleCards.current = new Set([activeCard]);
          updateClip();
        },
        (reduced ? 0 : COURSE_TRANSITION_DURATION * 1000) + 100,
      );
    };
    syncClip();
    const observer = new ResizeObserver(syncClip);
    cards.forEach((card) => observer.observe(card));
    window.addEventListener("resize", syncClip);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncClip);
      window.clearTimeout(settleTimer);
      cancelFrame(updateClip);
    };
  }, [activeCard, reduced]);

  return (
    <div
      ref={trackRef}
      className="course-art-track flex"
      style={{ clipPath: "inset(0 100% 100% 0)" }}
      aria-hidden="true"
    >
      {courses.map((course, index) => (
        <div
          key={course.id}
          className={`course-art-slot ${activeCard === index ? "is-active" : ""}`}
          style={cardStyle(activeCard === index)}
        >
          {activeCard === index && (
            <motion.div
              layoutId="course-illustrations"
              className="course-art-position"
              transition={{
                duration: reduced ? 0 : COURSE_TRANSITION_DURATION,
                ease: courseTransitionEase,
              }}
            >
              <div className="course-art-group flex items-center justify-center">
                {courseIllustrations.map((image) => (
                  <img key={image.src} src={image.src} alt="" />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

export function CourseSection() {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <section
      id="courses"
      className="course-section page-container"
      aria-labelledby="courses-heading"
    >
      <header className="course-heading">
        <p>Explore our classes and master trending skills!</p>
        <h2 id="courses-heading">
          Dive Into <span>What’s Hot Right Now!</span>{" "}
          <span className="fire" aria-label="fire">
            🔥
          </span>
        </h2>
      </header>
      <LayoutGroup id="courses">
        <div className="course-row flex">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              active={activeCard === index}
              onSelect={() => setActiveCard(index)}
            />
          ))}
          <CourseIllustrations activeCard={activeCard} />
        </div>
      </LayoutGroup>
    </section>
  );
}
