"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event) => {
  const playlists = ["Hello", "World", "Playlist Cutter"];
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // For CORS support
    },
    body: JSON.stringify(playlists),
  };
};
exports.handler = handler;
