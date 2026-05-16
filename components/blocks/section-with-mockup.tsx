'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionWithMockupProps {
  eyebrow?: string
  title: React.ReactNode
  description: React.ReactNode
  primaryImageSrc: string
  secondaryImageSrc: string
  reverseLayout?: boolean
  accentColor?: string
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
}

const textVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const imageVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

export default function SectionWithMockup({
  eyebrow,
  title,
  description,
  primaryImageSrc,
  secondaryImageSrc,
  reverseLayout = false,
  accentColor = '#0D9488',
}: SectionWithMockupProps) {
  return (
    <section className="relative py-24 md:py-32 bg-neutral-950 overflow-hidden">
      {/* Subtle radial gradient */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at ${reverseLayout ? '20%' : '80%'} 50%, ${accentColor}18, transparent)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1220px] px-6 md:px-10">
        <motion.div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 items-center',
            reverseLayout && 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1'
          )}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Text */}
          <motion.div
            className="flex flex-col gap-6 max-w-[520px] mx-auto md:mx-0"
            variants={textVariants}
          >
            {eyebrow && (
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: accentColor }}
              >
                {eyebrow}
              </span>
            )}
            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight text-balance">
              {title}
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed text-pretty">
              {description}
            </p>
          </motion.div>

          {/* Mockup stack */}
          <motion.div
            className="relative mx-auto w-full max-w-[320px] md:max-w-[420px] h-[440px] md:h-[560px]"
            variants={imageVariants}
          >
            {/* Background card (offset) */}
            <motion.div
              className="absolute w-[85%] h-[80%] rounded-3xl overflow-hidden opacity-60"
              style={{
                bottom: reverseLayout ? 'auto' : '0',
                top: reverseLayout ? '0' : 'auto',
                [reverseLayout ? 'left' : 'right']: '-8%',
                filter: 'blur(1px)',
              }}
              initial={{ y: 0 }}
              whileInView={{ y: reverseLayout ? -20 : 20 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${secondaryImageSrc})` }}
              />
            </motion.div>

            {/* Main card */}
            <motion.div
              className="absolute inset-0 rounded-3xl overflow-hidden glass border-0"
              style={{ zIndex: 10 }}
              initial={{ y: 0 }}
              whileInView={{ y: reverseLayout ? 12 : -12 }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${primaryImageSrc})` }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <div
        className="absolute bottom-0 left-0 w-full h-px"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 100%)',
        }}
      />
    </section>
  )
}
