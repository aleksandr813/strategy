import React, { useState } from 'react';
import BuyBuildingsMenu from './BuyBuildingsMenu/BuyBuildingsMenu';
import BuyUnitsMenu from './BuyUnitsMenu/BuyUnitsMenu';

import "./UI.scss";
import Panel from './Panel/Panel';

export enum UIELEMENT {
    //CHAT,
    SETTING,
    BUYUNITSMENU,
    BUYBUILDINGSMENU,
    NULL
}

export interface IBaseUIElement {
    setUIElement: (name: UIELEMENT) => void
}

const UI: React.FC = () => {

    const [uiElement, setUIElement] = useState<UIELEMENT>(UIELEMENT.NULL);

    
    return (
        <div className='UI'>
            {uiElement === UIELEMENT.BUYBUILDINGSMENU && <BuyBuildingsMenu setUIElement={setUIElement} />}
            {uiElement === UIELEMENT.BUYUNITSMENU && <BuyUnitsMenu setUIElement={setUIElement} />}
            <Panel setUIElement={setUIElement}/>
        </div>
    );
};

export default UI;
// import React, { Component, useContext, useEffect, useRef, useState } from 'react';
// import CONFIG from '../../config';
// import { BuildingType, BuildingTypeResponse } from '../../services/server/types';
// import Button from '../../components/Button/Button';
// import { VillageContext, ServerContext } from '../../App';
// import VillageManager from './villageDataManager';

// import "./Village.scss"


// const UI: React.FC = () => {
//     const [showBuyMenu, setShowBuyMenu] = React.useState(false);
//     const server = useContext(ServerContext)
//     const village = useContext(VillageContext)
//     const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
//     const villageManager = new VillageManager(server)


//     const buyButtonHandler = () => {
//         setShowBuyMenu(true);
//     };

//     const closeBuyMenu = () => {
//         setShowBuyMenu(false);
//     };

//     const buyBuilding = async (building: BuildingType) => {
//         console.log(`Покупка здания: ${building.name}`);
//         village.getScene().buildingPreview.activate(building.name, building.id, building.hp);
//         closeBuyMenu();
//     };


//     useEffect(() => {
//         (async () => {
//             setBuildingTypes(await villageManager.loadBuildingTypes());
//         })();
//     }, []);

//     return (
//     <div className='VillageUI'>
//         <Button text='Купить здания' onClick={buyButtonHandler}/>
//         {showBuyMenu && (
//             <div className="buy-menu-overlay" onClick={closeBuyMenu}>
//                 <div className="buy-menu-container" onClick={(e) => e.stopPropagation()}>
//                     <h3 className="buy-menu-title">
//                         Выберите здание
//                     </h3>
                    
//                     {buildingTypes.map((building) => (
//                         <div key={building.id} className="buy-menu-item">
//                             <div className="building-info">
//                                 <span className="building-name">{building.name}</span>
//                                 <span className="building-details">
//                                     HP: {building.hp} | Цена: {building.price}
//                                 </span>
//                             </div>
//                             <Button 
//                                 onClick={() => buyBuilding(building)} 
//                                 text='Купить'
//                             />
//                         </div>
//                     ))}
                    
//                     <Button 
//                         onClick={closeBuyMenu} 
//                         text='Закрыть'
//                         className="buy-menu-close-button"
//                     />
//                 </div>
//             </div>
//         )}
//     </div>
//     );
// };

// export default UI;