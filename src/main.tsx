import { createRoot } from "react-dom/client";
// Poppins: het lettertype van de originele hettaartenhuis.nl (Google Fonts,
// gewichten 300/400/700 + cursief). Eén lettertype voor de hele site, zoals
// het origineel, i.p.v. een apart serif-kopfont.
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/400-italic.css";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
