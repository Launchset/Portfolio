import Cookies from "js-cookie";

// set cookie (expires in 7 days)
export const setTheme = (value) =>
  Cookies.set("theme", value, { expires: 7, sameSite: "Lax" });

// read cookie
export const getTheme = () => Cookies.get("theme");

// delete cookie
export const clearTheme = () => Cookies.remove("theme");
