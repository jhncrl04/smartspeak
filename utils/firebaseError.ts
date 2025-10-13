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
