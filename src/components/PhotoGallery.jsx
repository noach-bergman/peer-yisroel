import { useState, useEffect } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { cn } from '../lib/utils'

// x offsets by count so cards are always centered
const X_POSITIONS = {
  1: [0],
  2: [-100, 100],
  3: [-200, 0, 200],
  4: [-240, -80, 80, 240],
  5: [-320, -160, 0, 160, 320],
}
const Y_OFFSETS   = [15, 32, 8, 22, 44]
const Z_INDEXES   = [50, 40, 30, 20, 10]
const DIRECTIONS  = ['left', 'left', 'right', 'right', 'left']

export const PhotoGallery = ({
  animationDelay = 0.5,
  categories = [],
  images = [],
  lang = 'he',
  onNavigate,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded]   = useState(false)

  useEffect(() => {
    const visTimer  = setTimeout(() => setIsVisible(true), animationDelay * 1000)
    const animTimer = setTimeout(() => setIsLoaded(true), (animationDelay + 0.4) * 1000)
    return () => { clearTimeout(visTimer); clearTimeout(animTimer) }
  }, [animationDelay])

  // Only build slots for categories that have at least one image
  const filledCats = categories.filter((cat) =>
    images.some((img) => img.category_id === cat.id)
  ).slice(0, 5)

  const count   = filledCats.length
  const xSet    = X_POSITIONS[count] ?? X_POSITIONS[5]

  const slots = filledCats.map((cat, i) => ({
    id:        cat.id,
    order:     i,
    x:         `${xSet[i]}px`,
    y:         `${Y_OFFSETS[i] ?? 0}px`,
    zIndex:    Z_INDEXES[i] ?? 10,
    direction: DIRECTIONS[i] ?? 'right',
    src:       images.find((img) => img.category_id === cat.id)?.image_url ?? '',
    title:     cat[`name_${lang}`] || cat.name_he || '',
    cat,
  }))

  if (slots.length === 0) return null

  const containerVariants = {
    hidden:  { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  }

  const photoVariants = {
    hidden:  () => ({ x: 0, y: 0, rotate: 0, scale: 1 }),
    visible: (custom) => ({
      x: custom.x,
      y: custom.y,
      rotate: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 70, damping: 12, mass: 1, delay: custom.order * 0.15 },
    }),
  }

  const kicker  = lang === 'he' ? 'מסע בין סיפורים חזותיים' : 'A Journey Through Visual Stories'
  const heading = lang === 'he'
    ? <> ברוכים הבאים ל<span className="text-rose-500">סיפורים שלנו</span></>
    : <>Welcome to Our <span className="text-rose-500">Stories</span></>

  return (
    <div className="mt-10 mb-4 relative">
      <p className="my-2 text-center text-xs font-light uppercase tracking-widest text-slate-600">
        {kicker}
      </p>
      <h3 className="z-20 mx-auto max-w-2xl justify-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text py-3 text-center text-4xl text-transparent md:text-5xl">
        {heading}
      </h3>

      <div className="relative mb-8 h-[350px] w-full items-center justify-center lg:flex">
        <motion.div
          className="relative mx-auto flex w-full max-w-7xl justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.div
            className="relative flex w-full justify-center"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
          >
            <div className="relative h-[220px] w-[220px]">
              {[...slots].reverse().map((slot) => (
                <motion.div
                  key={slot.id}
                  className="absolute left-0 top-0"
                  style={{ zIndex: slot.zIndex }}
                  variants={photoVariants}
                  custom={{ x: slot.x, y: slot.y, order: slot.order }}
                >
                  <FolderCard
                    width={220}
                    height={220}
                    src={slot.src}
                    title={slot.title}
                    direction={slot.direction}
                    onClick={onNavigate ? () => onNavigate(slot.cat) : undefined}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function getRandomNumberInRange(min, max) {
  return Math.random() * (max - min) + min
}

export const FolderCard = ({ src, title, className, direction, width, height, onClick, ...props }) => {
  const [rotation, setRotation] = useState(0)
  const x = useMotionValue(200)
  const y = useMotionValue(200)

  useEffect(() => {
    setRotation(getRandomNumberInRange(1, 4) * (direction === 'left' ? -1 : 1))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left)
    y.set(event.clientY - rect.top)
  }

  const resetMouse = () => { x.set(200); y.set(200) }

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileTap={{ scale: 1.2, zIndex: 9999 }}
      whileHover={{ scale: 1.1, rotateZ: 2 * (direction === 'left' ? -1 : 1), zIndex: 9999 }}
      whileDrag={{ scale: 1.1, zIndex: 9999 }}
      initial={{ rotate: 0 }}
      animate={{ rotate: rotation }}
      onClick={onClick}
      style={{
        width,
        height,
        perspective: 400,
        zIndex: 1,
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none',
      }}
      className={cn(className, 'relative mx-auto shrink-0 cursor-grab active:cursor-grabbing')}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      draggable={false}
      tabIndex={0}
      {...props}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-lg">
        <img
          className="w-full h-full object-cover absolute inset-0"
          src={src}
          alt={title}
          draggable={false}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent rounded-3xl" />
        {title && (
          <div className="absolute bottom-0 inset-x-0 px-3 pb-4 text-center">
            <p className="text-white font-bold text-sm leading-tight drop-shadow-lg">{title}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
