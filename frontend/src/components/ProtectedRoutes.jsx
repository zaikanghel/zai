import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function hasActiveSubscription(subscriptionLevel) {
  const VALID_SUBSCRIPTIONS = ["Nexus", "Enigma", "Quantum Leap"];
  const lowerCaseSubscription = subscriptionLevel?.toLowerCase(); // Handle null/undefined

  return VALID_SUBSCRIPTIONS.some(level => level.toLowerCase() === lowerCaseSubscription);
}


// protect routes that require authentication and check time
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (!user.isVerified) {
    return <Navigate to='/verify-email' replace />;
  }

  if (user.time <= 0) {
    return <Navigate to='/info' replace />;
  }

  return children;
};

const Beta = ({ children }) => {
  const { user } = useAuthStore();

  if (!user || !hasActiveSubscription(user.subscription)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// protect routes that require authentication
const Protected = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (!user.isVerified) {
    return <Navigate to='/verify-email' replace />;
  }

  return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to='/' replace />;
  }

  return children;
};

export { ProtectedRoute, RedirectAuthenticatedUser, Protected, Beta };