import Box from '@mui/material/Box';
import { TabsNavigation } from '../../../navigation';
import { BottomTabs } from '../../components/BottomTabs';
import { ActivityScreen } from '../ActivityScreen';
import { CollectibleScreen } from '../CollectibleScreen';
import { SettingScreen } from '../SettingScreen';
import { Home } from './Home';

export const HomeNavigation: React.FunctionComponent = () => (
  <TabsNavigation
    routes={[
      { route: 'home', screen: <Home /> },
      { route: 'collectible', screen: <CollectibleScreen /> },
      { route: 'activity', screen: <ActivityScreen /> },
      { route: 'setting', screen: <SettingScreen /> },
    ]}
    navigation={
      <Box position="absolute" bottom={0} left={0} right={0}>
        <BottomTabs />
      </Box>
    }
  />
);
