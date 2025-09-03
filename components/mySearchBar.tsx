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
  | "assignCategory";

type searchbarProps = {
  placeholder: string;
  onSearch: (results: any[]) => void; // send back results instead of just query
  collectionToSearch: collectionType;
  query: queryType;
};

const MySearchBar = (props: searchbarProps) => {
  const [searchText, setSearchText] = useState("");

  const handleChange = (text: string) => {
    setSearchText(text);
    handleSearch(props.query, text, props.collectionToSearch);
  };

  const handleSearch = async (
    query: string,
    value: string,
    collection: collectionType
  ) => {
    if (!value) {
      props.onSearch([]); // clear results if empty
      return;
    }

    let results: any[] = [];

    switch (props.query) {
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

    console.log("Running query:", props.query);
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
