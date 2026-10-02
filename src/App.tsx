import { MotionConfig } from 'motion/react'
import { ServicesSection } from './components/ServicesSection'
import { CourseSection } from './components/CourseSection'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <main>
        <ServicesSection />
        <CourseSection />
      </main>
    </MotionConfig>
  )
}
