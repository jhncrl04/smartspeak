import COLORS from "@/constants/Colors";
import { StyleSheet, TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const MySearchBar = () => {
  return (
    <View style={styles.searchbar}>
      <TextInput style={styles.searchbarInput} placeholder="Search Card" />
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
    gap: 5,

    paddingHorizontal: 10,

    flexGrow: 1,
  },
  searchbarInput: {
    color: COLORS.gray,
    width: "auto",
    fontSize: 16,
  },
});

export default MySearchBar;
