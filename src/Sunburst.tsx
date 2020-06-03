import React, { useState, useEffect, useRef } from 'react';
import { arc as d3arc } from 'd3-shape';
import { scaleLinear, scaleSqrt, scaleOrdinal } from 'd3-scale';
import { interpolate as d3interpolate, quantize } from 'd3-interpolate';
import { interpolateRainbow } from 'd3-scale-chromatic';
import { Group } from '@vx/group';
import { Partition } from '@vx/hierarchy';
import { useSpring, animated } from 'react-spring';

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

  const [state, setState] = useState({
    xDomain: [0, 1],
    xRange: [0, 2 * Math.PI],
    yDomain: [0, 1],
    yRange: [0, props.width / 2],
  });

  const xScale = useRef(
    scaleLinear().domain(state.xDomain).range(state.xRange)
  );
  const yScale = useRef(scaleSqrt().domain(state.yDomain).range(state.yRange));

  useEffect(() => {
    setState((state) => ({
      ...state,
      yRange: [state.yRange[0], props.width / 2],
    }));
  }, [props.width]);

  const arc = d3arc<any, any>()
    .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, xScale.current(d.x0))))
    .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, xScale.current(d.x1))))
    .innerRadius((d) => Math.max(0, yScale.current(d.y0)))
    .outerRadius((d) => Math.max(0, yScale.current(d.y1)));

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
      <Partition<any> top={margin.top} left={margin.left} root={root}>
        {(data) => (
          <Group top={height / 2} left={width / 2}>
            {data.descendants().map((node, i) => (
              <animated.path
                className="path"
                d={t.interpolate(() => arc(node))}
                stroke="#373737"
                strokeWidth="2"
                fill={color(
                  (node.children ? node.data : node.parent?.data).name
                )}
                fillRule="evenodd"
                onClick={() => {
                  setState({
                    ...state,
                    xDomain: [node.x0, node.x1],
                    yDomain: [node.y0, 1],
                    yRange: [node.y0 ? 20 : 0, props.width / 2],
                  });
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
