import React, { useState } from 'react';
import { Group } from '@vx/group';
import { Text } from '@vx/text';
import { scaleSequential } from 'd3-scale';
import { interpolateCool } from 'd3-scale-chromatic';
import { extent } from 'd3-array';
import { LinkHorizontal } from '@vx/shape';
import { linkHorizontal } from 'd3-shape';

import Box from '@material-ui/core/Box';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import Sankey, { SankeyProps } from '../graph/Sankey';
import HStack from '../layout/HStack';

const path = linkHorizontal()
  // @ts-ignore
  .source((d) => [d.source.x1, d.y0])
  // @ts-ignore
  .target((d) => [d.target.x0, d.y1]);

const color = scaleSequential(interpolateCool);

function SankeyExample(props: any) {
  const {
    graph,
    width,
    height,
    margin = {
      top: 0,
      left: 0,
      right: 200,
      bottom: 0,
    },
    ...sankeyProps
  } = props;

  const [nodeAlign, setNodeAlign] = useState<
    SankeyProps<unknown, unknown>['nodeAlign']
  >('justify');
  const [nodePadding, setNodePadding] = useState(10);
  const [highlightLinkIndexes, setHighlightLinkIndexes] = useState<any[]>([]);

  return (
    <div>
      <HStack mx={1} my={2} gridGap={8}>
        <FormControl variant="outlined" size="small">
          <InputLabel>Layout</InputLabel>
          <Select
            label="Node Align"
            value={nodeAlign}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setNodeAlign(
                event.target.value as SankeyProps<unknown, unknown>['nodeAlign']
              );
            }}
          >
            <MenuItem value="justify">Justify</MenuItem>
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="center">Center</MenuItem>
            <MenuItem value="right">Right</MenuItem>
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
              Node Padding
            </Typography>
          </Box>
          <Slider
            value={nodePadding}
            onChange={(event, value) => {
              setNodePadding(value as number);
            }}
            min={0}
            max={20}
            step={1}
          />
        </Box>
      </HStack>
      <svg
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      >
        <Sankey<any, any>
          top={margin.top}
          left={margin.left}
          graph={graph}
          size={[width, height]}
          nodeWidth={15}
          nodePadding={nodePadding}
          extent={[
            [1, 1],
            [width - 1, height - 6],
          ]}
          nodeAlign={nodeAlign}
          {...sankeyProps}
        >
          {(data) => (
            <Group>
              {
                // Hack to set color domain after <Sankey> has set depth
                // @ts-ignore
                color.domain(extent(data.nodes, (d) => d.depth))
              }
              {data.nodes /*.filter(node => node)*/
                .map((node, i) => (
                  <Group top={node.y0} left={node.x0} key={`node-${i}`}>
                    <rect
                      id={`rect-${i}`}
                      width={node.x1 - node.x0}
                      height={node.y1 - node.y0}
                      fill={color(node.depth)}
                      opacity={0.5}
                      stroke="white"
                      strokeWidth={2}
                      onMouseOver={(e) => {
                        setHighlightLinkIndexes([
                          ...node.sourceLinks.map((l: any) => l.index),
                          ...node.targetLinks.map((l: any) => l.index),
                        ]);
                      }}
                      onMouseOut={(e) => {
                        setHighlightLinkIndexes([]);
                      }}
                    />

                    <Text
                      x={18}
                      y={(node.y1 - node.y0) / 2}
                      verticalAnchor="middle"
                      style={{
                        font: '10px sans-serif',
                      }}
                    >
                      {node.name}
                    </Text>
                  </Group>
                ))}

              {/* <Group strokeOpacity={0.2}>
                {data.links.map((link, i) => (
                  <LinkHorizontal
                    key={`link-${i}`}
                    data={link}
                    source={(d) => [d.source.x1, d.y0]}
                    target={(d) => [d.target.x0, d.y1]}
                    strokeWidth={Math.max(1, link.width)}
                    opacity={0.7}
                    // fill="none"
                  />
                ))}
              </Group> */}

              <Group>
                {data.links.map((link, i) => (
                  <path
                    key={`link-${i}`}
                    d={path(link) ?? undefined}
                    stroke={highlightLinkIndexes.includes(i) ? 'red' : 'black'}
                    strokeWidth={Math.max(1, link.width)}
                    opacity={highlightLinkIndexes.includes(i) ? 0.5 : 0.1}
                    fill="none"
                    onMouseOver={(e) => {
                      setHighlightLinkIndexes([i]);
                    }}
                    onMouseOut={(e) => {
                      setHighlightLinkIndexes([]);
                    }}
                  />
                ))}
              </Group>
            </Group>
          )}
        </Sankey>
      </svg>
    </div>
  );
}

export default SankeyExample;
