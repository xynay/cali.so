import { clsxm } from '@zolplay/utils';
import React from 'react';

type ContainerProps = React.ComponentPropsWithoutRef<'div'>;

const OuterContainer = React.memo(
  React.forwardRef<HTMLDivElement, ContainerProps>(function OuterContainer(
    { className, children, ...props },
    ref
  ) {
    return (
      <div ref={ref} className={clsxm('sm:px-8', className)} {...props}>
        <div className="mx-auto max-w-7xl lg:px-8">{children}</div>
      </div>
    );
  }),
  (prevProps, nextProps) => prevProps.className === nextProps.className && prevProps.children === nextProps.children
);

const InnerContainer = React.memo(
  React.forwardRef<HTMLDivElement, ContainerProps>(function InnerContainer(
    { className, children, ...props }: ContainerProps,
    ref
  ) {
    return (
      <div
        ref={ref}
        className={clsxm('relative px-4 sm:px-8 lg:px-12', className)}
        {...props}
      >
        <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
      </div>
    );
  }),
  (prevProps, nextProps) => prevProps.className === nextProps.className && prevProps.children === nextProps.children
);

const ContainerComponent = React.forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ children, ...props }: ContainerProps, ref) {
    return (
      <OuterContainer ref={ref} {...props}>
        <InnerContainer>{children}</InnerContainer>
      </OuterContainer>
    );
  }
);

export const Container = Object.assign(ContainerComponent, {
  Outer: OuterContainer,
  Inner: InnerContainer,
});