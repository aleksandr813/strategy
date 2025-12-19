import React, { useState, useContext } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

const Calculator: React.FC<IBasePage> = ({ setPage }) => {
    const server = useContext(ServerContext);
    const [coeffs, setCoeffs] = useState<string[]>(["", ""]); 
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<number[] | null>(null);

    const handleChange = (i: number, value: string) => {
        const newCoeffs = [...coeffs];
        newCoeffs[i] = value;
        setCoeffs(newCoeffs);
    };

    const addCoeff = () => {
        if (coeffs.length < 5) setCoeffs([...coeffs, ""]);
    };

    const removeCoeff = () => {
        if (coeffs.length > 2) setCoeffs(coeffs.slice(0, -1));
    };

    const sendRequest = async () => {
        const nums: number[] = [];

        for (let i = 0; i < coeffs.length; i++) {
            const val = coeffs[i].trim();
            if (val === "") {
                setError(`Коэффициент №${i + 1} не заполнен`);
                setResult(null);
                return;
            }
            const num = Number(val);
            if (isNaN(num)) {
                setError(`Коэффициент №${i + 1} содержит недопустимые символы`);
                setResult(null);
                return;
            }
            nums.push(num);
        }

        setError(null);

        try {
            const response = await server.getRoots(nums);
            console.log("Ответ сервера:", response);

            if (Array.isArray(response)) {
                setResult(response);
            }
            else if (response?.error) {
                setError(`Ошибка: ${response.error.text || 'Неизвестная ошибка'}`);
                setResult(null);
            }
            else {
                setError('Не удалось получить корни уравнения');
                setResult(null);
            }
        } catch (err) {
            console.error(err);
            setError('Ошибка при запросе к серверу');
            setResult(null);
        }
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
                    style={{ margin: "5px 0", padding: "5px", width: "80px" }}
                />
            ))}

            <div style={{ marginTop: "10px" }}>
                <Button onClick={addCoeff} text="+" isDisabled={coeffs.length >= 5} />
                <Button onClick={removeCoeff} text="−" isDisabled={coeffs.length <= 2} />
            </div>

            <div style={{ marginTop: "10px" }}>
                <Button onClick={sendRequest} text="Отправить" />
                <Button onClick={() => setPage(PAGES.VILLAGE)} text="Назад" />
            </div>

            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

            {result && (
                <div style={{ 
                    marginTop: "20px", 
                    padding: "10px", 
                    backgroundColor: "#f0f8ff",
                    border: "1px solid #ccc",
                    borderRadius: "5px"
                }}>
                    <h3 style={{color: "black"}}>Результат:</h3>
                    <p style={{color: "black"}}><strong>Корни уравнения:</strong></p>
                    <ul>
                        {result.map((root, index) => (
                            <li style={{color: "black"}} key={index}>
                                x<sub>{index + 1}</sub> = {root}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Calculator;
