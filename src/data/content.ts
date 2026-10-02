export const galleryImages = [
  { src: '/images/image2.jpg', alt: 'A workspace with a laptop, notebook, and coffee' },
  { src: '/images/image1.jpg', alt: 'Office equipment arranged on a work desk' },
]

export const partners = [
  { src: '/partners/cloudedu.svg', name: 'Cloud Education' },
  { src: '/partners/cmclogo.svg', name: 'CMC' },
  { src: '/partners/snp.svg', name: 'IT SNP' },
  { src: '/partners/zebec.svg', name: 'Zebec' },
]

export const courses = [
  { id: 'all', count: '23', title: 'All Courses', description: "courses you're powering through right now." },
  { id: 'upcoming', count: '05', title: 'Upcoming Courses', description: 'exciting new courses waiting to boost your skills.' },
  { id: 'ongoing', count: '10', title: 'Ongoing Courses', description: 'currently happening—don’t miss out on the action!' },
] as const

export type Course = (typeof courses)[number]

export const courseIllustrations = [
  { src: '/coursesLogos/image4.svg', label: 'React' },
  { src: '/coursesLogos/image1.svg', label: 'Social media' },
  { src: '/coursesLogos/image3.svg', label: 'Vue.js' },
  { src: '/coursesLogos/image2.svg', label: 'Design' },
]
