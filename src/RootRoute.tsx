import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Base from "./Base";

export const RootRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/spotify-smart-playlists" element={<Base />} />
      </Routes>
    </BrowserRouter>
  );
};
