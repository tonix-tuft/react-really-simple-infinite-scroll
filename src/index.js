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
} from "js-utl";
import { classNames } from "react-js-utl/utils";

export class ReallySimpleInfiniteScroll extends React.Component {
  constructor(props) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
    this.onScrollStop = debounce(this.onScrollStop.bind(this), 100);

    this.itemsIdsRefsMap = {};
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
    if (prevProps.children.length < this.props.children.length) {
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
                    prevProps.children.length !== this.props.children.length
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
            }
            this.isLoading = false;
        }
  }

  loadingComponentRenderer() {
    const { loadingComponent } = this.props;

    return (
      <div className="really-simple-infinite-scroll-loading-component" key={-2}>
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

  hasScrollbarFunction(axis) {
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

  scrollToId(id) {
    if (this.itemsIdsRefsMap[id] && this.itemsIdsRefsMap[id].current) {
      this.itemsIdsRefsMap[id].current.scrollIntoView();
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
      children,
      displayInverse,
      isInfiniteLoading,
      className,
      hasMore,
    } = this.props;

    return (
      <div
        className={classNames(
          styles.reallySimpleInfiniteScroll,
          "really-simple-infinite-scroll",
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
