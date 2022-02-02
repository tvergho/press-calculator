import { useEffect, useState } from 'react';
import './App.scss';

const isValidFloat = (str) => {
  const floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
  return str.length === 0 || floatRegex.test(str);
}

const nauticalMilesConversionRatio = 1852;
const feetConversionRatio = 3.28084;

function App() {
  const [yieldVal, setYieldVal] = useState('');
  const [cep, setCep] = useState('');
  const [reliability, setReliability] = useState('');
  const [yieldUnit, setYieldUnit] = useState('mt');
  const [bias, setBias] = useState('');
  const [hardness, setHardness] = useState('');

  const [conversionInput, setConversionInput] = useState('');
  const [conversionOutput, setConversionOutput] = useState('');
  const [inputUnit, setInputUnit] = useState('nm');
  const [outputUnit, setOutputUnit] = useState('nm');

  const [numPerTarget, setNumPerTarget] = useState('');

  const [heightOfBurst, setHeightOfBurst] = useState('');
  const [distanceFromGroundZero, setDistanceFromGroundZero] = useState('');
  const [useAirburst, setUseAirburst] = useState(false);

  const onChange = (e, setter) => {
    if (isValidFloat(e.target.value)) {
      setter(e.target.value);
    }
  }

  const scaledYieldVal = yieldUnit === 'mt' ? yieldVal : yieldVal / 1000;
  const ktYieldVal = yieldUnit === 'kt' ? yieldVal : yieldVal * 1000;
  const scaledHeightOfBurst = ktYieldVal && heightOfBurst ? heightOfBurst*Math.pow(ktYieldVal, 1/3) : undefined;
  const scaledDistanceFromGroundZero = ktYieldVal && distanceFromGroundZero ? distanceFromGroundZero*Math.pow(ktYieldVal, 1/3) : undefined;
  const mDistanceFromGroundZero = scaledDistanceFromGroundZero ? scaledDistanceFromGroundZero/feetConversionRatio : undefined;

  const nmLethalRadius = (yieldVal && hardness) ? 2.62 * (Math.pow(scaledYieldVal, 1/3)/Math.pow(hardness, 1/3)) : undefined;
  const mLethalRadius = useAirburst ? mDistanceFromGroundZero : (nmLethalRadius ? nmLethalRadius * nauticalMilesConversionRatio : undefined);

  const cepEffective = bias && cep ? Math.pow(Math.pow(cep, 2) + Math.pow(bias, 2), 1/2) : undefined;
  const cepActual = cepEffective || cep;
  const sskp = mLethalRadius && cepActual ? 1 - Math.pow(0.5, Math.pow(mLethalRadius/(cepActual), 2)) : undefined;
  const tkp = sskp && reliability ? sskp * (reliability/100) : undefined;
  const tkpN = numPerTarget ? 1 - Math.pow((1-tkp), numPerTarget) : undefined;

  useEffect(() => {
    if (inputUnit === outputUnit) setConversionOutput(conversionInput);
    else if (inputUnit === 'nm' && outputUnit === 'm') setConversionOutput(conversionInput*nauticalMilesConversionRatio);
    else if (inputUnit === 'm' && outputUnit === 'nm') setConversionOutput(conversionInput/nauticalMilesConversionRatio);
    else if (inputUnit === 'm' && outputUnit === 'ft') setConversionOutput(conversionInput*feetConversionRatio);
    else if (inputUnit === 'ft' && outputUnit === 'm') setConversionOutput(conversionInput/feetConversionRatio);
    else if (inputUnit === 'nm' && outputUnit === 'ft') setConversionOutput(conversionInput*nauticalMilesConversionRatio*feetConversionRatio);
    else if (inputUnit === 'ft' && outputUnit === 'nm') setConversionOutput(conversionInput/nauticalMilesConversionRatio/feetConversionRatio);
    else setConversionOutput('');
  }, [conversionInput, inputUnit, outputUnit])

  return (
    <div className="App">
      <h1>Nuclear Weapons Survival Toolkit</h1>

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

        <div className="divider" />

        <div className="input-container">
          <label>Number of missiles per target (N)</label>
          <div className="input"><input type="text" value={numPerTarget} onChange={(e) => onChange(e, setNumPerTarget)} /> <div className="unit" /></div>
        </div>

        <div className="divider" />

        <div className="input-container">
          <label>Height of burst (H<sub>1-kt</sub>)</label>
          <div className="input"><input type="text" value={heightOfBurst} onChange={(e) => onChange(e, setHeightOfBurst)} /> <div className="unit">ft</div></div>
        </div>
        <div className="input-container">
          <label>Distance from ground zero (D<sub>1-kt</sub>)</label>
          <div className="input"><input type="text" value={distanceFromGroundZero} onChange={(e) => onChange(e, setDistanceFromGroundZero)} /> <div className="unit">ft</div></div>
        </div>
      </div>

      <div className="equations">
        <div className="airburst-check"><input type="checkbox" checked={useAirburst} onChange={(e) => setUseAirburst(e.target.checked)} /><label>Use Airburst Data?</label></div>

        <div className="equation">
          LR = 2.62 * (Y^(1/3) / H^(1/3)) = {(yieldVal && hardness) ? `2.62 * (${scaledYieldVal}^(1/3) / ${hardness}^(1/3)) = 2.62 * (${Math.pow(scaledYieldVal, 1/3)} / ${Math.pow(hardness, 1/3)}) = ${2.62} * ${Math.pow(scaledYieldVal, 1/3)/Math.pow(hardness, 1/3)} = ${2.62 * (Math.pow(scaledYieldVal, 1/3)/Math.pow(hardness, 1/3))} ≈ ` : ''}
          <span style={{fontWeight: 700}}>{(yieldVal && hardness) && `${(nmLethalRadius).toFixed(2)} nautical miles`}</span>
          <span style={{fontWeight: 700}}>{(yieldVal && hardness) && ` = ${mLethalRadius} meters`}</span>
        </div>

        <div className="equation">
          CEP effective = (CEP^2 + B^2)^(1/2) = {cep && (bias ? `(${cep}^2 + ${bias}^2)^(1/2) = (${Math.pow(cep, 2) + Math.pow(bias, 2)})^1/2 = ` : `(${cep}^2 + 0^2)^(1/2) = `)}
          <span style={{fontWeight: 700}}>{cep && (bias ? `${cepEffective} m` : `${cep} m`)}</span>
        </div>

        <div className="equation">
          SSKP = 1 - 0.5^((LR / CEP)^2) = {(mLethalRadius && cepActual) && `1 - 0.5^((${mLethalRadius} / ${cepActual})^2) = 1 - 0.5^(${Math.pow(mLethalRadius/cepActual, 2)}) = 1 - ${Math.pow(0.5, Math.pow(mLethalRadius/cepActual, 2))} = ${sskp}`}
          <span style={{fontWeight: 700}}>{(mLethalRadius && cepActual) && ` ≈ ${(sskp*100).toFixed(2)}%`}</span>
        </div>

        <div className="equation">
          TKP = SSKP * reliability = {(sskp && reliability) && `${sskp} * ${reliability/100} = ${tkp}`}
          <span style={{fontWeight: 700}}>{(sskp && reliability) && ` ≈ ${(tkp*100).toFixed(2)}%`}</span>
        </div>

        <div className="divider" />
        {!!numPerTarget && tkp && (
          <div className="equation">
            TKP<sub>n</sub> = 1 - p(miss)^n = {`1 - ${1-tkp}^${numPerTarget} = 1 - ${Math.pow(1-tkp, numPerTarget)} = ${tkpN}`}
            <span style={{fontWeight: 700}}>{` ≈ ${(tkpN*100).toFixed(2)}%`}</span>
          </div>
        )}

        <div className="divider" />
        {!!heightOfBurst && !!ktYieldVal && (
          <div className="equation">
            H<sub>{ktYieldVal}-kt</sub> = H<sub>1-kt</sub>*({ktYieldVal}^1/3) = {`${heightOfBurst}*(${ktYieldVal}^1/3) = ${heightOfBurst} * ${Math.pow(ktYieldVal, 1/3)} = ${scaledHeightOfBurst} ft`}
            <span style={{fontWeight: 700}}>{` ≈ ${(scaledHeightOfBurst/feetConversionRatio).toFixed(2)} m`}</span>
          </div>
        )}
        {!!distanceFromGroundZero && !!ktYieldVal && (
          <div className="equation">
            D<sub>{ktYieldVal}-kt</sub> = D<sub>1-kt</sub>*({ktYieldVal}^1/3) = {`${distanceFromGroundZero}*(${ktYieldVal}^1/3) = ${distanceFromGroundZero} * ${Math.pow(ktYieldVal, 1/3)} = ${scaledDistanceFromGroundZero} ft`}
            <span style={{fontWeight: 700}}>{` ≈ ${(scaledDistanceFromGroundZero/feetConversionRatio).toFixed(2)} m`}</span>
          </div>
        )}
      </div>

      <div className="convert">
        <h2>Convert</h2>
        <div>
          <input type="text" value={conversionInput} onChange={(e) => onChange(e, setConversionInput)}></input>
          <select value={inputUnit} onChange={(e) => setInputUnit(e.target.value)}>
            <option value="nm">nautical miles</option>
            <option value="m">meters</option>
            <option value="ft">feet</option>
          </select>
        </div>
        <div>
          <input type="text" value={conversionOutput} readOnly></input>
          <select value={outputUnit} onChange={(e) => setOutputUnit(e.target.value)}>
            <option value="nm">nautical miles</option>
            <option value="m">meters</option>
            <option value="ft">feet</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;
