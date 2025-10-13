import COLORS from "@/constants/Colors";
import { searchAddLearner } from "@/services/userService";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

type collectionType = "users" | "cards" | "pecsCategories";
type queryType =
  | "newLearner"
  | "myStudent"
  | "card"
  | "category"
  | "assignCategory"
  | "local"; // ➕ for local filtering

type searchbarProps = {
  placeholder: string;
  onSearch: (results: any[] | string) => void; // local → string, remote → array
  collectionToSearch?: collectionType; // optional if local
  query?: queryType;
};

const MySearchBar = (props: searchbarProps) => {
  const [searchText, setSearchText] = useState("");

  const handleChange = (text: string) => {
    setSearchText(text);

    if (props.query === "local") {
      // ✅ For MessageScreen → just send query string
      props.onSearch(text);
    } else {
      // ✅ For Firestore/DB search
      handleSearch(props.query as queryType, text, props.collectionToSearch!);
    }
  };

  const handleSearch = async (
    query: queryType,
    value: string,
    collection: collectionType
  ) => {
    if (!value) {
      props.onSearch([]); // clear results if empty
      return;
    }

    let results: any[] = [];

    switch (query) {
      case "newLearner":
        results = await searchAddLearner(collection, value);
        break;

      case "myStudent":
        // implement searchMyStudents(collection, value);
        break;

      case "card":
        // implement searchCard(collection, value);
        break;

      case "category":
        // implement searchCategory(collection, value);
        break;
    }

    console.log("Running query:", query);
    props.onSearch(results);
  };

  return (
    <View style={styles.searchbar}>
      <TextInput
        style={styles.searchbarInput}
        placeholder={props.placeholder}
        value={searchText}
        onChangeText={handleChange}
      />
      <Icon name="search" size={24} color={COLORS.gray} />
    </View>
  );
};

const styles = StyleSheet.create({
  searchbar: {
    borderColor: COLORS.gray,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 10,
    flexGrow: 1,
  },
  searchbarInput: {
    color: COLORS.gray,
    textAlign: "right",
    flex: 1,
    fontSize: 16,
  },
});

export default MySearchBar;
