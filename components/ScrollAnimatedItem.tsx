
import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollAnimatedItemProps {
  children: ReactNode;
  className?: string;
  animationClasses?: {
    initial: string;
    final: string;
  };
  threshold?: number;
  triggerOnce?: boolean;
  delay?: string; // Tailwind delay class e.g. 'delay-100'
}

const ScrollAnimatedItem: React.FC<ScrollAnimatedItemProps> = ({
  children,
  className = '',
  animationClasses = {
    initial: 'opacity-0 translate-y-5',
    final: 'opacity-100 translate-y-0',
  },
  threshold = 0.1,
  triggerOnce = true,
  delay = 'delay-0'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else {
          if (!triggerOnce) {
            // setIsVisible(false); // Optional: re-animate if scrolling back
          }
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, triggerOnce]);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-500 ease-out ${delay} ${isVisible ? animationClasses.final : animationClasses.initial}`}
    >
      {children}
    </div>
  );
};

export default ScrollAnimatedItem;
