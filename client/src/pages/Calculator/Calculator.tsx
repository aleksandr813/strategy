import React, { useState, useContext } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

const Calculator: React.FC<IBasePage> = ({ setPage }) => {
    const server = useContext(ServerContext);
    const [coeffs, setCoeffs] = useState<string[]>(["", ""]); 
    const [error, setError] = useState<string | null>(null);

    const handleChange = (i: number, value: string) => {
        const newCoeffs = [...coeffs];
        newCoeffs[i] = value;
        setCoeffs(newCoeffs);
    };

    const addCoeff = () => {
        if (coeffs.length < 5) {
            setCoeffs([...coeffs, ""]);
        }
    };

    const removeCoeff = () => {
        if (coeffs.length > 2) {
            setCoeffs(coeffs.slice(0, -1));
        }
    };

    const sendRequest = async () => {
        const nums: number[] = [];
        for (let i = 0; i < coeffs.length; i++) {
            const val = coeffs[i].trim();
            if (val === "") {
                setError(`Коэффициент №${i + 1} не заполнен`);
                return;
            }
            const num = Number(val);
            if (isNaN(num)) {
                setError(`Коэффициент №${i + 1} содержит недопустимые символы`);
                return;
            }
            nums.push(num);
        }

        setError(null); 
        console.log("Отправляю на бэк:", nums);
        await server.getRoots(nums); 
    };

    return (
        <div>
            <h1>Calculator</h1>
            <p>Введите коэффициенты уравнения (от 2 до 5):</p>

            {coeffs.map((c, i) => (
                <input
                    key={i}
                    type="text" 
                    value={c}
                    onChange={(e) => handleChange(i, e.target.value)}
                    placeholder={`Коэф. ${i + 1}`}
                />
            ))}

            <div style={{ marginTop: "10px" }}>
                <Button onClick={addCoeff} text="+" />
                <Button onClick={removeCoeff} text="−" />
            </div>

            <div style={{ marginTop: "10px" }}>
                <Button onClick={sendRequest} text="Отправить" />
                <Button onClick={() => setPage(PAGES.GAME)} text="Назад" />
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Calculator;
