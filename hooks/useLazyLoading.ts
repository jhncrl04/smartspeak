import { useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native";

interface VirtualizationConfig {
  itemHeight: number;
  numColumns: number;
  bufferRows?: number; // how many rows before/after viewport to render
}

export const useLazyLoading = <T>(items: T[], config: VirtualizationConfig) => {
  const { itemHeight, numColumns, bufferRows = 2 } = config;
  const [visibleRange, setVisibleRange] = useState({ startRow: 0, endRow: 10 });
  const scrollViewRef = useRef<ScrollView>(null);

  const totalRows = Math.ceil(items.length / numColumns);

  const handleScroll = (event: any) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const screenHeight = event.nativeEvent.layoutMeasurement.height;

    // Current visible row indices
    const startRow = Math.floor(contentOffsetY / itemHeight) - bufferRows;
    const endRow =
      Math.ceil((contentOffsetY + screenHeight) / itemHeight) + bufferRows;

    setVisibleRange({
      startRow: Math.max(0, startRow),
      endRow: Math.min(totalRows, endRow),
    });
  };

  const visibleItems = useMemo(() => {
    const startIndex = visibleRange.startRow * numColumns;
    const endIndex = visibleRange.endRow * numColumns;
    return items.slice(startIndex, endIndex);
  }, [visibleRange, items, numColumns]);

  const topSpacerHeight = visibleRange.startRow * itemHeight;
  const bottomSpacerHeight = (totalRows - visibleRange.endRow) * itemHeight;

  return {
    visibleItems,
    topSpacerHeight,
    bottomSpacerHeight,
    handleScroll,
    scrollViewRef,
  };
};
