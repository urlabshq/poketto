import { StackNavigation } from '../../../navigation';
import { CreateCollectionScreen } from './CreateCollectionScreen';
import { MyNftScreen } from './MyNftScreen';
import { NewNftScreen } from './NewNftScreen';

export const CollectibleNavigation: React.FunctionComponent = () => {
  return (
    <StackNavigation
      routes={[
        {
          route: 'my_nft',
          screen: <MyNftScreen />,
        },
        {
          route: 'create_token',
          screen: <NewNftScreen />,
        },
        {
          route: 'create_collection',
          screen: <CreateCollectionScreen />,
        },
      ]}
    />
  );
};
