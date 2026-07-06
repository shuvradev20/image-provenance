export const formatWalletError = (error: any): string => {
  if (!error) return "An unknown error occurred.";

  const errString = typeof error === 'string' ? error : JSON.stringify(error);

  // MetaMask Rejections
  if (errString.includes("4001") || errString.includes("user rejected") || errString.includes("ACTION_REJECTED")) {
    return "Sign in request was cancelled. Please approve the request in MetaMask.";
  }
  
  // Pending Requests
  if (errString.includes("already pending") || errString.includes("-32002")) {
    return "A request is already pending. Please open MetaMask to check.";
  }
  
  // Balance Issues
  if (errString.includes("Insufficient funds")) {
    return "You don't have enough ETH for this transaction.";
  }

  // Contract specific custom errors (ProveNode ABI theke)
  if (errString.includes("NotAuthorized")) {
    return "You are not authorized to perform this action.";
  }
  if (errString.includes("UserNotRegistered")) {
    return "Please register your account first.";
  }
  
  // Default Error
  return "Failed to connect to MetaMask. Please try again.";
};