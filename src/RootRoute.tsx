import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./Home";

export const RootRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/spotify-smart-playlists" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};
