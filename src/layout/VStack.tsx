import React from 'react';

import Box, { BoxProps } from '@material-ui/core/Box';

type VStackProps = BoxProps & {};

function VStack(props: VStackProps) {
  return (
    <Box
      display="grid"
      gridAutoRows="1fr"
      gridAutoFlow="rows"
      alignItems="center"
      {...props}
    />
  );
}

export default VStack;
