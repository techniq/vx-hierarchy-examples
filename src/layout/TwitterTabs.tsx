import React from 'react';
import Tabs, { TabsProps, TabsTypeMap } from '@material-ui/core/Tabs';
import Tab, { TabProps } from '@material-ui/core/Tab';
import { twitterTabsStylesHook } from '@mui-treasury/styles/tabs';

export function TwitterTabs(props: TabsProps<any>) {
  const tabsStyles = twitterTabsStylesHook.useTabs();
  return <Tabs classes={tabsStyles} {...props} />;
}

export function TwitterTab(props: TabProps) {
  const tabItemStyles = twitterTabsStylesHook.useTabItem();
  return <Tab classes={tabItemStyles} {...props} />;
}
