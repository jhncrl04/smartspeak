import COLORS from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";
import MySearchBar from "./mySearchBar";

type collectionType = "users" | "cards" | "pecsCategories";
type queryType = "newLearner" | "myStudent" | "card" | "category";

type pageProps = {
  pageTitle: string;
  searchPlaceholder: string;
  hasFilter: boolean;
  onSearch: (results: any[]) => void;
  collectionToSearch: collectionType;
  query: queryType;
};

const PageHeader = (props: pageProps) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{props.pageTitle}</Text>
      <View style={styles.filterSearchContainer}>
        {/* {props.hasFilter && <FilterButton />} */}
        <MySearchBar
          placeholder={props.searchPlaceholder}
          onSearch={props.onSearch}
          collectionToSearch={props.collectionToSearch}
          query={props.query}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins",
    fontWeight: "500",

    lineHeight: 24,

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
