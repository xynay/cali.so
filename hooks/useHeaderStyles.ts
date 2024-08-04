import { useCallback, useEffect, useRef } from 'react';

import { clamp } from '~/lib/math';

interface AnimationControl {
  set: (value: number) => void;
}

export function useHeaderStyles(
  isHomePage: boolean,
  avatarX: AnimationControl,
  avatarScale: AnimationControl,
  avatarBorderX: AnimationControl,
  avatarBorderScale: AnimationControl
) {
  const headerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const isInitial = useRef(true);

  const setProperty = useCallback((properties: Record<string, string | null>) => {
    Object.entries(properties).forEach(([property, value]) => {
      value !== null 
        ? document.documentElement.style.setProperty(property, value)
        : document.documentElement.style.removeProperty(property);
    });
  }, []);

  const updateStyles = useCallback(() => {
    if (!headerRef.current || !avatarRef.current) return;

    const { top, height } = headerRef.current.getBoundingClientRect();
    const scrollY = clamp(window.scrollY, 0, document.body.scrollHeight - window.innerHeight);
    const downDelay = avatarRef.current.offsetTop;
    const upDelay = 64;

    const commonProperties = {
      '--header-position': 'sticky',
      '--content-offset': `${downDelay}px`,
    };

    if (isInitial.current) setProperty(commonProperties);

    const isScrolledPastDownDelay = scrollY >= downDelay;

    const headerHeight = isScrolledPastDownDelay 
      ? (top + height < -upDelay ? Math.max(height, scrollY - upDelay) : scrollY + height) 
      : downDelay + height;
    const headerMB = isScrolledPastDownDelay 
      ? (top + height < -upDelay ? height - headerHeight : -scrollY) 
      : -downDelay;

    setProperty({
      '--header-height': `${headerHeight}px`,
      '--header-mb': `${headerMB}px`,
      '--header-inner-position': top === 0 && scrollY > 0 && isScrolledPastDownDelay ? 'fixed' : null,
      '--header-top': top === 0 && scrollY > 0 && isScrolledPastDownDelay ? null : '0px',
      '--avatar-top': top === 0 && scrollY > 0 && isScrolledPastDownDelay ? null : '0px',
    });

    if (isHomePage) {
      const fromScale = 1;
      const toScale = 36 / 64;
      const fromX = 0;
      const toX = 2 / 16;
      const remainingScroll = downDelay - window.scrollY;
      const scale = clamp((remainingScroll * (fromScale - toScale)) / downDelay + toScale, toScale, fromScale);
      const x = clamp((remainingScroll * (fromX - toX)) / downDelay + toX, toX, fromX);
      avatarX.set(x);
      avatarScale.set(scale);
      const borderScale = 1 / (toScale / scale);
      avatarBorderX.set((-toX + x) * borderScale);
      avatarBorderScale.set(borderScale);
      setProperty({
        '--avatar-border-opacity': scale === toScale ? '1' : '0',
      });
    }

    isInitial.current = false;
  }, [isHomePage, avatarX, avatarScale, avatarBorderX, avatarBorderScale, setProperty]);

  useEffect(() => {
    const onScroll = () => requestAnimationFrame(updateStyles);
    const onResize = () => requestAnimationFrame(updateStyles);

    updateStyles();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [updateStyles]);

  return { headerRef, avatarRef };
}