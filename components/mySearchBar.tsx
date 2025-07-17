import COLORS from "@/constants/Colors";
import { StyleSheet, TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

type searchbarProps = { placeholder: string };

const MySearchBar = (props: searchbarProps) => {
  return (
    <View style={styles.searchbar}>
      <TextInput
        style={styles.searchbarInput}
        placeholder={props.placeholder}
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
