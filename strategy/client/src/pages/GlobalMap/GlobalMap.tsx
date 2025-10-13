import React, { useRef, useContext } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

const GlobalMap: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);

    const backclickHandler = () => setPage(PAGES.GAME);

    return(<>
        <h1>GlobalMap</h1>
        <Button onClick={backclickHandler} text='Назад'/>
    </>)
}

export default GlobalMap;