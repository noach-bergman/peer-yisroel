import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { cn } from '../../lib/utils'

const defaultStaggerTimes = { char: 0.02, word: 0.03, line: 0.07 }

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
}

const defaultItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const presetVariants = {
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(8px)' },
      visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.25 } },
      exit: { opacity: 0, filter: 'blur(8px)', transition: { duration: 0.15 } },
    },
  },
  shake: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: 0 },
      visible: { x: [-4, 4, -4, 4, 0], transition: { duration: 0.35 } },
      exit: { x: 0 },
    },
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, scale: 0, transition: { duration: 0.15 } },
    },
  },
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    },
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 14 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
      exit: { opacity: 0, y: 14, transition: { duration: 0.15 } },
    },
  },
}

const AnimationComponent = React.memo(function AnimationComponent({ segment, variants, per, segmentWrapperClassName }) {
  const content =
    per === 'line' ? (
      <motion.span variants={variants} className="block">{segment}</motion.span>
    ) : per === 'word' ? (
      <motion.span aria-hidden="true" variants={variants} className="inline-block whitespace-pre">{segment}</motion.span>
    ) : (
      <motion.span className="inline-block whitespace-pre">
        {segment.split('').map((char, charIndex) => (
          <motion.span key={`char-${charIndex}`} aria-hidden="true" variants={variants} className="inline-block whitespace-pre">
            {char}
          </motion.span>
        ))}
      </motion.span>
    )

  if (!segmentWrapperClassName) return content

  const defaultWrapperClassName = per === 'line' ? 'block' : 'inline-block'
  return (
    <span className={cn(defaultWrapperClassName, segmentWrapperClassName)}>
      {content}
    </span>
  )
})

export function TextEffect({
  children,
  per = 'word',
  as = 'p',
  variants,
  className,
  preset,
  delay = 0,
  trigger = true,
  onAnimationComplete,
  segmentWrapperClassName,
}) {
  const segments =
    per === 'line' ? children.split('\n')
    : per === 'word' ? children.split(/(\s+)/)
    : children.split('')

  const MotionTag = motion[as]
  const selected = preset ? presetVariants[preset] : { container: defaultContainerVariants, item: defaultItemVariants }
  const containerVariants = variants?.container || selected.container
  const itemVariants      = variants?.item      || selected.item
  const stagger           = defaultStaggerTimes[per]

  const delayedContainerVariants = {
    hidden: containerVariants.hidden,
    visible: {
      ...containerVariants.visible,
      transition: {
        ...(containerVariants.visible?.transition),
        staggerChildren: containerVariants.visible?.transition?.staggerChildren || stagger,
        delayChildren: delay,
      },
    },
    exit: containerVariants.exit,
  }

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <MotionTag
          initial="hidden"
          animate="visible"
          exit="exit"
          aria-label={per === 'line' ? undefined : children}
          variants={delayedContainerVariants}
          className={cn('whitespace-pre-wrap', className)}
          onAnimationComplete={onAnimationComplete}
        >
          {segments.map((segment, index) => (
            <AnimationComponent
              key={`${per}-${index}-${segment}`}
              segment={segment}
              variants={itemVariants}
              per={per}
              segmentWrapperClassName={segmentWrapperClassName}
            />
          ))}
        </MotionTag>
      )}
    </AnimatePresence>
  )
}
