import { Keyboard } from "react-native";
import { KEYBOARD_CLOSE_DELAY } from "../../constants/constants";

/**
 * Helper function to close the keyboard and then execute a callback
 * Needed because KeyboardAvoidingView does not always close the keyboard correctly
 * @param callback The function to execute after the keyboard is closed
 */
export function closeKeyboardThen(callback: () => void) {
  if (Keyboard.isVisible()) {
    Keyboard.dismiss();
    setTimeout(() => {
      callback();
    }, KEYBOARD_CLOSE_DELAY);
  } else {
    callback();
  }
}
