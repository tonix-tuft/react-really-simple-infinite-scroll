/*
 * Copyright (c) 2021 Anton Bagdatyev (Tonix)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import styles from "./styles.scss";
import {
  isUndefined,
  hasVerticalScrollbar,
  hasHorizontalScrollbar,
  isInt,
  debounce,
  noOpFn,
} from "js-utl";
import { classNames } from "react-js-utl/utils";

export class ReallySimpleInfiniteScroll extends React.Component {
  constructor(props) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
    this.onScrollStop = debounce(this.onScrollStop.bind(this), 100);

    this.componentDidUpdateHasScrolledToStart = false;
    this.isLoading = false;
    this.isScrolling = false;
    this.lastScrollStopPromise = null;
    this.lastScrollStopPromiseResolve = null;

    this.node = React.createRef();
  }

  componentDidMount() {
    this.scrollToStart();
  }

  getNode() {
    return this.node && this.node.current;
  }

  getSnapshotBeforeUpdate(prevProps) {
    const doesNotHaveChildren = !this.props.children;
    if (
      doesNotHaveChildren
        ? prevProps.length < this.props.length
        : prevProps.children.length < this.props.children.length
    ) {
      const list = this.node.current;
      const axis = this.axis();
      const scrollDimProperty = this.scrollDimProperty(axis);
      const scrollProperty = this.scrollProperty(axis);
      const scrollDelta = list[scrollDimProperty] - list[scrollProperty];

      return {
        scrollDelta,
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const doesNotHaveChildren = !this.props.children;
    if (
      doesNotHaveChildren
        ? prevProps.length !== this.props.length
        : prevProps.children.length !== this.props.children.length
    ) {
      if (!this.componentDidUpdateHasScrolledToStart) {
        this.scrollToStart();
        this.componentDidUpdateHasScrolledToStart = true;
      }
    }

    // prettier-ignore
    if (
        this.isLoading &&
        (
            (prevProps.isInfiniteLoading && !this.props.isInfiniteLoading)
            // eslint-disable-next-line operator-linebreak
            ||
            (
                (this.props.hasMore || prevProps.hasMore)
                // eslint-disable-next-line operator-linebreak
                &&
                (
                  !this.props.children ? prevProps.length !== this.props.length
                    : prevProps.children.length !== this.props.children.length
                )
            )
        )
    ) {
        if (this.props.displayInverse && snapshot) {
          const list = this.node.current;
          const axis = this.axis();
          const scrollDimProperty = this.scrollDimProperty(axis);
          const scrollProperty = this.scrollProperty(axis);
          const scrollDelta = snapshot.scrollDelta;
          const scrollTo = list[scrollDimProperty] - scrollDelta;

          this.scrollTo(scrollProperty, scrollTo);
        } else {
          noOpFn();
        }
        this.isLoading = false;
    }
  }

  loadingComponentRenderer() {
    const {
      loadingComponent,
      reallySimpleInfiniteScrollLoadingComponentClassName = "really-simple-infinite-scroll-loading-component",
    } = this.props;

    return (
      <div
        className={reallySimpleInfiniteScrollLoadingComponentClassName}
        key={-2}
      >
        {loadingComponent}
      </div>
    );
  }

  axis() {
    return this.props.axis === "x" ? "x" : "y";
  }

  scrollProperty(axis) {
    return axis === "y" ? "scrollTop" : "scrollLeft";
  }

  offsetProperty(axis) {
    return axis === "y" ? "offsetHeight" : "offsetWidth";
  }

  clientDimProperty(axis) {
    return axis === "y" ? "clientHeight" : "clientWidth";
  }

  scrollDimProperty(axis) {
    return axis === "y" ? "scrollHeight" : "scrollWidth";
  }

  static hasScrollbarFunction(axis) {
    return axis === "y" ? hasVerticalScrollbar : hasHorizontalScrollbar;
  }

  scrollToStart() {
    const axis = this.axis();
    this.scrollTo(
      this.scrollProperty(axis),
      !this.props.displayInverse ? 0 : this.scrollDimProperty(axis)
    );
  }

  scrollToEnd() {
    const axis = this.axis();
    this.scrollTo(
      this.scrollProperty(axis),
      !this.props.displayInverse ? this.scrollDimProperty(axis) : 0
    );
  }

  scrollTo(scrollProperty, scrollPositionOrPropertyOfScrollable) {
    const scrollableContentNode = this.node.current;
    if (scrollableContentNode) {
      scrollableContentNode[scrollProperty] = isInt(
        scrollPositionOrPropertyOfScrollable
      )
        ? scrollPositionOrPropertyOfScrollable
        : scrollableContentNode[scrollPositionOrPropertyOfScrollable];
    }
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#parameters
   */
  scrollToId(id, { alignToTop = true, scrollIntoViewOptions = void 0 } = {}) {
    if (this.props?.itemIdRefMap?.[id]?.current) {
      this.props.itemIdRefMap[id].current.scrollIntoView(
        scrollIntoViewOptions || alignToTop
      );
    }
  }

  scrollStopPromise() {
    return (
      (this.isScrolling && this.lastScrollStopPromise) || Promise.resolve()
    );
  }

  onScrollStop(callback) {
    callback();
    this.isScrolling = false;
    this.lastScrollStopPromise = null;
    this.lastScrollStopPromiseResolve = null;
  }

  handleScroll(e) {
    const {
      isInfiniteLoading,
      hasMore,
      infiniteLoadBeginEdgeOffset,
      displayInverse,
    } = this.props;

    this.isScrolling = true;
    this.lastScrollStopPromise =
      this.lastScrollStopPromise ||
      new Promise(resolve => {
        this.lastScrollStopPromiseResolve = resolve;
      });
    this.onScrollStop(() => {
      this.lastScrollStopPromiseResolve && this.lastScrollStopPromiseResolve();
    });

    this.props.onScroll && this.props.onScroll(e);

    if (
      this.props.onInfiniteLoad &&
      (!isUndefined(hasMore) ? hasMore : !isInfiniteLoading) &&
      this.node.current &&
      !this.isLoading
    ) {
      const axis = this.axis();
      const scrollableContentNode = this.node.current;
      const scrollProperty = this.scrollProperty(axis);
      const offsetProperty = this.offsetProperty(axis);
      const scrollDimProperty = this.scrollDimProperty(axis);
      const currentScroll = scrollableContentNode[scrollProperty];
      const currentDim = scrollableContentNode[offsetProperty];
      const scrollDim = scrollableContentNode[scrollDimProperty];

      const finalInfiniteLoadBeginEdgeOffset = !isUndefined(
        infiniteLoadBeginEdgeOffset
      )
        ? infiniteLoadBeginEdgeOffset
        : currentDim / 2;

      let thresoldWasReached = false;
      if (!displayInverse) {
        const clientDimProperty = this.clientDimProperty(axis);
        const clientDim = scrollableContentNode[clientDimProperty];
        thresoldWasReached =
          currentScroll + clientDim + finalInfiniteLoadBeginEdgeOffset >=
          scrollDim;
      } else {
        thresoldWasReached = currentScroll <= finalInfiniteLoadBeginEdgeOffset;
      }
      if (thresoldWasReached) {
        this.isLoading = true;
        this.props.onInfiniteLoad();
      }
    }
  }

  render() {
    const {
      children = void 0,
      displayInverse,
      isInfiniteLoading,
      className,
      reallySimpleInfiniteScrollClassName = "really-simple-infinite-scroll",
      hasMore,
    } = this.props;

    return (
      <div
        className={classNames(
          styles.reallySimpleInfiniteScroll,
          reallySimpleInfiniteScrollClassName,
          className
        )}
        ref={this.node}
        onScroll={this.handleScroll}
        onMouseOver={this.props.onInfiniteScrollMouseOver}
        onMouseOut={this.props.onInfiniteScrollMouseOut}
        onMouseEnter={this.props.onInfiniteScrollMouseEnter}
        onMouseLeave={this.props.onInfiniteScrollMouseLeave}
      >
        {(hasMore || isInfiniteLoading) &&
          displayInverse &&
          this.loadingComponentRenderer()}
        {children}
        {(hasMore || isInfiniteLoading) &&
          !displayInverse &&
          this.loadingComponentRenderer()}
      </div>
    );
  }
}
