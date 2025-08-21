import { useSidebarWidth } from "@/context/sidebarContext";
import { useWindowDimensions } from "react-native";

const MAX_CARD_WIDTH = 100;
const MIN_CARD_WIDTH = 100;
const COLUMN_GAP = 20;
const HORIZONTAL_PADDING = 60;

export function useResponsiveCardSize() {
  const { width: screenWidth } = useWindowDimensions();
  const { width: sidebarRawWidth } = useSidebarWidth();

  // Convert sidebar width to pixel
  let sidebarWidth: number;
  if (typeof sidebarRawWidth === "string" && sidebarRawWidth.endsWith("%")) {
    const percent = parseFloat(sidebarRawWidth) / 100;
    sidebarWidth = screenWidth * percent;
  } else if (typeof sidebarRawWidth === "number") {
    sidebarWidth = sidebarRawWidth;
  } else {
    sidebarWidth = screenWidth * 0.2; // default fallback (20%)
  }

  const availableWidth = screenWidth - sidebarWidth - HORIZONTAL_PADDING;

  let colCount = Math.floor(
    (availableWidth + COLUMN_GAP) / (MAX_CARD_WIDTH + COLUMN_GAP)
  );
  colCount = Math.max(1, colCount);

  const totalGap = (colCount - 1) * COLUMN_GAP;
  let cardWidth = (availableWidth - totalGap) / colCount;

  // dynamically setting the card width acccording to screen size
  cardWidth = (availableWidth - totalGap) / colCount;
  if (cardWidth < MIN_CARD_WIDTH) {
    cardWidth = availableWidth;
  }
  const cardHeight = cardWidth * 1.4;

  return { cardWidth, cardHeight, colCount };
}
