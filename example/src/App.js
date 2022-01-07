import React, { useState, useCallback, useEffect } from "react";
import { ReallySimpleInfiniteScroll } from "react-really-simple-infinite-scroll";

// You can use any loading component you want. This is just an example using a spinner from "react-spinners-kit".
import { CircleSpinner } from "react-spinners-kit";

/**
 * @type {number}
 */
let itemId = 0;

/**
 * @type {Function}
 */
const generateMoreItems = numberOfItemsToGenerate => {
  const items = [];
  for (let i = 0; i < numberOfItemsToGenerate; i++) {
    itemId++;
    items.push({
      id: itemId,
      label: `Item ${itemId}`,
    });
  }
  return items;
};

export default function App() {
  const [displayInverse, setDisplayInverse] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(true);
  const [items, setItems] = useState([]);

  const onInfiniteLoadCallback = useCallback(() => {
    setIsInfiniteLoading(true);
    setTimeout(() => {
      const moreItems = generateMoreItems(25);
      setItems(items => items.concat(moreItems));
      setIsInfiniteLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    onInfiniteLoadCallback();
  }, [onInfiniteLoadCallback]);

  useEffect(() => {
    if (items.length >= 200) {
      setHasMore(false);
    }
  }, [items.length]);

  return (
    <div className="app">
      <ReallySimpleInfiniteScroll
        key={displayInverse}
        className={`infinite-scroll ${
          items.length && displayInverse
            ? "display-inverse"
            : "display-not-inverse"
        }`}
        hasMore={hasMore}
        length={items.length}
        loadingComponent={
          <div className="loading-component">
            <div className="spinner">
              <CircleSpinner size={20} />
            </div>{" "}
            <span className="loading-label">Loading...</span>
          </div>
        }
        isInfiniteLoading={isInfiniteLoading}
        onInfiniteLoad={onInfiniteLoadCallback}
        displayInverse={displayInverse}
      >
        {(displayInverse ? items.slice().reverse() : items).map(item => (
          <div key={item.id} className="item">
            {item.label}
          </div>
        ))}
      </ReallySimpleInfiniteScroll>
      <div>
        <button
          onClick={() => setDisplayInverse(displayInverse => !displayInverse)}
        >
          Toggle displayInverse
        </button>
      </div>
    </div>
  );
}
