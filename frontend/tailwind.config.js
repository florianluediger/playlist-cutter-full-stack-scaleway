module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      body: ["Oswald"],
      "playlist-cutter": ["Knewave"],
    },
    extend: {
      animation: {
        "bounce-spin-bounce":
          "bounce-spin-bounce 3s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite",
        "bounce-spin-spin": "bounce-spin-spin 3s linear infinite",
      },
      keyframes: {
        "bounce-spin-spin": {
          "0%, 25%, 100%": { transform: "rotate(0.0deg)" },
          "50%, 75%": { transform: "rotate(180deg)" },
        },
        "bounce-spin-bounce": {
          "0%, 5%, 20%, 55%, 70%, 100%": { top: "0px" },
          "12.5%, 62.5%": { top: "20px" },
        },
      },
    },
  },
  plugins: [],
};
