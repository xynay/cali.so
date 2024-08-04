'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

const calculateWidth = (photosLength: number, isCompact: boolean) => {
  if (window.innerWidth < 640) {
    return window.innerWidth / 2 - 64;
  }
  return window.innerWidth / photosLength - 4 * photosLength;
};

const Photos: React.FC<{ photos: string[] }> = React.memo(({ photos }) => {
  const [width, setWidth] = React.useState(() => calculateWidth(photos.length, false));
  const [isCompact, setIsCompact] = React.useState(false);

  const expandedWidth = React.useMemo(() => width * 1.38, [width]);

  const handleResize = React.useCallback(() => {
    const isCompactView = window.innerWidth < 640;
    setIsCompact(isCompactView);
    setWidth(calculateWidth(photos.length, isCompactView));
  }, [photos.length]);

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return (
    <motion.div
      className="mt-16 sm:mt-20"
      initial={{ opacity: 0, scale: 0.925, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: 0.5,
        type: 'spring',
      }}
    >
      <div className="-my-4 flex w-full snap-x snap-proximity scroll-pl-4 justify-start gap-4 overflow-x-auto px-4 py-4 sm:gap-6 md:justify-center md:overflow-x-hidden md:px-0">
        {photos.map((image, idx) => (
          <motion.div
            key={idx}
            className="relative h-40 flex-none shrink-0 snap-start overflow-hidden rounded-xl bg-zinc-100 ring-2 ring-lime-800/20 dark:bg-zinc-800 dark:ring-lime-300/10 md:h-72 md:rounded-3xl"
            animate={{
              width,
              opacity: isCompact ? 1 : 0.85,
              filter: isCompact ? 'grayscale(0)' : 'grayscale(0.5)',
              rotate: idx % 2 === 0 ? 2 : -1,
            }}
            whileHover={
              isCompact
                ? {}
                : {
                    width: expandedWidth,
                    opacity: 1,
                    filter: 'grayscale(0)',
                  }
            }
            layout
          >
            <Image
              src={image}
              alt=""
              width={500}
              height={500}
              sizes="(min-width: 640px) 18rem, 11rem"
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
              priority
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

export default Photos;
