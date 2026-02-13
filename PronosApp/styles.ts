import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    centered: {
        justifyContent: "center",
        alignItems: "center",
    },
    border : {
        borderWidth: 1,
        borderColor: "darkgray",
    },
    h1: {
        fontSize: 24,
        fontWeight: "bold",
    },
    h2: {
        fontSize: 20,
        fontWeight: "bold",
    },
    h3: {
        fontSize: 16,
        fontWeight: "bold",
    },
    h4: {
        fontSize: 12,
        fontWeight: "bold",
    },
  padded: {
    padding: 3,
  },
  marged : {
    margin: 3,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    width: "100%",
  },
  item: {
    padding: 10,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  fabText: {
    color: "white",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "bold",
  },
});
