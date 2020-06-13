import React from 'react';

import { Text } from '@vx/text';

import { blue } from '@material-ui/core/colors';
import { useTheme, Theme } from '@material-ui/core/styles';

interface NodeProps {
  node: {
    depth: number;
    children: any | null;
    data: any;
  };
  width?: number;
  height?: number;
  onClick: () => any;
}

function Node(props: NodeProps) {
  const { node, onClick, width = 48, height = 24 } = props;

  const theme = useTheme<Theme>();

  return (
    <>
      <rect
        width={width}
        height={height}
        x={-width / 2}
        y={-height / 2}
        fill="white"
        stroke={node.data.children ? blue[500] : blue[300]}
        rx={8}
        onClick={onClick}
        {...(node.data.children && {
          style: { cursor: 'pointer' },
        })}
      />
      <Text
        fontFamily="Arial"
        textAnchor="middle"
        verticalAnchor="middle"
        style={{ pointerEvents: 'none' }}
        fill={
          node.data.children
            ? theme.palette.text.primary
            : theme.palette.text.disabled
        }
      >
        {node.data.name}
      </Text>
    </>
  );
}

export default Node;
