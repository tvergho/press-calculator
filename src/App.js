import { useState } from 'react';
import './App.scss';

const isValidFloat = (str) => {
  const floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
  return str.length === 0 || floatRegex.test(str);
}

function App() {
  const [yieldVal, setYieldVal] = useState('');
  const [cep, setCep] = useState('');
  const [reliability, setReliability] = useState('');
  const [yieldUnit, setYieldUnit] = useState('mt');
  const [bias, setBias] = useState('');
  const [hardness, setHardness] = useState('')

  const onChange = (e, setter) => {
    if (isValidFloat(e.target.value)) {
      setter(e.target.value);
    }
  }

  return (
    <div className="App">
      <h1>Nuclear Weapons Survival Tool</h1>

      <div className="inputs">
        <div className="input-container">
          <label>Yield (Y)</label>
          <div className="input">
            <input type="text" value={yieldVal} onChange={(e) => onChange(e, setYieldVal)} />
            <div className="unit">
              <select onChange={(e) => setYieldUnit(e.target.value)} value={yieldUnit}>
                <option value="mt">megatons</option>
                <option value="kt">kilotons</option>
              </select>
            </div>
          </div>
        </div>
        <div className="input-container">
          <label>CEP</label>
          <div className="input"><input type="text" value={cep} onChange={(e) => onChange(e, setCep)} /> <div className="unit">m</div></div>
        </div>
        <div className="input-container">
          <label>Reliability</label>
          <div className="input"><input type="text" value={reliability} onChange={(e) => onChange(e, setReliability)} /> <div className="unit">%</div></div>
        </div>
        <div className="input-container">
          <label>Hardness (H)</label>
          <div className="input"><input type="text" value={hardness} onChange={(e) => onChange(e, setHardness)} /> <div className="unit">psi</div></div>
        </div>
        <div className="input-container">
          <label>Bias (B)</label>
          <div className="input"><input type="text" value={bias} onChange={(e) => onChange(e, setBias)} /> <div className="unit">m</div></div>
        </div>
      </div>
    </div>
  );
}

export default App;
