import React from 'react';
import Tabs, { TabsProps, TabsTypeMap } from '@material-ui/core/Tabs';
import Tab, { TabProps } from '@material-ui/core/Tab';
import { appleTabsStylesHook } from '@mui-treasury/styles/tabs';

export function AppleTabs(props: TabsProps<any>) {
  const tabsStyles = appleTabsStylesHook.useTabs();
  return <Tabs classes={tabsStyles} {...props} />;
}

export function AppleTab(props: TabProps) {
  const tabItemStyles = appleTabsStylesHook.useTabItem();
  return <Tab classes={tabItemStyles} disableRipple {...props} />;
}
