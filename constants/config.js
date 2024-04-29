const corsOption = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    process.env.CLIENT_URL,
  ],
  credentials: true,
};

const APP_TOKEN = "secret-token";

export {corsOption,APP_TOKEN};