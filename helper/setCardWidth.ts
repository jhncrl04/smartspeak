import { useSidebarWidth } from "@/context/sidebarContext";
import { useWindowDimensions } from "react-native";

const MAX_CARD_WIDTH = 125;
const MIN_CARD_WIDTH = 100;
const COLUMN_GAP = 20;
const HORIZONTAL_PADDING = 60;

export function useResponsiveCardSize() {
  const { width: screenWidth } = useWindowDimensions();
  const { width: sidebarRawWidth } = useSidebarWidth();

  // Sidebar width in px
  let sidebarWidth: number;
  if (typeof sidebarRawWidth === "string" && sidebarRawWidth.endsWith("%")) {
    const percent = parseFloat(sidebarRawWidth) / 100;
    sidebarWidth = screenWidth * percent;
  } else if (typeof sidebarRawWidth === "number") {
    sidebarWidth = sidebarRawWidth;
  } else {
    sidebarWidth = screenWidth * 0.2; // fallback (20%)
  }

  const availableWidth = screenWidth - sidebarWidth - HORIZONTAL_PADDING;

  // First, assume maximum column count
  let colCount = Math.floor(
    (availableWidth + COLUMN_GAP) / (MAX_CARD_WIDTH + COLUMN_GAP)
  );
  colCount = Math.max(1, colCount);

  // Recompute width with this colCount
  const totalGap = (colCount - 1) * COLUMN_GAP;
  let cardWidth = (availableWidth - totalGap) / colCount;

  // ✅ If cardWidth gets too small, reduce colCount until it fits
  while (cardWidth < MIN_CARD_WIDTH && colCount > 1) {
    colCount -= 1;
    const totalGapNew = (colCount - 1) * COLUMN_GAP;
    cardWidth = (availableWidth - totalGapNew) / colCount;
  }

  // ✅ Clamp cardWidth between MIN and MAX
  // cardWidth = Math.min(Math.max(cardWidth, MIN_CARD_WIDTH), MAX_CARD_WIDTH);

  const cardHeight = cardWidth * 1.4;

  return { cardWidth, cardHeight, colCount };
}
