import React from 'react';
import { useTransition, animated } from 'react-spring';

import { findCollapsedParent, translateCoords } from './utils/treeUtils';
import { TreeLayout, TreeOrientation } from './Tree';

export type AnimatedNodesProps = {
  nodes: any[];
  getKey: (node: any) => React.Key;
  layout?: TreeLayout;
  orientation?: TreeOrientation;
  renderNode: (node: any, onClick: () => any) => React.ReactNode;
  onNodeClick: (node: any) => any;
};

function AnimatedNodes(props: AnimatedNodesProps) {
  const { nodes, getKey, renderNode, onNodeClick } = props;

  const transitions = useTransition<
    any,
    any /*{ xy: number[], opacity: number}*/
  >(nodes, (node) => getKey(node.data), {
    // config: { tension: 1000, friction: 130, mass: 5 },
    from: (node) => {
      const { x, y } = translateCoords(
        node.parent || { x: 0, y: 0 },
        props.layout,
        props.orientation
      );
      return {
        xy: [x, y],
        opacity: 0,
      };
    },
    enter: (node) => {
      const { x, y } = translateCoords(node, props.layout, props.orientation);
      return {
        xy: [x, y],
        opacity: 1,
      };
    },
    update: (node) => {
      const { x, y } = translateCoords(node, props.layout, props.orientation);
      return {
        xy: [x, y],
        opacity: 1,
      };
    },
    leave: (node) => {
      if (node.parent) {
        // child leaving
        const collapsedParent = findCollapsedParent(node.parent);
        const { x, y } = translateCoords(
          {
            x: collapsedParent
              ? collapsedParent.data.x0 ?? collapsedParent.x
              : 0,
            y: collapsedParent
              ? collapsedParent.data.y0 ?? collapsedParent.y
              : 0,
          },
          props.layout,
          props.orientation
        );
        return {
          xy: [x, y],
          opacity: 0,
        };
      } else {
        // root node leaving (new tree likely)
        const { x, y } = translateCoords(
          { x: 0, y: 0 },
          props.layout,
          props.orientation
        );
        return {
          xy: [x, y],
          opacity: 0,
        };
      }
    },
  });

  return (
    <>
      {transitions.map(({ item, props, key }) => (
        <animated.g
          opacity={props.opacity}
          transform={props.xy.interpolate(
            (x: number, y: number) => `translate(${x}, ${y})`
          )}
          key={key}
        >
          {renderNode(item, () => onNodeClick(item))}
        </animated.g>
      ))}
    </>
  );
}

export default AnimatedNodes;
