import {
  createElement,
  Fragment,
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
} from 'react';

type AnimationProps = {
  animate?: unknown;
  exit?: unknown;
  initial?: unknown;
  layout?: unknown;
  transition?: unknown;
  variants?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
};

function withoutAnimationProps<T extends AnimationProps>(props: T): Omit<T, keyof AnimationProps> {
  const domProps = { ...props };
  delete domProps.animate;
  delete domProps.exit;
  delete domProps.initial;
  delete domProps.layout;
  delete domProps.transition;
  delete domProps.variants;
  delete domProps.whileHover;
  delete domProps.whileTap;
  return domProps;
}

function MotionDiv(props: ComponentPropsWithoutRef<'div'> & AnimationProps) {
  return createElement('div', withoutAnimationProps(props));
}

function MotionButton(props: ComponentPropsWithoutRef<'button'> & AnimationProps) {
  // eslint-disable-next-line react/button-has-type -- wrapper passes type through props
  return createElement('button', withoutAnimationProps(props));
}

function MotionTableRow(props: ComponentPropsWithoutRef<'tr'> & AnimationProps) {
  return createElement('tr', withoutAnimationProps(props));
}

export const motion = {
  button: MotionButton,
  div: MotionDiv,
  tr: MotionTableRow,
};

export function AnimatePresence({ children }: PropsWithChildren) {
  return createElement(Fragment, null, children);
}
