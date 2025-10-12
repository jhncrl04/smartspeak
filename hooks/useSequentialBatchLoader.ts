import { useEffect, useState } from "react";

interface Options {
  batchSize?: number;
  delay?: number; // optional delay between batches (ms)
}

export const useSequentialBatchLoader = <T>(
  items: T[],
  { batchSize = 50, delay = 500 }: Options = {}
) => {
  const [visibleCount, setVisibleCount] = useState(batchSize);

  useEffect(() => {
    if (visibleCount >= items.length) return;

    const timer = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
    }, delay);

    return () => clearTimeout(timer);
  }, [visibleCount, items.length, batchSize, delay]);

  const visibleItems = items.slice(0, visibleCount);
  const isDone = visibleCount >= items.length;

  return { visibleItems, isDone };
};
