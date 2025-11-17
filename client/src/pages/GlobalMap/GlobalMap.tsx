import React, { useRef, useContext } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import GlobalMapCanvas from './GlobalMapCanvas';

const GlobalMap: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);

    const backclickHandler = () => setPage(PAGES.VILLAGE);

    return(<>
        <h1>GlobalMap</h1>
        <Button onClick={backclickHandler} text='Назад'/>
        <div>
            <GlobalMapCanvas/>
        </div>
    </>)
}

export default GlobalMap;