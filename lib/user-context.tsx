"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface UserContextType {
  dealerDiscount: number | null;
  isDealer: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  dealerDiscount: null,
  isDealer: false,
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [dealerDiscount, setDealerDiscount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.dealerDiscount != null) {
          setDealerDiscount(data.dealerDiscount);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider
      value={{
        dealerDiscount,
        isDealer: dealerDiscount !== null,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
