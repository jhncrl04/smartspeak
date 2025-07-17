import COLORS from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";
import FilterButton from "./FilterButton";
import MySearchBar from "./mySearchBar";

type pageProps = { pageTitle: string; searchPlaceholder: string };

const PageHeader = (props: pageProps) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{props.pageTitle}</Text>
      <View style={styles.filterSearchContainer}>
        <FilterButton />
        <MySearchBar placeholder={props.searchPlaceholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins",
    fontWeight: "500",

    color: COLORS.black,
  },
  filterSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",

    width: "45%",

    gap: 20,
  },
});

export default PageHeader;
