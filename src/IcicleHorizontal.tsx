import React, { useState, useEffect, useRef } from 'react';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { interpolate as d3interpolate, quantize } from 'd3-interpolate';
import { interpolateRainbow } from 'd3-scale-chromatic';
import { format as d3format } from 'd3-format';
import { Group } from '@vx/group';
import { Partition } from '@vx/hierarchy';
import { useSpring, animated } from 'react-spring';

const format = d3format(',d');

function IcicleHorizontal(props: any) {
  const {
    root,
    width,
    height,
    margin = { top: 0, left: 0, right: 0, bottom: 0 },
  } = props;

  const color = scaleOrdinal(
    quantize(interpolateRainbow, root.children.length + 1)
  );

  const [state, setState] = useState({
    xDomain: [0, props.width],
    xRange: [0, props.width],
    yDomain: [0, props.height],
    yRange: [0, props.height],
  });

  // console.log({ props });

  const xScale = useRef(
    scaleLinear().domain(state.xDomain).range(state.xRange)
  );
  const yScale = useRef(
    scaleLinear().domain(state.yDomain).range(state.yRange)
  );

  // useEffect(() => {
  //   setState(state => ({
  //     ...state,
  //     yRange: [state.yRange[0], props.width / 2]
  //   }));
  // }, [props.width]);

  // useEffect(() => {
  //   setState((state) => ({
  //     ...state,
  //     xDomain: [0, props.width],
  //     xRange: [0, props.width],
  //     yDomain: [0, props.height],
  //     yRange: [0, props.height],
  //   }));
  // }, [props.width, props.height]);

  const xd = d3interpolate(xScale.current.domain(), state.xDomain);
  const yd = d3interpolate(yScale.current.domain(), state.yDomain);
  const yr = d3interpolate(yScale.current.range(), state.yRange);

  // @ts-ignore
  const { t } = useSpring({
    reset: true,
    from: { t: 0 },
    to: { t: 1 },
    config: {
      mass: 5,
      tension: 500,
      friction: 100,
      precision: 0.00001,
    },
    onFrame: ({ t }: { t: number }) => {
      xScale.current.domain(xd(t));
      yScale.current.domain(yd(t)).range(yr(t));
    },
  });

  return (
    <svg width={width} height={height}>
      <Partition<any>
        top={margin.top}
        left={margin.left}
        root={root}
        size={[width, height]}
        padding={1}
        round={true}
      >
        {(data) => (
          <Group>
            {data.descendants().map((node, i) => (
              <animated.g
                // top={yScale.current(node.y0)}
                // left={xScale.current(node.x0)}
                //transform={`translate(${xScale.current(node.x0)}, ${yScale.current(node.y0)})`}
                transform={t.interpolate(
                  () =>
                    `translate(${xScale.current(node.x0)}, ${yScale.current(
                      node.y0
                    )})`
                )}
                key={`node-${i}`}
                // onClick={() => {
                //   setState({
                //     ...state,
                //     xDomain: [node.x0, node.x1],
                //     yDomain: [node.y0, props.height],
                //     yRange: [node.depth ? 20 : 0, props.height],
                //   });
                // }}
                onClick={() => {
                  if (
                    node.x0 === state.xDomain[0] &&
                    node.y0 === state.yDomain[0] &&
                    node.parent
                  ) {
                    // Already selected, use parent
                    setState({
                      ...state,
                      xDomain: [node.parent.x0, node.parent.x1],
                      yDomain: [node.parent.y0, props.height],
                      yRange: [0, props.height],
                    });
                  } else {
                    setState({
                      ...state,
                      xDomain: [node.x0, node.x1],
                      yDomain: [node.y0, props.height],
                      yRange: [0, props.height],
                    });
                  }
                }}
              >
                <animated.rect
                  id={`rect-${i}`}
                  width={t.interpolate(
                    () => xScale.current(node.x1) - xScale.current(node.x0)
                  )}
                  height={t.interpolate(
                    () => yScale.current(node.y1) - yScale.current(node.y0)
                  )}
                  fill={
                    node.children
                      ? '#ddd'
                      : color(node.data.id.split('.').slice(0, 2))
                  }
                  fillOpacity={node.children ? 1 : 0.6}
                />

                <clipPath id={`clip-${i}`}>
                  <use xlinkHref={`#rect-${i}`} />
                </clipPath>

                <text
                  x={4}
                  y={13}
                  clipPath={`url(#clip-${i})`}
                  style={{
                    font: '10px sans-serif',
                    fontWeight: 'bold',
                  }}
                >
                  {node.data.name}
                  <tspan
                    style={{
                      fontSize: 9,
                      fillOpacity: 0.8,
                    }}
                  >
                    {' '}
                    {node.value && format(node.value)}
                  </tspan>
                </text>
              </animated.g>
            ))}
          </Group>
        )}
      </Partition>
    </svg>
  );
}

export default IcicleHorizontal;
