import React, { useState } from 'react';

import { treemapBinary, HierarchyRectangularNode } from 'd3-hierarchy';
import { scaleOrdinal, ScaleOrdinal, scaleLinear, ScaleLinear } from 'd3-scale';
import { quantize } from 'd3-interpolate';
import { interpolateRainbow } from 'd3-scale-chromatic';
import { format as d3format } from 'd3-format';
import { Treemap as VxTreemap } from '@vx/hierarchy';
import { animated, useTransition, config } from 'react-spring';
import { useAnimatedScale } from '../scales/AnimatedScale';

const format = d3format(',d');

// Derived from: https://observablehq.com/@d3/zoomable-treemap
function Treemap(props: any) {
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
    domain: [0, props.width],
    range: [0, props.width],
    // springConfig: { duration: 1000, precision: 0.00001 },
    // springConfig: config.gentle,
    // springConfig: config.wobbly,
    // springConfig: config.stiff,
    springConfig: config.slow,
    // springConfig: config.molasses,
  });

  const yAnimatedScale = useAnimatedScale(scaleLinear, {
    domain: [0, props.height],
    range: [0, props.height],
    // springConfig: { duration: 1000, precision: 0.00001 },
    // springConfig: config.wobbly,
  });

  return (
    <svg width={width} height={height}>
      <VxTreemap<any>
        top={margin.top}
        left={margin.left}
        root={root}
        size={[width, height]}
        // tile={treemapBinary}
        tile={(node, x0, y0, x1, y1) => {
          // This custom tiling function adapts the built-in binary tiling function for the appropriate aspect ratio when the treemap is zoomed-in.
          treemapBinary(node, 0, 0, width, height);
          for (const child of node.children ?? []) {
            child.x0 = x0 + (child.x0 / width) * (x1 - x0);
            child.x1 = x0 + (child.x1 / width) * (x1 - x0);
            child.y0 = y0 + (child.y0 / height) * (y1 - y0);
            child.y1 = y0 + (child.y1 / height) * (y1 - y0);
          }
        }}
        // round={true}
        // paddingInner={1}
      >
        {(data) => (
          <Node
            rootNode={data}
            color={color}
            xAnimatedScale={xAnimatedScale as any}
            yAnimatedScale={yAnimatedScale as any}
          />
        )}
      </VxTreemap>
    </svg>
  );
}

type NodeProps = {
  rootNode: HierarchyRectangularNode<any>;
  color: ScaleOrdinal<string, string>;
  xAnimatedScale: ReturnType<typeof useAnimatedScale>;
  yAnimatedScale: ReturnType<typeof useAnimatedScale>;
};

function Node(props: NodeProps) {
  const { color, xAnimatedScale, yAnimatedScale } = props;

  const [selectedNode, setSelectedNode] = useState<HierarchyRectangularNode<
    any
  > | null>();

  const outsideClickRef = React.useRef<SVGGElement>(null);
  useClickOutside(outsideClickRef, () => {
    xAnimatedScale.setState((prevState) => ({
      ...prevState,
      domain: [props.rootNode.x0, props.rootNode.x1],
    }));
    yAnimatedScale.setState((prevState) => ({
      ...prevState,
      domain: [props.rootNode.y0, props.rootNode.y1],
    }));
    setSelectedNode(null);
  });

  const transitions = useTransition(selectedNode, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return (
    <>
      {props.rootNode.children?.map((node, i) => {
        const nodeId = node.data.id;
        return (
          <animated.g
            transform={xAnimatedScale.interpolate(
              () =>
                `translate(${xAnimatedScale.scale(
                  node.x0
                )}, ${yAnimatedScale.scale(node.y0)})`
            )}
            // style={{ pointerEvents: selectedNode ? 'none' : undefined }}
            key={`node-${nodeId}`}
            onClick={() => {
              if (node.children) {
                xAnimatedScale.setState((prevState) => ({
                  ...prevState,
                  domain: [node.x0, node.x1],
                }));
                yAnimatedScale.setState((prevState) => ({
                  ...prevState,
                  domain: [node.y0, node.y1],
                }));
                setSelectedNode(node);
              }
            }}
            ref={outsideClickRef}
          >
            <animated.rect
              id={`rect-${nodeId}`}
              width={xAnimatedScale.interpolate(
                () =>
                  xAnimatedScale.scale(node.x1) - xAnimatedScale.scale(node.x0)
              )}
              height={yAnimatedScale.interpolate(
                () =>
                  yAnimatedScale.scale(node.y1) - yAnimatedScale.scale(node.y0)
              )}
              // fill={node.parent ? props.color(node.parent.data.id) : undefined}
              // fillOpacity={node.children ? 1 : 0.7}
              fill={node.children ? '#ccc' : '#ddd'}
              stroke="#fff"
              // stroke="rgba(255,255,255,.3)"
              // stroke="rgba(0,0,0,.5)"
            />
            <clipPath id={`clip-${nodeId}`}>
              <use xlinkHref={`#rect-${nodeId}`} />
            </clipPath>
            <text
              x={4}
              y={13}
              clipPath={`url(#clip-${nodeId})`}
              style={{
                font: '10px sans-serif',
                fontWeight: 'bold',
              }}
            >
              {node.data.name} ({node.children?.length ?? 0})
            </text>
            <text
              x={4}
              y={25}
              clipPath={`url(#clip-${nodeId})`}
              style={{
                font: '10px sans-serif',
                opacity: 0.5,
              }}
            >
              {node.value && format(node.value)}
            </text>
          </animated.g>
        );
      })}
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <animated.g style={props} key={key}>
              <Node
                rootNode={item}
                color={color}
                xAnimatedScale={xAnimatedScale}
                yAnimatedScale={yAnimatedScale}
              />
            </animated.g>
          )
      )}
    </>
  );
}

function useClickOutside(ref: React.RefObject<any>, callback: () => any) {
  const handleClick = (e: MouseEvent) => {
    // if (ref.current && !ref.current.contains(e.target)) {
    //   callback();
    // }
    if (ref.current && e.target == document.documentElement) {
      callback();
    }
  };
  React.useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
}

export default Treemap;
