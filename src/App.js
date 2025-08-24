import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
  const [items, setItems] = useState([]);
  const [setA, setSetA] = useState([]);
  const [setB, setSetB] = useState([]);
  const [currentX, setCurrentX] = useState(null);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [stage, setStage] = useState('input'); // input, compare, sorted, tiering, final
  const [tiers, setTiers] = useState([]);
  const [firstTierLabel, setFirstTierLabel] = useState('');
  const [comparisonHistory, setComparisonHistory] = useState({}); // Tracks comparisons: { "item1:item2": "item1" }

  const shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startSorting = () => {
    const newSetA = shuffle(items);
    setSetA(newSetA);
    setSetB([newSetA[0]]);
    setSetA(newSetA.slice(1));
    setStage('compare');
    setCurrentX(newSetA[1]);
    setLow(0);
    setHigh(0);
    console.log('After initialization - Set A:', newSetA.slice(1), 'Set B:', [newSetA[0]]);
  };

  const performComparison = () => {
    if (setA.length === 0 && !currentX) {
      setStage('sorted');
      console.log('Sorting complete - Set A:', [], 'Set B:', setB);
      return;
    }
    if (!currentX) {
      setCurrentX(setA[0]);
      setSetA(setA.slice(1));
      setLow(0);
      setHigh(setB.length - 1);
      console.log('Next item to compare:', setA[0], 'Set A:', setA.slice(1), 'Set B:', setB);
    }
  };

  const choose = (chosen) => {
    const mid = Math.floor((low + high) / 2);
    const xBetter = chosen === currentX;
    console.log(`Better? ${xBetter}. Chosen = ${chosen}, current = ${currentX}.`)
    const done = high <= low
      || (mid === 0 && !xBetter)
      || (mid === setB.length - 1 && xBetter)
      
 
    // Record comparison in history
    const pairKey = [currentX, setB[mid]].sort().join(':');
    setComparisonHistory((prev) => ({
      ...prev,
      [pairKey]: chosen,
    }));

    if (done)
    {
      // We have the place to put it for sure
        const newSetB = [...setB];
        if (xBetter)
        {
          newSetB.splice(high + 1, 0, currentX)
        }
        else
        {
          newSetB.splice(low, 0, currentX)
        }
        setSetB(newSetB);
        setCurrentX(setA[1]);
        const finished = setA.length <= 1
        setSetA(setA.length === 1 ? [] : setA.slice(1))
        console.log(`Inserted "${currentX}" at position ${xBetter ? high : low} in Set B`);
        console.log('Current state - Set A:', setA, 'Set B:', newSetB);
        setLow(0);
        setHigh(newSetB.length - 1);
        if (finished)
        {
          startTiering()
        }
    }
    else
    {
      if (xBetter) {
        setLow(mid + 1);
        console.log(`Better. High is now ${high}, low is ${mid + 1}. Length ${setB.length}`)
      } else {
        setHigh(mid - 1);
        console.log(`Worse. High is now ${mid - 1}, low is ${low}. Length ${setB.length}`)
      }
    }
    performComparison();
  };

  const startTiering = () => {
    setStage('tiering');
    setTiers([{ label: firstTierLabel, items: [], divider: true }]);
    setSetB(setB.reverse())
    console.log('Starting tiering - Sorted Set B:', setB, 'Initial tiers:', [{ label: firstTierLabel, items: [], divider: true }]);
  };

  const addDividerAfter = (index) => {
    const newTiers = [...tiers];
    newTiers.splice(index + 1, 0, { label: '', items: [], divider: true });
    setTiers(newTiers);
    console.log(`Added divider after item at index ${index}`, 'Tiers:', newTiers);
  };

  const removeDivider = (index) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    setTiers(newTiers);
    console.log(`Removed divider at index ${index}`, 'Tiers:', newTiers);
  };

  const updateTierLabel = (index, value) => {
    const newTiers = [...tiers];
    newTiers[index].label = value;
    setTiers(newTiers);
    console.log(`Updated tier label at index ${index} to "${value}"`, 'Tiers:', newTiers);
  };

  const finishTiering = () => {
    let currentItems = [];
    const finalTiers = [];
    let currentLabel = firstTierLabel;
    let itemIndex = 0;

    tiers.forEach((tier, index) => {
      while (itemIndex < setB.length && (index === tiers.length - 1 || currentItems.length < setB.length / tiers.length)) {
        currentItems.push(setB[itemIndex]);
        itemIndex++;
      }
      finalTiers.push({ label: currentLabel, items: [...currentItems] });
      currentLabel = tier.label;
      currentItems = [];
    });

    if (itemIndex < setB.length) {
      while (itemIndex < setB.length) {
        currentItems.push(setB[itemIndex]);
        itemIndex++;
      }
      finalTiers.push({ label: currentLabel, items: [...currentItems] });
    }

    setTiers(finalTiers);
    setStage('final');
    console.log('Final tiers created:', finalTiers);
  };

  let option1, option2;
  if (currentX && stage === 'compare') {
    let mid = Math.floor((low + high) / 2);
    
    // Check if this pair has been compared before
    let pairKey = [currentX, setB[mid]].sort().join(':');
    while (comparisonHistory[pairKey] && low < high) {
      const previousWinner = comparisonHistory[pairKey];
      const xBetter = previousWinner === currentX;
      console.log(`Skipping comparison for "${currentX}" vs "${setB[mid]}" (already compared, winner: "${previousWinner}")`);
      if (xBetter) {
        setLow(mid + 1);
      } else {
        setHigh(mid);
      }
      mid = Math.floor((low + high) / 2);
      pairKey = [currentX, setB[mid]].sort().join(':');
    }

    const isSwapped = Math.random() < 0.5;
    console.log('Current state - Set A:', setA, 'Set B:', setB);
    option1 = isSwapped ? setB[mid] : currentX;
    option2 = isSwapped ? currentX : setB[mid];
    console.log(`Comparing "${option1}" vs "${option2}. High is now ${high}, low is ${low}. Length ${setB.length}"`);
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      {stage === 'input' && (
        <div>
          <h2>Enter your list (one item per line)</h2>
          <textarea
            rows="10"
            cols="50"
            onChange={(e) => setItems(e.target.value.split('\n').map(line => line.trim()).filter(line => line))}
          ></textarea>
          <br />
          <button onClick={startSorting} disabled={items.length < 2}>
            Start
          </button>
        </div>
      )}

      {stage === 'compare' && (
        <div>
          <h2>Which is better?</h2>
          <p>1: {option1}</p>
          <p>2: {option2}</p>
          <button onClick={() => choose(option1)}>{option1}</button>
          <button onClick={() => choose(option2)}>{option2}</button>
        </div>
      )}

      {stage === 'sorted' && (
        <div>
          <h2>Sorted List (Best to Worst)</h2>
          <ul>
            {setB.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <button onClick={startTiering}>Start Tiering</button>
        </div>
      )}

      {stage === 'tiering' && (
        <div>
          <h2>Build Tiers</h2>
          <label>
            First Tier Label:{' '}
            <input
              type="text"
              placeholder="e.g. S"
              value={firstTierLabel}
              onChange={(e) => setFirstTierLabel(e.target.value)}
            />
          </label>
          <ul>
            {setB.map((item, index) => (
              <li key={index}>
                <span>{item}</span>
                {index < setB.length - 1 && (
                  <button onClick={() => addDividerAfter(index)}>Add Divider After</button>
                )}
                {tiers[index] && tiers[index].divider && (
                  <div style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
                    <hr />
                    <input
                      type="text"
                      placeholder="Next Tier Label (e.g. A)"
                      value={tiers[index].label}
                      onChange={(e) => updateTierLabel(index, e.target.value)}
                    />
                    <button onClick={() => removeDivider(index)}>Remove Divider</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button onClick={finishTiering}>Finish</button>
        </div>
      )}

      {stage === 'final' && (
        <div>
          <h2>Final Tier List</h2>
          {tiers.map((tier, index) => (
            <div key={index}>
              <h3>{tier.label || 'Unnamed Tier'}</h3>
              <ul style={{ display: 'flex', flexWrap: 'wrap', padding: 0 }}>
                {tier.items.map((item, i) => (
                  <li key={i} style={{ margin: '0 10px' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

export default App;