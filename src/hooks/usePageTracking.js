// src/hooks/usePageTracking.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return;
    }

    if (window.gtag) {
      window.gtag("config", "G-HX8DBNS3QQ", {
        page_path: `${location.pathname}${location.hash}`,
      });
    }
  }, [location.hash, location.pathname]);
}
