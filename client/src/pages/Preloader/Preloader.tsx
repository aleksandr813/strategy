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
            <p>xsffd</p>
        </div>
    );
}

export default Preloader;