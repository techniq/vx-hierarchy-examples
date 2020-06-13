import React from 'react';
import { arc as d3arc } from 'd3-shape';
import { scaleLinear, scaleSqrt, scaleOrdinal } from 'd3-scale';
import { quantize } from 'd3-interpolate';
import { interpolateRainbow } from 'd3-scale-chromatic';
import { Group } from '@vx/group';
import { Partition } from '@vx/hierarchy';
import { animated } from 'react-spring';
import { useAnimatedScale } from '../scales/AnimatedScale';

// Derived from: https://observablehq.com/@d3/zoomable-sunburst
function Sunburst(props: any) {
  const {
    root,
    width,
    height,
    margin = { top: 0, left: 0, right: 0, bottom: 0 },
  } = props;

  const color = scaleOrdinal(
    quantize(interpolateRainbow, root.children.length + 1)
  );

  const xAnimatedScale = useAnimatedScale(scaleLinear, {
    domain: [0, 1],
    range: [0, 2 * Math.PI],
  });

  const yAnimatedScale = useAnimatedScale(scaleSqrt, {
    domain: [0, 1],
    range: [0, props.width / 2],
  });

  const arc = d3arc<any, any>()
    .startAngle((d) =>
      Math.max(0, Math.min(2 * Math.PI, xAnimatedScale.scale(d.x0)))
    )
    .endAngle((d) =>
      Math.max(0, Math.min(2 * Math.PI, xAnimatedScale.scale(d.x1)))
    )
    .innerRadius((d) => Math.max(0, yAnimatedScale.scale(d.y0)))
    .outerRadius((d) => Math.max(0, yAnimatedScale.scale(d.y1)));

  return (
    <svg width={width} height={height}>
      <Partition<any>
        top={margin.top}
        left={margin.left}
        root={root}
        // size={[2 * Math.PI, (root.height + 1) / 2]}
      >
        {(data) => (
          <Group top={height / 2} left={width / 2}>
            {data.descendants().map((node, i) => (
              <animated.path
                className="path"
                // TODO: Interpolate should be for both scales
                d={xAnimatedScale.interpolate(() => arc(node))}
                stroke="#373737"
                strokeWidth="2"
                fill={color(
                  (node.children ? node.data : node.parent?.data).name
                )}
                fillOpacity={node.children ? 0.7 : 0.3}
                fillRule="evenodd"
                onClick={() => {
                  xAnimatedScale.setState((prevState) => ({
                    ...prevState,
                    domain: [node.x0, node.x1],
                  }));
                  yAnimatedScale.setState((prevState) => ({
                    ...prevState,
                    domain: [node.y0, 1],
                    range: [node.y0 ? 20 : 0, props.width / 2],
                  }));
                }}
                key={i}
              />
            ))}
          </Group>
        )}
      </Partition>
    </svg>
  );
}

export default Sunburst;
