import React from "react";
import {
    StyleSheet,
    Text,
    type TextStyle,
    TouchableOpacity,
    type TouchableOpacityProps,
    type ViewStyle,
} from "react-native";

/*
title - Title of Button
style - Style of Touchable Opacity surroudning text
textStyle - Style of the text
*/
interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const BookWormButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  activeOpacity = 0.8,
  ...rest
}) => {
  return (
    // [style1, style2] will combine styles
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      {...rest}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FB6D0B",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 10,
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BookWormButton;
