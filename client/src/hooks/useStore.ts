import { useEffect, useState } from 'react';
import Store from '../services/store/Store';

export function useStoreMoney(store: Store) {
    const [money, setMoney] = useState(store.getMoney());

    useEffect(() => {
        const updateMoney = () => {
            setMoney(store.getMoney());
        };

        const unsubscribe = store.subscribe(updateMoney);
        
        return () => {
            unsubscribe();
        };
    }, []);

    return money;
}