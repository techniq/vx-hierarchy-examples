import React from 'react';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { quantize } from 'd3-interpolate';
import { interpolateRainbow } from 'd3-scale-chromatic';
import { format as d3format } from 'd3-format';
import { Group } from '@vx/group';
import { Partition } from '@vx/hierarchy';
import { animated } from 'react-spring';

import { useAnimatedScale } from '../scales/AnimatedScale';

const format = d3format(',d');

function IcicleHorizontal(props: any) {
  const {
    root,
    width,
    height,
    margin = { top: 0, left: 0, right: 0, bottom: 0 },
  } = props;

  const color = scaleOrdinal(
    quantize(interpolateRainbow, root.children?.length + 1)
  );

  const xAnimatedScale = useAnimatedScale(scaleLinear, {
    domain: [0, props.width],
    range: [0, props.width],
  });

  const yAnimatedScale = useAnimatedScale(scaleLinear, {
    domain: [0, props.height],
    range: [0, props.height],
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
                // TODO: Interpolate should be for both scales
                transform={yAnimatedScale.interpolate(
                  () =>
                    `translate(${xAnimatedScale.scale(
                      node.x0
                    )}, ${yAnimatedScale.scale(node.y0)})`
                )}
                key={`node-${i}`}
                onClick={() => {
                  // If node is already selected, target parent (go up)
                  const target =
                    node.x0 === xAnimatedScale.state.domain[0] &&
                    node.y0 === yAnimatedScale.state.domain[0] &&
                    node.parent
                      ? node.parent
                      : node;

                  xAnimatedScale.setState((prevState) => ({
                    ...prevState,
                    domain: [target.x0, target.x1],
                  }));
                  yAnimatedScale.setState((prevState) => ({
                    ...prevState,
                    domain: [target.y0, props.height],
                    // yRange: [node.depth ? 20 : 0, props.height],
                    range: [0, props.height],
                  }));
                }}
              >
                <animated.rect
                  id={`rect-${i}`}
                  width={xAnimatedScale.interpolate(
                    () =>
                      xAnimatedScale.scale(node.x1) -
                      xAnimatedScale.scale(node.x0)
                  )}
                  height={yAnimatedScale.interpolate(
                    () =>
                      yAnimatedScale.scale(node.y1) -
                      yAnimatedScale.scale(node.y0)
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
