import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue } from 'framer-motion'
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
  kicker,
  headingPrefix,
  headingHighlight,
}) => {
  const stageRef = useRef(null)
  const isInView = useInView(stageRef, { once: true, amount: 0.25, margin: '0px 0px -10% 0px' })
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded]   = useState(false)

  useEffect(() => {
    if (!isInView) return undefined
    const visTimer  = setTimeout(() => setIsVisible(true), animationDelay * 1000)
    const animTimer = setTimeout(() => setIsLoaded(true), (animationDelay + 0.15) * 1000)
    return () => { clearTimeout(visTimer); clearTimeout(animTimer) }
  }, [animationDelay, isInView])

  // Only build categories that have at least one image.
  const filledCats = categories.filter((cat) =>
    images.some((img) => img.category_id === cat.id)
  )
  const spreadCats = filledCats.slice(0, 5)
  const overflowCats = filledCats.slice(5)

  const count   = spreadCats.length
  const xSet    = X_POSITIONS[count] ?? X_POSITIONS[5]

  const slots = spreadCats.map((cat, i) => {
    const catImages = images.filter((img) => img.category_id === cat.id)
    const cover = catImages.find((img) => img.media_type !== 'video') ?? catImages[0]
    return {
      id:        cat.id,
      order:     i,
      x:         `${xSet[i]}px`,
      y:         `${Y_OFFSETS[i] ?? 0}px`,
      zIndex:    Z_INDEXES[i] ?? 10,
      direction: DIRECTIONS[i] ?? 'right',
      src:       cover?.image_url ?? '',
      title:     cat[`name_${lang}`] || cat.name_he || '',
      cat,
    }
  })

  if (filledCats.length === 0) return null

  const containerVariants = {
    hidden:  { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
  }

  const photoVariants = {
    hidden:  () => ({ x: 0, y: 0, rotate: 0, scale: 1 }),
    visible: (custom) => ({
      x: custom.x,
      y: custom.y,
      rotate: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 105, damping: 14, mass: 0.9, delay: custom.order * 0.08 },
    }),
  }

  const fallbackKicker = lang === 'he' ? 'מסע בין סיפורים חזותיים' : 'A Journey Through Visual Stories'
  const fallbackHeadingPrefix = lang === 'he' ? 'ברוכים הבאים ל' : 'Welcome to Our '
  const fallbackHeadingHighlight = lang === 'he' ? 'סיפורים שלנו' : 'Stories'

  return (
    <div ref={stageRef} className="mt-2 mb-4">
      <h3 className="mx-auto max-w-2xl pb-4 text-center text-2xl font-semibold text-white md:text-3xl">
        {headingPrefix || fallbackHeadingPrefix}
        <span className="text-amber-400">{headingHighlight || fallbackHeadingHighlight}</span>
      </h3>

      <div className="flex flex-wrap justify-center gap-4">
        {filledCats.map((cat, i) => {
          const catImages = images.filter((img) => img.category_id === cat.id)
          const cover = catImages.find((img) => img.media_type !== 'video') ?? catImages[0]
          const direction = DIRECTIONS[i % DIRECTIONS.length]
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            >
              <FolderCard
                width={150}
                height={150}
                src={cover?.image_url ?? ''}
                title={cat[`name_${lang}`] || cat.name_he || ''}
                direction={direction}
                onClick={onNavigate ? () => onNavigate(cat) : undefined}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function getRandomNumberInRange(min, max) {
  return Math.random() * (max - min) + min
}

const VIDEO_URL_RE = /\.(mp4|webm|mov|avi|m4v)(\?|#|$)/i

export const FolderCard = ({ src, title, className, direction, width, height, onClick, ...props }) => {
  const isVideo = VIDEO_URL_RE.test(src)
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
        {isVideo ? (
          <video
            className="w-full h-full object-cover absolute inset-0"
            src={src}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            className="w-full h-full object-cover absolute inset-0"
            src={src}
            alt={title}
            draggable={false}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent rounded-3xl" />
        {/* Dog-ear fold — signals this card is a folder */}
        <div
          className="absolute top-0 end-0 w-12 h-12 pointer-events-none"
          style={{
            background: 'linear-gradient(225deg, rgba(255,255,255,0.4) 50%, transparent 50%)',
            borderStartEndRadius: '1.5rem',
          }}
        />
        {title && (
          <div className="absolute bottom-0 inset-x-0 px-3 pb-4 text-center">
            <p className="text-white font-bold text-sm leading-tight drop-shadow-lg">{title}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
