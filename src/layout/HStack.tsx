import React from 'react';

import Box, { BoxProps } from '@material-ui/core/Box';

type HStackProps = BoxProps & {};

function HStack(props: HStackProps) {
  return (
    <Box
      display="grid"
      gridAutoColumns="1fr"
      gridAutoFlow="column"
      alignItems="center"
      {...props}
    />
  );
}

export default HStack;
