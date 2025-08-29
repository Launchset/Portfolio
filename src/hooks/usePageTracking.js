// src/hooks/usePageTracking.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        // Don’t track localhost or 127.0.0.1
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            console.log("Skipping GA on local:", location.pathname);
            return;
        }

        if (window.gtag) {
            window.gtag("config", "G-HX8DBNS3QQ", {
                page_path: location.pathname,
            });
        }
    }, [location]);
}
