require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { testConnection } = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const sosRoutes = require("./routes/sosRoutes");
const reportRoutes = require("./routes/reportRoutes");
const setupWebSocket = require("./websocket/locationWs");
const { startPolling } = require("./telegram/botHandler");

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
	}),
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
	res
		.status(404)
		.json({ error: `Маршрут ${req.method} ${req.path} не найден` });
});

app.use(errorHandler);

setupWebSocket(server);

const PORT = process.env.PORT || 3001;

const start = async () => {
	await testConnection();
	startPolling();
	server.listen(PORT, () => {
		console.log(`Сервер запущен на http://localhost:${PORT}`);
	});
};

start();
