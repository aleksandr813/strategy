import React, { useState, useContext } from 'react';
import { ServerContext } from '../../../App';

const BuyMenu: React.FC = () => {
    const server = useContext(ServerContext);
    const buildingTypesList = server.getBuildingTypes()

    console.log(buildingTypesList)

    return (
        <div id="buyMenu">
            
        </div>
    )
}

export default BuyMenu