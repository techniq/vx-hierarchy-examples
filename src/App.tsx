import React, { useState } from 'react';
import {
  hierarchy,
  stratify,
  HierarchyNode,
  ClusterLayout,
} from 'd3-hierarchy';
import { ParentSize } from '@vx/responsive';
import preval from 'babel-plugin-preval/macro';

import './styles.css';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import TextField from '@material-ui/core/TextField';

import DatabaseIcon from 'mdi-material-ui/Database';

import IcicleHorizontal from './examples/IcicleHorizontal';
import IcicleVertical from './examples/IcicleVertical';
import Sunburst from './examples/Sunburst';
import Sankey from './examples/Sankey';
import Tree from './examples/Tree';
import Treemap from './examples/Treemap';

import Node from './examples/Node';

import hierarchyData from './data/hierarchy';
// import hierarchyData from './data/simpleHierarchy';
import { graphFromCsv } from './graph/utils';
import graph from './data/graph';
import { AppleTabs, AppleTab } from './layout/AppleTabs';

// const csv = preval`
//   const fs = require('fs')
//   module.exports = fs.readFileSync(require.resolve('./data/graph.csv'), 'utf8')
// `;
// const graph = graphFromCsv(csv);
// const graph = {
//   nodes: root.descendants().map((node) => node.data),
//   links: root.links().map((link) => {
//     return {
//       source: link.source.data.name,
//       target: link.target.data.name,
//       value: link.target.value,
//     };
//   }),
// };
console.log({ graph });

export default function App() {
  const [layout, setLayout] = useState<
    | 'IcicleVertical'
    | 'IcicleHorizontal'
    | 'Sunburst'
    | 'Treemap'
    | 'Sankey'
    | 'Tree'
  >('Tree');

  const [showDrawer, setShowDrawer] = useState(false);
  const [hierarchyCsv, setHierarchyCsv] = useState<string | null>(null);

  const root = hierarchy<any>(hierarchyData)
    .eachBefore(
      (d) =>
        (d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
    )
    .sum((d) => d.size)
    // .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    .sort((a, b) => b.height - a.height || (b.value ?? 0) - (a.value ?? 0));

  // let root: HierarchyNode<any> = hierarchy({ name: 'root', chidren: [] });
  // try {
  //   if (hierarchyCsv) {
  //     root = hierarchyFromCsv(hierarchyCsv)
  //       .eachBefore(
  //         (d) =>
  //           (d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
  //       )
  //       .sum((d) => {
  //         console.log({ d });
  //         // return d.size;
  //         return +d.value;
  //       })
  //       // .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  //       .sort((a, b) => b.height - a.height || (b.value ?? 0) - (a.value ?? 0));
  //   }
  // } catch (e) {
  //   console.log(e);
  // }

  console.log({ root });

  return (
    <div>
      <AppleTabs
        value={layout}
        onChange={(event: React.ChangeEvent<{}>, newValue: typeof layout) => {
          setLayout(newValue as typeof layout);
        }}
      >
        {[
          'IcicleVertical',
          'IcicleHorizontal',
          'Treemap',
          'Sunburst',
          'Sankey',
          'Tree',
        ].map((layoutName) => {
          return (
            <AppleTab label={layoutName} value={layoutName} key={layoutName} />
          );
        })}
      </AppleTabs>

      <ParentSize>
        {(size) =>
          size.ref &&
          (layout === 'IcicleVertical' ? (
            <IcicleVertical root={root} width={size.width} height={800} />
          ) : layout === 'IcicleHorizontal' ? (
            <IcicleHorizontal root={root} width={size.width} height={800} />
          ) : layout === 'Sunburst' ? (
            <div
              style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Sunburst
                root={root}
                width={Math.min(size.width, size.height) * 0.8}
                height={Math.min(size.width, size.height) * 0.8}
              />
            </div>
          ) : layout === 'Sankey' ? (
            <Sankey
              graph={graph}
              // nodeId={(d: any) => d.name}
              width={size.width - 100}
              height={800}
              // height={10000}
            />
          ) : layout === 'Treemap' ? (
            <Treemap root={root} width={960} height={600} />
          ) : layout === 'Tree' ? (
            <Tree
              data={hierarchyData}
              nodeId={(d) => d.id}
              renderNode={(node, onClick) => {
                // console.log('node', node);
                return (
                  <Node node={node} onClick={onClick} width={192} height={24} />
                );
              }}
              nodeWidth={192 * 1.5}
              nodeHeight={24 + 16}
              width={size.width}
              // height={size.height}
              height={800}
            />
          ) : null)
        }
      </ParentSize>

      <Box
        position="fixed"
        bottom={0}
        left={0}
        width="100%"
        zIndex={1}
        p={1}
        borderTop={1}
        borderColor="#ddd"
        bgcolor="#fff"
      >
        <Button
          onClick={() => setShowDrawer((prevState) => !prevState)}
          variant="outlined"
          startIcon={<DatabaseIcon />}
        >
          Edit Data
        </Button>
        <Drawer
          anchor="bottom"
          open={showDrawer}
          onClose={() => setShowDrawer(false)}
        >
          <Box p={2}>
            <TextField
              label="CSV"
              placeholder="parent,child,value"
              multiline
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={hierarchyCsv}
              onChange={(e) => {
                setHierarchyCsv(e.target.value || null);
              }}
            />
          </Box>
        </Drawer>
      </Box>
    </div>
  );
}
