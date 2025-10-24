import React, { useState } from 'react';
import Buildings from './Buildings/Buildings';

import "./UI.scss";
import Panel from './Panel/Panel';

export enum PAGESPANEL {
    //CHAT,
    SETTING,
    UNITS,
    BUILDINGS,
    NULL
}

export interface IBasePagePanel {
    setPagePanel: (name: PAGESPANEL) => void
}

const UI: React.FC = () => {

    const [page, setPagePanel] = useState<PAGESPANEL>(PAGESPANEL.NULL);

    return (
        <div className='UI'>
            {/* 
            {page === PAGES.SETTING && <Preloader setPagePanel={setPage} />}
            {page === PAGES.UNITS && <Preloader setPagePanel={setPage} />} 
            */}
            {page === PAGESPANEL.BUILDINGS && <Buildings setPagePanel={setPagePanel} />}
            <Panel setPagePanel={setPagePanel}/>
        </div>
    );
};

export default UI;