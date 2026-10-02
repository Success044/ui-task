import {
  animate,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
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

const ease = COURSE_TRANSITION_EASE;
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
    ease,
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
    // Preserve the link's starting position as the card narrows beneath it.
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
  const opacity = useMotionValue(1);
  const previousCard = useRef(activeCard);

  useEffect(() => {
    if (reduced) {
      previousCard.current = activeCard;
      opacity.set(1);
      return;
    }
    if (previousCard.current === activeCard) return;
    previousCard.current = activeCard;
    // Keep the current opacity when rapid clicks redirect the shared logos.
    const fade = animate(opacity, [opacity.get(), 0.55, 1], {
      duration: COURSE_TRANSITION_DURATION,
      times: [0, 0.5, 1],
      ease: [0.4, 0, 0.2, 1],
    });
    return () => fade.stop();
  }, [activeCard, opacity, reduced]);
  return (
    <div className="course-art-track flex" aria-hidden="true">
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
                ease,
              }}
            >
              <motion.div
                className="course-art-group flex items-center justify-center"
                style={{ opacity }}
              >
                {courseIllustrations.map((image) => (
                  <img key={image.src} src={image.src} alt="" />
                ))}
              </motion.div>
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
