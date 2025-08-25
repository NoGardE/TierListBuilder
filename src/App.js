import React, { useState, useEffect } from 'react';
import { Node, Tree } from './Tree';

const App = () => {
  const [items, setItems] = useState([]);
  const [setA, setSetA] = useState([]);
  const [tree, setTree] = useState(new Tree());
  const [currentX, setCurrentX] = useState(null);
  const [stage, setStage] = useState('input'); // input, compare, sorted, tiering, final
  const [tiers, setTiers] = useState([]); // [{ afterIndex, label }]
  const [firstTierLabel, setFirstTierLabel] = useState('');

  // Shuffle array for randomization
  const shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Start sorting with first item as root
  const startSorting = () => {
    const newSetA = shuffle(items);
    console.log('startSorting - Initial items:', items);
    console.log('Randomized Set A:', newSetA);
    if (newSetA.length < 2) {
      if (newSetA.length === 1) {
        const newTree = new Tree();
        newTree.insert(newSetA[0]);
        newTree.inorder();
        setTree(newTree);
        setSetA([]);
        setStage('sorted');
        console.log('Single item, sorted - Set A:', [], 'Sorted List:', newTree.getSorted());
      } else {
        setStage('sorted');
        console.log('Empty list, sorted - Set A:', []);
      }
      return;
    }
    const first = newSetA.shift();
    const newTree = new Tree();
    newTree.insert(first);
    newTree.inorder();
    if (!newTree.root) {
      console.error('Failed to initialize tree root with:', first);
      return;
    }
    const nextItem = newSetA.length > 0 ? newSetA[0] : null;
    setTree(newTree);
    setSetA(newSetA.slice(1));
    setCurrentX(nextItem);
    setStage('compare');
    console.log('After initialization - Set A:', newSetA.slice(1), 'Root:', first, 'currentX:', nextItem, 'sortedList:', newTree.getSorted());
  };

  // Proceed to next comparison or sorted stage
  const performComparison = () => {
    console.log('performComparison - setA:', setA, 'currentX:', currentX, 'sortedList:', tree.getSorted());
    if (setA.length === 0 && !currentX) {
      setStage('sorted');
      console.log('Sorting complete - Set A:', [], 'Sorted List:', tree.getSorted());
      return;
    }
    if (!currentX && setA.length > 0) {
      const nextItem = setA[0];
      setCurrentX(nextItem);
      setSetA(setA.slice(1));
      console.log('Next item to compare:', nextItem, 'Set A:', setA.slice(1), 'Sorted List:', tree.getSorted());
    }
  };

  // Handle user comparison choice
  const choose = (num) => {
    console.log('choose called with num:', num, 'currentX:', currentX, 'sortedList:', tree.getSorted());
    if (!currentX || !tree.root) {
      console.error('Invalid state in choose, resetting');
      performComparison();
      return;
    }
    const midValue = tree.root.value; // Use root for comparison
    if (!midValue) {
      console.error('Root node is invalid, resetting');
      performComparison();
      return;
    }
    const chosen = num === 1 ? option1 : option2;
    const notChosen = num === 1 ? option2 : option1;
    console.log(`User chose "${chosen}" over "${notChosen}"`);

    const xBetter = chosen === currentX;
    const direction = xBetter ? 'left' : 'right';
    let currentNode = tree.root;
    let parent = null;
    if (currentNode[direction]) {
      parent = currentNode;
      currentNode = currentNode[direction];
    }
    else
    {
      if (parent) {
        parent[direction] = new Node(currentX);
        parent[direction].parent = parent;
        tree.balance();
        tree.inorder();
        if (!tree.root) {
          console.error('Tree root lost after balancing');
          return;
        }
      }
    }
    const newSetA = [...setA];
    const nextItem = newSetA.length > 0 ? newSetA.shift() : null;
    setCurrentX(nextItem);
    setSetA(newSetA);
    console.log('Inserted node, preparing next - currentX:', nextItem, 'setA:', newSetA, 'sortedList:', tree.getSorted());
  };

  const startTiering = () => {
    setStage('tiering');
    setTiers([{ afterIndex: -1, label: firstTierLabel }]);
    console.log('Starting tiering - Sorted List:', tree.getSorted(), 'Initial tiers:', [{ afterIndex: -1, label: firstTierLabel }]);
  };

  const addDividerAfter = (index) => {
    const newTiers = [...tiers, { afterIndex: index, label: '' }];
    setTiers(newTiers);
    console.log(`Added divider after item at index ${index}`, 'Tiers:', newTiers);
  };

  const removeDivider = (afterIndex) => {
    const newTiers = tiers.filter((tier) => tier.afterIndex !== afterIndex);
    setTiers(newTiers);
    console.log(`Removed divider at afterIndex ${afterIndex}`, 'Tiers:', newTiers);
  };

  const updateTierLabel = (afterIndex, value) => {
    const newTiers = tiers.map((tier) =>
      tier.afterIndex === afterIndex ? { ...tier, label: value } : tier
    );
    setTiers(newTiers);
    console.log(`Updated tier label at afterIndex ${afterIndex} to "${value}"`, 'Tiers:', newTiers);
  };

  const finishTiering = () => {
    const sortedList = tree.getSorted();
    const sortedTiers = [...tiers].sort((a, b) => a.afterIndex - b.afterIndex);
    const dividerPositions = sortedTiers.map((d) => d.afterIndex);
    const starts = [0, ...dividerPositions.map((p) => p + 1)];
    const ends = [...dividerPositions.map((p) => p + 1), sortedList.length];
    const labels = [firstTierLabel, ...sortedTiers.map((d) => d.label)];
    const finalTiers = labels
      .map((label, i) => ({
        label: label || 'Unnamed Tier',
        items: sortedList.slice(starts[i], ends[i]),
      }))
      .filter((t) => t.items.length > 0);
    setTiers(finalTiers);
    setStage('final');
    console.log('Final tiers created:', finalTiers);
  };

  // Debug state changes
  useEffect(() => {
    console.log('State updated - stage:', stage, 'currentX:', currentX, 'sortedList:', tree.getSorted());
  }, [stage, currentX, tree]);

  let option1 = null, option2 = null;
  if (currentX && stage === 'compare' && tree.root) {
    console.log('Entering comparison block - currentX:', currentX, 'sortedList:', tree.getSorted());
    const midValue = tree.root.value;
    if (midValue) {
      const isSwapped = Math.random() < 0.5;
      option1 = isSwapped ? midValue : currentX;
      option2 = isSwapped ? currentX : midValue;
      console.log(`Comparing "${option1}" vs "${option2}"`);
    } else {
      console.error('Invalid root value in comparison block, resetting');
      const newSetA = [...setA];
      const nextItem = newSetA.length > 0 ? newSetA.shift() : null;
      setCurrentX(nextItem);
      setSetA(newSetA);
      console.log('Reset comparison - currentX:', nextItem, 'setA:', newSetA);
    }
  } else {
    console.log('Comparison block skipped - currentX:', currentX, 'stage:', stage, 'sortedList:', tree.getSorted());
    if (stage === 'compare' && !currentX && setA.length > 0) {
      const newSetA = [...setA];
      const nextItem = newSetA.length > 0 ? newSetA.shift() : null;
      setCurrentX(nextItem);
      setSetA(newSetA);
      console.log('Forced next comparison - currentX:', nextItem, 'setA:', newSetA);
    }
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

      {stage === 'compare' && option1 && option2 && (
        <div>
          <h2>Which is better?</h2>
          <p>1: {option1}</p>
          <p>2: {option2}</p>
          <button onClick={() => choose(1)}>{option1}</button>
          <button onClick={() => choose(2)}>{option2}</button>
        </div>
      )}

      {stage === 'sorted' && (
        <div>
          <h2>Sorted List (Best to Worst)</h2>
          <ul>
            {tree.getSorted().map((item, index) => (
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
            {tree.getSorted().map((item, index) => (
              <li key={index}>
                <span>{item}</span>
                {index < tree.getSorted().length - 1 && (
                  <button onClick={() => addDividerAfter(index)}>Add Divider After</button>
                )}
                {tiers.find((tier) => tier.afterIndex === index) && (
                  <div style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
                    <hr />
                    <input
                      type="text"
                      placeholder="Next Tier Label (e.g. A)"
                      value={tiers.find((tier) => tier.afterIndex === index).label}
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
              <h3>{tier.label}</h3>
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

export default App;