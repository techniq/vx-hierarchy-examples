import { useState, useRef, useEffect } from 'react';
import { interpolate as d3interpolate } from 'd3-interpolate';
import { useSpring, SpringConfig } from 'react-spring';

interface GenericScale<ScaleInput> {
  (input: ScaleInput): number;
  domain(): number[] | [number, number];
  domain(domain: number[]): this;
  range(): number[] | [number, number];
  range(range: number[]): this;
}

type AnimatedScaleProps<ScaleInput> = {
  domain: number[];
  range: number[];
  springConfig?: SpringConfig;
};

export function useAnimatedScale<ScaleInput>(
  scale: () => GenericScale<ScaleInput>,
  props: AnimatedScaleProps<ScaleInput>
) {
  const [state, setState] = useState({
    domain: props.domain,
    range: props.range,
  });

  const scaleRef = useRef(scale().domain(state.domain).range(state.range));

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      domain: props.domain,
    }));
  }, [props.domain[0], props.domain[1]]);

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      range: props.range,
    }));
  }, [props.range[0], props.range[1]]);

  const interpolateDomain = d3interpolate(
    scaleRef.current.domain(),
    state.domain
  );
  const interpolateRange = d3interpolate(scaleRef.current.range(), state.range);

  // @ts-ignore
  const { t } = useSpring({
    reset: true,
    from: { t: 0 },
    to: { t: 1 },
    config: {
      precision: 0.00001,
      ...props.springConfig,
    },
    onFrame: ({ t }: { t: number }) => {
      scaleRef.current.domain(interpolateDomain(t)).range(interpolateRange(t));
    },
  });

  return {
    scale: scaleRef.current,
    state,
    setState,
    interpolate: (func: (t: number) => any) => {
      return t.interpolate(() => func(t));
    },
  };
}
