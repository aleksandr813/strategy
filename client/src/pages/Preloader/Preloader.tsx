import React, { useEffect } from "react";
import { IBasePage, PAGES } from "../PageManager";

import './Preloader.scss';

const Preloader: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;

    useEffect(() => {
        setTimeout(() => setPage(PAGES.LOGIN), 3000);
    });

    return (
        <div className="preloader">
            <h1>Загрузка</h1>
            <p>...</p>
        </div>
    );
}

export default Preloader;