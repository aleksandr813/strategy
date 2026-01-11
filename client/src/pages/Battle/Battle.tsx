import React from 'react';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

const Battle: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;

    const backclickHandler = () => setPage(PAGES.VILLAGE);

    return(<>
        <h1>Battle</h1>
        <Button onClick={backclickHandler} text='Назад'/>
    </>)
}

export default Battle;