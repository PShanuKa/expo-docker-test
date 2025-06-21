
import NetInfo from '@react-native-community/netinfo';


export const checkNetworkConnection = async () => {

    const state = await NetInfo.fetch();
    return state.isConnected;
};


