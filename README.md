# react-really-simple-infinite-scroll

Really simple infinite scroll component for React.

[![NPM](https://img.shields.io/npm/v/react-really-simple-infinite-scroll.svg)](https://www.npmjs.com/package/react-really-simple-infinite-scroll)

## Installation

```bash
npm install --save react-really-simple-infinite-scroll
```

Install peer dependencies:

```bash
npm install --save react react-dom
```

## Usage

```jsx
import React, { useState, useCallback, useEffect } from "react";
import { ReallySimpleInfiniteScroll } from "react-really-simple-infinite-scroll";

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
        className="infinite-scroll"
        hasMore={hasMore}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        isInfiniteLoading={isInfiniteLoading}
        onInfiniteLoad={onInfiniteLoadCallback}
      >
        {items.map(item => (
          <div key={item.id} className="item">
            {item.label}
          </div>
        ))}
      </ReallySimpleInfiniteScroll>
    </div>
  );
}
```

## License

MIT © [Anton Bagdatyev (Tonix)](https://github.com/tonix-tuft)
