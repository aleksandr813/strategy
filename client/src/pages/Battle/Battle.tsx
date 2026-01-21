import React, { useContext } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import BattleCanvas from './BattleCanvas'; 

const Battle: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);

    const backclickHandler = () => setPage(PAGES.VILLAGE);

    return (
        <div className="BattlePageContainer" style={{ width: '100vw', height: '100vh', position: 'relative', zIndex: 1}}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'auto', zIndex: 10 }}>
                <h1 style={{ color: 'white', textShadow: '2px 2px 4px black' }}>Battle</h1>
                <Button onClick={backclickHandler} text='Назад'/>
            </div>
            <BattleCanvas />
        </div>
    );
}

export default Battle;