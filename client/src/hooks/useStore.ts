import Store from '../services/store/Store';
import { TSTORE } from '../config';
import Mediator from '../services/mediator/Mediator';

type TUseStorage = {
    STORAGE: TSTORE,
    mediator: Mediator,
}

const useStore = (options: TUseStorage) => {
    const { mediator, STORAGE } = options;
    const storage = new Store(STORE);
    const { GET_STORAGE, SET_STORAGE, CLEAR_STORAGE } = mediator.getTriggerTypes();

    mediator.set(GET_STORAGE, (NAME) => NAME?.name ? storage.get(NAME.name) : null);
    mediator.set(SET_STORAGE, ({ NAME, value }) => NAME?.name && storage.set(NAME.name, value));
    mediator.set(CLEAR_STORAGE, (NAME) => NAME?.name && storage.clear(NAME.name));
}

export default useStore;