import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { partners } from "../data/content";
import { ImageGallery } from "./ImageGallery";

const serviceNames = ["UI & UX", "Development", "Blockchain"];

function RotatingService({ row }: { row: number }) {
  const [index, setIndex] = useState(row);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let timeout: ReturnType<typeof setTimeout>;
    const scheduleRotation = () => {
      timeout = setTimeout(
        () => {
          const offset =
            1 + Math.floor(Math.random() * (serviceNames.length - 1));
          setIndex((current) => (current + offset) % serviceNames.length);
          scheduleRotation();
        },
        900 + Math.random() * 1100,
      );
    };
    scheduleRotation();
    return () => clearTimeout(timeout);
  }, [reducedMotion]);

  return (
    <div className="service-word">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {serviceNames[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function ServicesSection() {
  return (
    <section
      className="services-section"
      aria-label="Our services and partners"
    >
      <div className="page-container">
        <div className="services-intro grid">
          <div>
            <h1>
              Experience our expert solutions tailored to enhance your business
              with top-tier design, development, and animation.
            </h1>
            <a
              className="services-button inline-flex items-center justify-center"
              href="#"
            >
              Services
            </a>
          </div>
          <div
            className="service-words"
            aria-label="UI and UX, Development, Blockchain"
          >
            <div aria-hidden="true">
              {serviceNames.map((name, row) => (
                <RotatingService key={name} row={row} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <ImageGallery />
      <div className="page-container">
        <div className="partners-section">
          <h2>Our Partners</h2>
          <ul
            className="partners-grid grid items-center"
            aria-label="Our partners"
          >
            {partners.map((partner) => (
              <li
                key={partner.name}
                className="flex items-center justify-center"
              >
                <img src={partner.src} alt={partner.name} loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
