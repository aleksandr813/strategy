import React, { useEffect } from "react";
import { IBasePage, PAGES } from "../PageManager";

import './Preloader.scss';

import unit from '../../assets/img/background/unitsOnBackground.png';

const Preloader: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;

    useEffect(() => {
        setTimeout(() => setPage(PAGES.LOGIN), 3000);
    });

    return (
        <div className="preloader">
            <img src={unit} ></img>
            <h1>Загрузка</h1>
            <h1>...</h1>
        </div>
    );
}

export default Preloader;