import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Round1 from "./Pages/Round1";
import Round2 from "./Pages/Round2";
import Round3 from "./Pages/Round3";
import Round4 from "./Pages/Round4";
import Round5 from "./Pages/Round5";
import Round6 from "./Pages/Round6";
import Overall from "./Pages/Overall";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <nav
          style={{
            padding: "10px",
            backgroundColor: "#0a1428",
            overflowX: "auto",     // ✅ allows horizontal swipe
            whiteSpace: "nowrap",  // ✅ keeps items in one line
          }}
        >
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              gap: "15px",
              margin: 0,
              padding: 0,
              flexWrap: "nowrap",   // ✅ stops wrapping to 2 lines
            }}
          >
            <li><Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link></li>
            <li><Link to="/round1" style={{ color: "white", textDecoration: "none" }}>Round 1</Link></li>
            <li><Link to="/round2" style={{ color: "white", textDecoration: "none" }}>Round 2</Link></li>
            <li><Link to="/round3" style={{ color: "white", textDecoration: "none" }}>Round 3</Link></li>
            <li><Link to="/round4" style={{ color: "white", textDecoration: "none" }}>Round 4</Link></li>
            <li><Link to="/round5" style={{ color: "white", textDecoration: "none" }}>Round 5</Link></li>
            <li><Link to="/round6" style={{ color: "white", textDecoration: "none" }}>Round 6</Link></li>
            <li><Link to="/overall" style={{ color: "white", textDecoration: "none" }}>Overall</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <h1 style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
                Welcome to the Golf Tournament
              </h1>
            }
          />
          <Route path="/round1" element={<Round1 />} />
          <Route path="/round2" element={<Round2 />} />
          <Route path="/round3" element={<Round3 />} />
          <Route path="/round4" element={<Round4 />} />
          <Route path="/round5" element={<Round5 />} />
          <Route path="/round6" element={<Round6 />} />
          <Route path="/overall" element={<Overall />} />
        </Routes>
      </div>
    </Router>
  );
}
