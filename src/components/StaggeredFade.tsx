import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';

type StaggeredFadeProps = {
  text: string;
  className?: string;
};

const variants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function StaggeredFade({ text, className }: StaggeredFadeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          custom={i}
          variants={variants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="inline-block"
          aria-hidden="true"
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </span>
  );
}
