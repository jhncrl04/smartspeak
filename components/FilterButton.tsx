import COLORS from "@/constants/Colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Octicons";

const FilterButton = () => {
  return (
    <TouchableOpacity style={styles.filterButton}>
      <Text style={styles.buttonText}>Filter</Text>
      <Icon name="filter" size={20} color={COLORS.gray} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    gap: 10,

    borderColor: COLORS.gray,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: COLORS.gray,
    fontSize: 16,

    letterSpacing: 0.5,
    fontWeight: 500,
  },
});

export default FilterButton;
