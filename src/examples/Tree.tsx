import React, { useState, useEffect } from 'react';

import { hierarchy } from 'd3-hierarchy';

import { localPoint } from '@vx/event';
import { Group } from '@vx/group';
import { Tree as VxTree } from '@vx/hierarchy';
import { Zoom } from '@vx/zoom';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import FilterCenterFocusIcon from '@material-ui/icons/FilterCenterFocus';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';

import Links from './Links';
import Nodes, { NodesProps } from './Nodes';

export interface TreeProps {
  data: any;

  renderNode: NodesProps['renderNode'];
  getKey: (node: any) => string | number;
  nodeWidth?: number;
  nodeHeight?: number;

  linkType?: LinkType;
  layout?: TreeLayout;
  orientation?: TreeOrientation;
  stepPercent?: number;

  width: number;
  height: number;
  margin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export type TreeLayout = 'cartesian' | 'polar';
export type TreeOrientation = 'horizontal' | 'vertical';
export type LinkType = 'diagonal' | 'step' | 'curve' | 'line'; // | 'elbow'

function Tree(props: TreeProps) {
  const [expandedNodeKeys, setExpandedNodeKeys] = useState<
    Array<string | number>
  >([]);

  const {
    data,
    width,
    height,
    margin = {
      top: 48, // do not overlap zoom controls by default
      left: props.nodeWidth ? props.nodeWidth / 2 : 24,
      right: 24,
      bottom: 24,
    },
  } = props;

  const root = hierarchy(data, (d: any) =>
    expandedNodeKeys.includes(props.getKey(d)) ? d.children : null
  );
  // Expand all children by default
  // useEffect(() => {
  //   const allNodeIds: Array<string | number> = [];
  //   const rootAllChildren = hierarchy(data);
  //   rootAllChildren.each((node) => allNodeIds.push(props.getKey(node.data)));
  //   setExpandedNodeKeys(allNodeIds);
  // }, []);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  let origin: { x: number; y: number };
  let sizeWidth: number;
  let sizeHeight: number;

  if (props.layout === 'polar') {
    origin = {
      x: innerWidth / 2 + margin.left,
      y: innerHeight / 2 + margin.top,
    };
    sizeWidth = 2 * Math.PI;
    sizeHeight = Math.min(innerWidth, innerHeight) / 2;
  } else {
    origin = { x: margin.left, y: margin.top };
    if (props.orientation === 'vertical') {
      sizeWidth = innerWidth;
      sizeHeight = innerHeight;
    } else {
      sizeWidth = innerHeight;
      sizeHeight = innerWidth;
    }
  }

  const initialTransform = {
    scaleX: 1,
    scaleY: 1,
    translateX: props.orientation === 'vertical' ? innerWidth / 2 : origin.x,
    translateY: props.orientation === 'vertical' ? origin.y : innerHeight / 2,
    skewX: 0,
    skewY: 0,
  };

  return (
    <Box
      position="relative"
      bgcolor="rgba(0,0,0,0.05)"
      border={1}
      borderColor="rgba(0,0,0,.1)"
    >
      <Zoom
        width={width}
        height={height}
        scaleXMin={1 / 4}
        scaleXMax={4}
        scaleYMin={1 / 4}
        scaleYMax={4}
        transformMatrix={initialTransform}
        // wheelDelta={(event: any) => {
        //   // Disable wheel scroll for now
        //   // return -event.deltaY > 0
        //   //   ? { scaleX: 1.02, scaleY: 1.02 }
        //   //   : { scaleX: 0.98, scaleY: 0.98 };
        // }}
        passive // handle scroll below
      >
        {(zoom: any) => (
          <>
            <Box
              position="absolute"
              top={16}
              right={16}
              bgcolor="rgba(211, 211, 211, .9)"
              borderRadius={24}
            >
              <IconButton
                onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
              >
                <Tooltip title="Zoom in">
                  <ZoomInIcon />
                </Tooltip>
              </IconButton>

              <IconButton
                onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
              >
                <Tooltip title="Zoom out">
                  <ZoomOutIcon />
                </Tooltip>
              </IconButton>

              <IconButton onClick={zoom.center}>
                <Tooltip title="Center">
                  <FilterCenterFocusIcon />
                </Tooltip>
              </IconButton>

              <IconButton onClick={zoom.reset}>
                <Tooltip title="Reset">
                  <ZoomOutMapIcon />
                </Tooltip>
              </IconButton>
            </Box>

            <svg
              width={width}
              height={height}
              style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab' }}
            >
              <VxTree
                root={root}
                {...(props.nodeWidth != null && props.nodeHeight != null
                  ? {
                      nodeSize:
                        props.orientation === 'vertical'
                          ? [props.nodeWidth, props.nodeHeight]
                          : [props.nodeHeight, props.nodeWidth],
                    }
                  : {
                      size: [sizeWidth, sizeHeight],
                    })}
                // separation={(a: any, b: any) =>
                //   (a.parent == b.parent ? 1 : 0.5) / a.depth
                // }
              >
                {(tree: any) => (
                  <>
                    <rect
                      width={width}
                      height={height}
                      fill="transparent"
                      onWheel={(event) => {
                        event.preventDefault();
                        // zoom.handleWheel(event);
                      }}
                      onMouseDown={zoom.dragStart}
                      onMouseMove={zoom.dragMove}
                      onMouseUp={zoom.dragEnd}
                      onMouseLeave={() => {
                        if (!zoom.isDragging) return;
                        zoom.dragEnd();
                      }}
                      onDoubleClick={(event) => {
                        if (event.altKey) {
                          const point = localPoint(event);
                          zoom.scale({ scaleX: 0.5, scaleY: 0.5, point });
                        } else {
                          const point = localPoint(event);
                          zoom.scale({ scaleX: 2.0, scaleY: 2.0, point });
                        }
                      }}
                    />

                    <Group transform={zoom.toString()}>
                      <Links
                        links={tree.links()}
                        getKey={props.getKey}
                        linkType={props.linkType}
                        layout={props.layout}
                        orientation={props.orientation}
                        stepPercent={props.stepPercent}
                        stroke="rgba(0,0,0,.2)"
                      />
                      <Nodes
                        nodes={tree.descendants().reverse()} // render parents on top of children
                        getKey={props.getKey}
                        layout={props.layout}
                        orientation={props.orientation}
                        renderNode={props.renderNode}
                        onNodeClick={(node) => {
                          const nodeKey = props.getKey(node.data);
                          const isExpanded = expandedNodeKeys.includes(nodeKey);
                          if (isExpanded) {
                            setExpandedNodeKeys((prevState) =>
                              prevState.filter((key) => key !== nodeKey)
                            );
                          } else {
                            // Probably not good to edit the node directly
                            node.data.x0 = node.x;
                            node.data.y0 = node.y;

                            setExpandedNodeKeys((prevState) => [
                              ...prevState,
                              nodeKey,
                            ]);
                          }
                        }}
                      />
                    </Group>
                  </>
                )}
              </VxTree>
            </svg>
          </>
        )}
      </Zoom>
    </Box>
  );
}

export default Tree;
