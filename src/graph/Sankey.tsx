import React from 'react';
import cx from 'classnames';
import { Group } from '@vx/group';
import {
  sankey as d3sankey,
  SankeyGraph,
  SankeyLink,
  SankeyNode,
} from 'd3-sankey';

export type NodeComponentProps<NodeDatum, LinkDatum> = {
  node: SankeyNode<NodeDatum, LinkDatum>;
};
export type LinkComponentProps<NodeDatum, LinkDatum> = {
  link: SankeyLink<NodeDatum, LinkDatum>;
};

export type SankeyProps<NodeDatum, LinkDatum> = {
  graph: SankeyGraph<NodeDatum, LinkDatum>;
  /** Render override function which is passed the computed cluster layout data. */
  children?: (graph: SankeyGraph<NodeDatum, LinkDatum>) => React.ReactNode;
  /** top offset applied to the g element container. */
  top?: number;
  /** left offset applied to the g element container. */
  left?: number;
  /** className applied to the g element container. */
  className?: string;
  /**
   * Sets this sankey layout’s size to the specified two-element array of numbers `[width, height]`.
   * This is an arbitrary coordinate system, e.g., for a radial layout, a size of `[360, radius]`
   * corresponds to a breadth of 360° and a depth of radius.
   */
  size?: [number, number];
  nodeId?: (node: SankeyNode<NodeDatum, LinkDatum>) => number | string;
  nodeAlign?: (node: SankeyNode<NodeDatum, LinkDatum>, n: number) => number;
  nodeWidth?: number;
  nodePadding?: number;
  nodeSort?: (
    a: SankeyNode<NodeDatum, LinkDatum>,
    b: SankeyNode<NodeDatum, LinkDatum>
  ) => number;
  extent?: [[number, number], [number, number]];
  iterations?: number;
  /** Component which renders a single cluster link, passed the link object. */
  linkComponent?:
    | React.FunctionComponent<LinkComponentProps<NodeDatum, LinkDatum>>
    | React.ComponentClass<LinkComponentProps<NodeDatum, LinkDatum>>;
  /** Component which renders a single cluster node, passed the node object. */
  nodeComponent?:
    | React.FunctionComponent<NodeComponentProps<NodeDatum, LinkDatum>>
    | React.ComponentClass<NodeComponentProps<NodeDatum, LinkDatum>>;
};

export default function Sankey<NodeDatum, LinkDatum>({
  top,
  left,
  className,
  graph,
  size,
  nodeId,
  nodeAlign,
  nodeWidth,
  nodePadding,
  nodeSort,
  extent,
  iterations,
  children,
  linkComponent /* = HierarchyDefaultLink*/,
  nodeComponent /* = HierarchyDefaultNode*/,
}: SankeyProps<NodeDatum, LinkDatum>) {
  const sankey = d3sankey<NodeDatum, LinkDatum>();
  if (size) sankey.size(size);
  if (nodeId) sankey.nodeId(nodeId);
  if (nodeAlign) sankey.nodeAlign(nodeAlign);
  if (nodeWidth) sankey.nodeWidth(nodeWidth);
  if (nodePadding) sankey.nodePadding(nodePadding);
  if (nodeSort) sankey.nodeSort(nodeSort);
  if (extent) sankey.extent(extent);
  if (iterations) sankey.iterations(iterations);

  const data = sankey(graph);

  if (children) return <>{children(data)}</>;

  return (
    <Group top={top} left={left} className={cx('vx-sankey', className)}>
      {linkComponent &&
        data.links.map((link, i) => {
          return (
            <Group key={`sankey-link-${i}`}>
              {React.createElement(linkComponent, { link })}
            </Group>
          );
        })}
      {nodeComponent &&
        data.nodes.map((node, i) => {
          return (
            <Group key={`sankey-node-${i}`}>
              {React.createElement(nodeComponent, { node })}
            </Group>
          );
        })}
    </Group>
  );
}
