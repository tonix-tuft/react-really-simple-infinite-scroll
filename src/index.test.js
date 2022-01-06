import "@testing-library/jest-dom/extend-expect";
import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import cases from "jest-in-case";
import renderer from "react-test-renderer";
import Enzyme, { mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { ReallySimpleInfiniteScroll } from ".";

/**
 * NOTE: Enzyme is used only for a couple of tests, e.g. the `allows getting its infinite scroll ref node programmatically using getNode()` test
 *       to test the `getNode()` method of `ReallySimpleInfiniteScroll` programmatically.
 *       Its should be used sparingly and its shallow rendering feature should not be used at all.
 *
 * @see https://kentcdodds.com/blog/why-i-never-use-shallow-rendering
 */
Enzyme.configure({ adapter: new Adapter() });

cases(
  "ReallySimpleInfiniteScroll shows/doesn't show loading component",
  ({
    infiniteScrollReactElement,
    shouldExpectNotToBeInTheDocument = false,
  }) => {
    render(infiniteScrollReactElement);

    const loadingComponentRegex = /Loading[.][.][.]/i;
    const expectation = expect(
      shouldExpectNotToBeInTheDocument
        ? screen.queryByText(loadingComponentRegex)
        : screen.getByText(loadingComponentRegex)
    );
    shouldExpectNotToBeInTheDocument
      ? expectation.not.toBeInTheDocument()
      : expectation.toBeInTheDocument();
  },
  [
    {
      name: "doesn't show loading component by default",
      infiniteScrollReactElement: (
        <ReallySimpleInfiniteScroll loadingComponent="Loading..." />
      ),
      shouldExpectNotToBeInTheDocument: true,
    },
    {
      name: "shows loading component when has more (hasMore)",
      infiniteScrollReactElement: (
        <ReallySimpleInfiniteScroll loadingComponent="Loading..." hasMore />
      ),
    },
    {
      name:
        "shows loading component when is infinite loading (isInfiniteLoading)",
      infiniteScrollReactElement: (
        <ReallySimpleInfiniteScroll loadingComponent="Loading..." hasMore />
      ),
    },
    {
      name:
        "shows loading component when has more (hasMore) or is infinite loading (isInfiniteLoading)",
      infiniteScrollReactElement: (
        <ReallySimpleInfiniteScroll
          loadingComponent="Loading..."
          isInfiniteLoading
          hasMore
        />
      ),
    },
    {
      name:
        "shows loading component when has more (hasMore) and display inverse (displayInverse)",
      infiniteScrollReactElement: (
        <ReallySimpleInfiniteScroll
          loadingComponent="Loading..."
          hasMore
          displayInverse
        />
      ),
    },
    {
      name:
        "shows loading component when is infinite loading (isInfiniteLoading) and display inverse (displayInverse)",
      infiniteScrollReactElement: (
        <ReallySimpleInfiniteScroll
          loadingComponent="Loading..."
          hasMore
          displayInverse
        />
      ),
    },
    {
      name:
        "shows loading component when has more (hasMore) or is infinite loading (isInfiniteLoading) and display inverse (displayInverse)",
      infiniteScrollReactElement: (
        <ReallySimpleInfiniteScroll
          loadingComponent="Loading..."
          isInfiniteLoading
          hasMore
          displayInverse
        />
      ),
    },
  ]
);

describe("ReallySimpleInfiniteScroll", () => {
  it("renders children components", () => {
    const infiniteScrollTree = renderer
      .create(
        <ReallySimpleInfiniteScroll>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ReallySimpleInfiniteScroll>
      )
      .toJSON();
    expect(infiniteScrollTree).toMatchInlineSnapshot(`
      <div
        className="really-simple-infinite-scroll"
        onScroll={[Function]}
      >
        <div>
          Item 1
        </div>
        <div>
          Item 2
        </div>
        <div>
          Item 3
        </div>
      </div>
    `);
  });

  it("allows getting its infinite scroll ref node programmatically using getNode()", () => {
    const wrapper = mount(<ReallySimpleInfiniteScroll />);
    expect(wrapper.instance().getNode()).toBeTruthy();
  });

  it("calls onScroll when scrolled", async () => {
    const onScroll = jest.fn();
    const reallySimpleInfiniteScrollClassName = "infinite-scroll";

    const { container } = render(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        onScroll={onScroll}
      >
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
        <div>Item 4</div>
        <div>Item 5</div>
        <div>Item 6</div>
        <div>Item 7</div>
        <div>Item 8</div>
        <div>Item 9</div>
        <div>Item 10</div>
        <div>Item 11</div>
        <div>Item 12</div>
      </ReallySimpleInfiniteScroll>
    );

    const infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    await waitFor(() => {
      expect(onScroll).toHaveBeenCalled();
    });
  });

  it("allows to await to scroll stop programmatically thanks to scrollStopPromise() which returns a promise", () => {
    const reallySimpleInfiniteScrollClassName = "infinite-scroll";

    const wrapper = mount(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
      >
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ReallySimpleInfiniteScroll>
    );

    wrapper.find(`.${reallySimpleInfiniteScrollClassName}`).simulate("scroll");

    const instance = wrapper.instance();
    const promise = instance.scrollStopPromise();

    expect.assertions(1);
    return promise.then(() => expect(true).toBe(true));
  });

  it("allows to await to scroll stop programmatically thanks to scrollStopPromise() which returns a promise even when not scrolling", () => {
    const wrapper = mount(
      <ReallySimpleInfiniteScroll>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ReallySimpleInfiniteScroll>
    );

    const instance = wrapper.instance();
    const promise = instance.scrollStopPromise();

    expect.assertions(1);
    return promise.then(() => expect(true).toBe(true));
  });

  it("allows scrolling to items programmatically thanks to a 'itemIdRefMap' prop which maps item IDs to their corresponding DOM element refs", () => {
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    window.HTMLElement.prototype.scrollIntoView = () => {};

    const ref1 = React.createRef();
    const ref2 = React.createRef();
    const ref3 = React.createRef();
    const ref4 = React.createRef();
    const ref5 = React.createRef();
    const ref6 = React.createRef();
    const ref7 = React.createRef();
    const ref8 = React.createRef();
    const itemIdRefMap = {
      1: ref1,
      2: ref2,
      3: ref3,
      4: ref4,
      5: ref5,
      6: ref6,
      7: ref7,
      8: ref8,
    };

    let instance = null;
    render(
      <ReallySimpleInfiniteScroll
        ref={componentInstance => {
          instance = componentInstance;
        }}
        itemIdRefMap={itemIdRefMap}
      >
        <div ref={ref1}>Item 1</div>
        <div ref={ref2}>Item 2</div>
        <div ref={ref3}>Item 3</div>
        <div ref={ref4}>Item 4</div>
        <div ref={ref5}>Item 5</div>
        <div ref={ref6}>Item 6</div>
        <div ref={ref7}>Item 7</div>
        <div ref={ref8}>Item 8</div>
      </ReallySimpleInfiniteScroll>
    );

    for (const itemId in itemIdRefMap) {
      const refCurrent = itemIdRefMap[itemId].current;
      const spy = jest
        .spyOn(refCurrent, "scrollIntoView")
        .mockImplementation(() => {
          // It's just a mock implementation, this test only needs to assert that `scrollIntoView` is called.
        });

      instance.scrollToId(itemId);
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    }

    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("allows scrolling to an item programmatically and passing custom parameters to change the behaviour of the underlying scrollIntoView call", () => {
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    window.HTMLElement.prototype.scrollIntoView = () => {};

    const ref1 = React.createRef();
    const itemIdRefMap = {
      1: ref1,
    };

    let instance = null;
    render(
      <ReallySimpleInfiniteScroll
        ref={componentInstance => {
          instance = componentInstance;
        }}
        itemIdRefMap={itemIdRefMap}
      >
        <div ref={ref1}>Item 1</div>
      </ReallySimpleInfiniteScroll>
    );

    const spy = jest
      .spyOn(ref1.current, "scrollIntoView")
      .mockImplementation(() => {
        // It's just a mock implementation, this test only needs to assert that `scrollIntoView` is called.
      });

    instance.scrollToId(1);
    expect(spy).toHaveBeenCalledWith(true);

    instance.scrollToId(1, {
      alignToTop: false,
    });
    expect(spy).toHaveBeenCalledWith(false);

    instance.scrollToId(1, {
      scrollIntoViewOptions: { block: "start", inline: "nearest" },
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ block: "start", inline: "nearest" })
    );

    instance.scrollToId(1, {
      scrollIntoViewOptions: { block: "end", inline: "nearest" },
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ block: "end", inline: "nearest" })
    );

    instance.scrollToId(1, {
      scrollIntoViewOptions: { block: "end" },
    });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ block: "end" }));

    instance.scrollToId(1, {
      scrollIntoViewOptions: {
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      },
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      })
    );

    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  test("scrolling to an non-existent item using an uknown item ID does not trigger an error", () => {
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    window.HTMLElement.prototype.scrollIntoView = () => {};

    const ref1 = React.createRef();
    const itemIdRefMap = {
      1: ref1,
    };

    let instance = null;
    render(
      <ReallySimpleInfiniteScroll
        ref={componentInstance => {
          instance = componentInstance;
        }}
        itemIdRefMap={itemIdRefMap}
      >
        <div ref={ref1}>Item 1</div>
      </ReallySimpleInfiniteScroll>
    );

    const spy = jest
      .spyOn(ref1.current, "scrollIntoView")
      .mockImplementation(() => {
        // It's just a mock implementation, this test only needs to assert that `scrollIntoView` is called.
      });

    instance.scrollToId(2); // Does not exist.
    expect(spy).not.toHaveBeenCalled();

    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("triggers loading new data as soon the thresold is reached when scrolling", () => {
    const items = [
      {
        id: 1,
        label: `Item 1`,
      },
      {
        id: 2,
        label: `Item 2`,
      },
      {
        id: 3,
        label: `Item 3`,
      },
      {
        id: 4,
        label: `Item 4`,
      },
      {
        id: 5,
        label: `Item 5`,
      },
    ];

    const reallySimpleInfiniteScrollClassName = "infinite-scroll";
    const onInfiniteLoad = jest.fn();

    const { container } = render(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        isInfiniteLoading={false}
        onInfiniteLoad={onInfiniteLoad}
      >
        {items.map(item => (
          <div key={item.id}>{item.label}</div>
        ))}
      </ReallySimpleInfiniteScroll>
    );

    const infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalled();
  });

  it("triggers loading new data as soon the thresold is reached when scrolling even if the 'hasMore' prop is not set", () => {
    const items = [
      {
        id: 1,
        label: `Item 1`,
      },
    ];

    const reallySimpleInfiniteScrollClassName = "infinite-scroll";
    const onInfiniteLoad = jest.fn();

    const { container } = render(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        isInfiniteLoading={false}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
      >
        {items.map(item => (
          <div key={item.id}>{item.label}</div>
        ))}
      </ReallySimpleInfiniteScroll>
    );

    const infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    // If the 'hasMore' prop is not truthy, the loading component is shown only if 'isInfiniteLoading' is `true`.
    expect(screen.queryByText(/Loading[.][.][.]/)).not.toBeInTheDocument();

    expect(onInfiniteLoad).toHaveBeenCalled();
  });

  const newlinePadLeft = "\n      ";
  it(`triggers loading new data even with display inverse (displayInverse)${newlinePadLeft}when the loading component is rendered above/before the scrollable items (e.g. like in a chat app)`, () => {
    const items = [
      {
        id: 1,
        label: `Item 1`,
      },
    ];

    const reallySimpleInfiniteScrollClassName = "infinite-scroll";
    const onInfiniteLoad = jest.fn();

    const { container } = render(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        isInfiniteLoading={false}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
        displayInverse
      >
        {items.map(item => (
          <div key={item.id}>{item.label}</div>
        ))}
      </ReallySimpleInfiniteScroll>
    );

    const infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalled();
  });

  test(`'infiniteLoadBeginEdgeOffset' prop (number of pixes away from the top/bottom/left/right side (depending on 'displayInverse' and 'axis' props) before the loading of new data)${newlinePadLeft}triggers loading new data when scrolling and the threshold is reached`, () => {
    const items = [
      {
        id: 1,
        label: `Item 1`,
      },
    ];

    const reallySimpleInfiniteScrollClassName = "infinite-scroll";
    const onInfiniteLoad = jest.fn();

    const { container } = render(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        isInfiniteLoading={false}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
        infiniteLoadBeginEdgeOffset={200}
      >
        {items.map(item => (
          <div key={item.id}>{item.label}</div>
        ))}
      </ReallySimpleInfiniteScroll>
    );

    const infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalled();
  });

  test("rerendering the component with new items renders the new items; removing a previously rendered item also works", () => {
    const { rerender } = render(
      <ReallySimpleInfiniteScroll>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ReallySimpleInfiniteScroll>
    );

    expect(screen.queryByText(/Item 1/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 2/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 3/)).toBeInTheDocument();

    rerender(
      <ReallySimpleInfiniteScroll>
        <div>Item 2</div>
        <div>Item 3</div>
        <div>Item 4</div>
        <div>Item 5</div>
      </ReallySimpleInfiniteScroll>
    );

    expect(screen.queryByText(/Item 1/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Item 2/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 3/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 4/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 5/)).toBeInTheDocument();

    rerender(
      <ReallySimpleInfiniteScroll>
        <div>Item 1</div>
      </ReallySimpleInfiniteScroll>
    );

    expect(screen.queryByText(/Item 1/)).toBeInTheDocument();
  });

  test("loading new data multiple times works", () => {
    const reallySimpleInfiniteScrollClassName = "infinite-scroll";
    const onInfiniteLoad = jest.fn();

    let items = [<div key={1}>Item 1</div>];

    let instance = null;
    const { rerender, container } = render(
      <ReallySimpleInfiniteScroll
        ref={componentInstance => {
          instance = componentInstance;
        }}
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        isInfiniteLoading={false}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
      >
        {items}
      </ReallySimpleInfiniteScroll>
    );

    let infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 1/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalledTimes(1);
    expect(instance.isLoading).toBe(true);

    rerender(
      <ReallySimpleInfiniteScroll
        ref={componentInstance => {
          instance = componentInstance;
        }}
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        isInfiniteLoading
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
      >
        {items}
      </ReallySimpleInfiniteScroll>
    );

    expect(instance.isLoading).toBe(true);

    items = [<div key={1}>Item 1</div>, <div key={2}>Item 2</div>];
    rerender(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        isInfiniteLoading={false}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
      >
        {items}
      </ReallySimpleInfiniteScroll>
    );

    infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 2/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalledTimes(2);

    items = [
      <div key={1}>Item 1</div>,
      <div key={2}>Item 2</div>,
      <div key={3}>Item 3</div>,
      <div key={4}>Item 4</div>,
      <div key={5}>Item 5</div>,
    ];
    rerender(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore={false}
        isInfiniteLoading={false}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
      >
        {items}
      </ReallySimpleInfiniteScroll>
    );

    infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Item 3/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 4/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 5/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalledTimes(2);
  });

  test("loading new data multiple times with display inverse (displayInverse) works", () => {
    const reallySimpleInfiniteScrollClassName = "infinite-scroll";
    const onInfiniteLoad = jest.fn();

    let items = [<div key={1}>Item 1</div>];

    let instance = null;
    const { rerender, container } = render(
      <ReallySimpleInfiniteScroll
        ref={componentInstance => {
          instance = componentInstance;
        }}
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        isInfiniteLoading={false}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
        displayInverse
      >
        {items}
      </ReallySimpleInfiniteScroll>
    );

    let infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 1/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalledTimes(1);
    expect(instance.isLoading).toBe(true);

    rerender(
      <ReallySimpleInfiniteScroll
        ref={componentInstance => {
          instance = componentInstance;
        }}
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        isInfiniteLoading
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
        displayInverse
      >
        {items}
      </ReallySimpleInfiniteScroll>
    );

    expect(instance.isLoading).toBe(true);

    items = [<div key={1}>Item 1</div>, <div key={2}>Item 2</div>];
    rerender(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        isInfiniteLoading={false}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
        displayInverse
      >
        {items}
      </ReallySimpleInfiniteScroll>
    );

    infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 2/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalledTimes(2);

    items = [
      <div key={1}>Item 1</div>,
      <div key={2}>Item 2</div>,
      <div key={3}>Item 3</div>,
      <div key={4}>Item 4</div>,
      <div key={5}>Item 5</div>,
    ];
    rerender(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore={false}
        isInfiniteLoading={false}
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        onInfiniteLoad={onInfiniteLoad}
        displayInverse
      >
        {items}
      </ReallySimpleInfiniteScroll>
    );

    infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Item 3/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 4/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 5/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalledTimes(2);
  });

  it("can be rendered with horizontal axis", () => {
    const infiniteScrollTree = renderer
      .create(
        <ReallySimpleInfiniteScroll axis="x">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </ReallySimpleInfiniteScroll>
      )
      .toJSON();
    expect(infiniteScrollTree).toMatchInlineSnapshot(`
      <div
        className="really-simple-infinite-scroll"
        onScroll={[Function]}
      >
        <div>
          Item 1
        </div>
        <div>
          Item 2
        </div>
        <div>
          Item 3
        </div>
      </div>
    `);
  });

  test("triggers loading new data with horizintal axis", () => {
    const items = [
      {
        id: 1,
        label: `Item 1`,
      },
      {
        id: 2,
        label: `Item 2`,
      },
      {
        id: 3,
        label: `Item 3`,
      },
      {
        id: 4,
        label: `Item 4`,
      },
      {
        id: 5,
        label: `Item 5`,
      },
    ];

    const reallySimpleInfiniteScrollClassName = "infinite-scroll";
    const onInfiniteLoad = jest.fn();

    const { container } = render(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        isInfiniteLoading={false}
        onInfiniteLoad={onInfiniteLoad}
        axis="x"
      >
        {items.map(item => (
          <div key={item.id}>{item.label}</div>
        ))}
      </ReallySimpleInfiniteScroll>
    );

    const infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(screen.queryByText(/Loading[.][.][.]/)).toBeInTheDocument();
    expect(onInfiniteLoad).toHaveBeenCalled();
  });

  it("can return a function to test for scrollbar presence (both vertical and horizontal depending on an axis parameter) programmatically through a static method", () => {
    const hasHorizontalScrollbar = ReallySimpleInfiniteScroll.hasScrollbarFunction(
      "x"
    );
    const hasVerticalScrollbar = ReallySimpleInfiniteScroll.hasScrollbarFunction(
      "y"
    );

    expect(hasHorizontalScrollbar).toEqual(expect.any(Function));
    expect(hasVerticalScrollbar).toEqual(expect.any(Function));
    expect(hasHorizontalScrollbar).not.toBe(hasVerticalScrollbar);
  });

  it("allows scrolling to the start and to the end programmatically", () => {
    const wrapper = mount(
      <ReallySimpleInfiniteScroll>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ReallySimpleInfiniteScroll>
    );

    const instance = wrapper.instance();
    const spy = jest.spyOn(instance, "scrollTo");

    instance.scrollToStart();
    expect(spy).toHaveBeenCalledWith("scrollTop", 0);
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockClear();

    instance.scrollToEnd();
    expect(spy).toHaveBeenCalledWith("scrollTop", "scrollHeight");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("allows scrolling to the start and to the end programmatically with display inverse (displayInverse)", () => {
    const wrapper = mount(
      <ReallySimpleInfiniteScroll displayInverse>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ReallySimpleInfiniteScroll>
    );

    const instance = wrapper.instance();
    const spy = jest.spyOn(instance, "scrollTo");

    instance.scrollToStart();
    expect(spy).toHaveBeenCalledWith("scrollTop", "scrollHeight");
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockClear();

    instance.scrollToEnd();
    expect(spy).toHaveBeenCalledWith("scrollTop", 0);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("does not trigger loading new data if threshold is not reached", () => {
    const items = [
      {
        id: 1,
        label: `Item 1`,
      },
      {
        id: 2,
        label: `Item 2`,
      },
      {
        id: 3,
        label: `Item 3`,
      },
      {
        id: 4,
        label: `Item 4`,
      },
      {
        id: 5,
        label: `Item 5`,
      },
    ];

    const reallySimpleInfiniteScrollClassName = "infinite-scroll";
    const onInfiniteLoad = jest.fn();

    const { container } = render(
      <ReallySimpleInfiniteScroll
        reallySimpleInfiniteScrollClassName={
          reallySimpleInfiniteScrollClassName
        }
        hasMore
        length={items.length}
        loadingComponent={<div>Loading...</div>}
        isInfiniteLoading={false}
        onInfiniteLoad={onInfiniteLoad}
        // This is just to mock the case when the threshold is not reached as in jsdom layout calculations are 0 by design.
        infiniteLoadBeginEdgeOffset={-1}
      >
        {items.map(item => (
          <div key={item.id}>{item.label}</div>
        ))}
      </ReallySimpleInfiniteScroll>
    );

    const infiniteScrollElement = container.querySelector(
      `.${reallySimpleInfiniteScrollClassName}`
    );

    fireEvent.scroll(infiniteScrollElement);

    expect(onInfiniteLoad).not.toHaveBeenCalled();
  });
});
