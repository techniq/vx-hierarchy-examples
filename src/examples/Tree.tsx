import React, { useState, useEffect } from 'react';

import { hierarchy } from 'd3-hierarchy';

import { localPoint } from '@vx/event';
import { Group } from '@vx/group';
import { Tree as VxTree } from '@vx/hierarchy';
import { Zoom } from '@vx/zoom';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import FilterCenterFocusIcon from '@material-ui/icons/FilterCenterFocus';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';

import AnimatedLinks from './AnimatedLinks';
import AnimatedNodes, { AnimatedNodesProps } from './AnimatedNodes';
import HStack from '../layout/HStack';

export interface TreeProps {
  data: any;

  renderNode: AnimatedNodesProps['renderNode'];
  nodeId: (node: any) => string | number;
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

  const [layout, setLayout] = useState<TreeLayout>('cartesian');
  const [orientation, setOrientation] = useState<TreeOrientation>('horizontal');
  const [linkType, setLinkType] = useState<LinkType>('step');
  const [stepPercent, setStepPercent] = useState<number>(0.5);
  const [layoutSize, setLayoutSize] = useState<'node' | 'layout'>('node');

  const root = hierarchy(data, (d: any) =>
    expandedNodeKeys.includes(props.nodeId(d)) ? d.children : null
  );
  // Expand all children by default
  // useEffect(() => {
  //   const allNodeIds: Array<string | number> = [];
  //   const rootAllChildren = hierarchy(data);
  //   rootAllChildren.each((node) => allNodeIds.push(props.nodeId(node.data)));
  //   setExpandedNodeKeys(allNodeIds);
  // }, []);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  let origin: { x: number; y: number };
  let size: [number, number];
  let nodeSize: [number, number] | undefined;

  if (layout === 'polar') {
    origin = {
      x: innerWidth / 2 + margin.left,
      y: innerHeight / 2 + margin.top,
    };
    size = [2 * Math.PI, Math.min(innerWidth, innerHeight) / 2];
  } else {
    origin = { x: margin.left, y: margin.top };
    if (orientation === 'vertical') {
      size = [innerWidth, innerHeight];
      nodeSize =
        layoutSize === 'node' && props.nodeWidth && props.nodeHeight
          ? [props.nodeWidth, props.nodeHeight]
          : undefined;
    } else {
      size = [innerHeight, innerWidth];
      nodeSize =
        layoutSize === 'node' && props.nodeWidth && props.nodeHeight
          ? [props.nodeHeight, props.nodeWidth]
          : undefined;
    }
  }

  const initialTransform = {
    scaleX: 1,
    scaleY: 1,
    translateX: orientation === 'vertical' ? innerWidth / 2 : origin.x,
    translateY: orientation === 'vertical' ? origin.y : innerHeight / 2,
    skewX: 0,
    skewY: 0,
  };

  return (
    <div>
      <HStack my={2} gridGap={8}>
        <FormControl variant="outlined" size="small">
          <InputLabel>Layout</InputLabel>
          <Select
            value={layout}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setLayout(event.target.value as TreeLayout);
            }}
            label="Layout"
          >
            <MenuItem value="cartesian">Cartesian</MenuItem>
            <MenuItem value="polar">Polar</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small">
          <InputLabel>Orientation</InputLabel>
          <Select
            value={orientation}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setOrientation(event.target.value as TreeOrientation);
            }}
            label="Orientation"
          >
            <MenuItem value="horizontal">Horizontal</MenuItem>
            <MenuItem value="vertical">Vertical</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small">
          <InputLabel>Link Type</InputLabel>
          <Select
            value={linkType}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setLinkType(event.target.value as LinkType);
            }}
            label="Link Type"
          >
            <MenuItem value="diagonal">Diagonal</MenuItem>
            <MenuItem value="step">Step</MenuItem>
            <MenuItem value="curve">Curve</MenuItem>
            <MenuItem value="line">Line</MenuItem>
          </Select>
        </FormControl>

        <Box
          border={1}
          borderColor="#ccc"
          borderRadius={4}
          position="relative"
          display="flex"
          alignItems="center"
          px={2}
          height={38}
        >
          <Box position="absolute" top={-10} left={8} bgcolor="white" px={0.5}>
            <Typography variant="caption" color="textSecondary">
              Step Percent
            </Typography>
          </Box>
          <Slider
            value={stepPercent}
            onChange={(event, value) => {
              setStepPercent(value as number);
            }}
            step={0.1}
            min={0}
            max={1}
          />
        </Box>

        <Box border={1} borderColor="#ccc" borderRadius={4} position="relative">
          <Box position="absolute" top={-10} left={8} bgcolor="white" px={0.5}>
            <Typography variant="caption" color="textSecondary">
              Size
            </Typography>
          </Box>
          <HStack px={1.5}>
            <Typography>Node</Typography>
            <Switch
              checked={layoutSize === 'layout'}
              onChange={(event) => {
                setLayoutSize(event.target.checked ? 'layout' : 'node');
              }}
              name="layoutSize"
              color="primary"
            />
            <Typography>Layout</Typography>
          </HStack>
        </Box>
      </HStack>

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
                  size={size}
                  nodeSize={nodeSize}
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

                      <Group
                        // top={origin.y}
                        // left={origin.x}
                        transform={zoom.toString()}
                      >
                        <AnimatedLinks
                          links={tree.links()}
                          nodeId={props.nodeId}
                          linkType={linkType}
                          layout={layout}
                          orientation={orientation}
                          stepPercent={stepPercent}
                          stroke="#ccc"
                        />
                        <AnimatedNodes
                          nodes={tree.descendants().reverse()} // render parents on top of children
                          nodeId={props.nodeId}
                          layout={layout}
                          orientation={orientation}
                          renderNode={props.renderNode}
                          onNodeClick={(node) => {
                            const nodeKey = props.nodeId(node.data);
                            const isExpanded = expandedNodeKeys.includes(
                              nodeKey
                            );
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
    </div>
  );
}

export default Tree;
