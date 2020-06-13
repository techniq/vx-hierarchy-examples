import React, { useState } from 'react';
import { Group } from '@vx/group';
import { Text } from '@vx/text';
import { scaleSequential } from 'd3-scale';
import { interpolateCool } from 'd3-scale-chromatic';
import { extent } from 'd3-array';
import { LinkHorizontal } from '@vx/shape';
import { linkHorizontal } from 'd3-shape';

import Sankey from './graph/Sankey';

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

  const [nodePadding, setNodePadding] = useState(10);
  const [highlightLinkIndexes, setHighlightLinkIndexes] = useState<any[]>([]);

  return (
    <div>
      <div>
        <input
          type="range"
          min="0"
          max="20"
          value={nodePadding}
          onChange={(e) => setNodePadding(+e.target.value)}
        />
        {nodePadding}
      </div>
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
