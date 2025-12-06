import Store from '../services/store/Store';
import Mediator from '../services/mediator/Mediator';

type TUseStorage = {
    mediator: Mediator,
    storage: Store,
}

const useStore = (options: TUseStorage) => {
    const { mediator, storage } = options;
    const { GET_STORE, SET_STORE } = mediator.getTriggerTypes();

    mediator.set(GET_STORE, (NAME) => NAME?.name ? storage.get(NAME.name) : null);
    mediator.set(SET_STORE, ({ NAME, value }) => NAME?.name && storage.set(NAME.name, value));
    //mediator.set(CLEAR_STORE, (NAME) => NAME?.name && storage.clear(NAME.name));
}

export default useStore;