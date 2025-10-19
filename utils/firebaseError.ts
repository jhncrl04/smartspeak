// utils/firebaseError.ts
export const getFriendlyAuthError = (code: string): string => {
  switch (code) {
    case "auth/invalid-email":
      return "The email address is not valid. Please check and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/invalid-credential":
      return "Invalid credentials. Please check your email and password";
    default:
      return "Something went wrong. Please try again.";
  }
};

export const getFriendlyRegistrationError = (code: string): string => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "Registration is currently disabled. Please contact support.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/missing-password":
      return "Please enter a password.";
    case "auth/missing-email":
      return "Please enter an email address.";
    case "auth/too-many-requests":
      return "Too many registration attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/popup-closed-by-user":
      return "Sign-up was cancelled. Please try again.";
    case "auth/cancelled-popup-request":
      return "Sign-up was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Pop-up was blocked. Please allow pop-ups and try again.";
    default:
      return "Unable to create account. Please try again.";
  }
};
