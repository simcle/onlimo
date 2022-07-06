require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dir = path.join(__dirname, 'public');
app.use('/public/', express.static(dir));


const authenticateToken = require('./authenticate');

const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const streamingRoutes = require('./src/routes/streaming');
const segmenRoutes = require('./src/routes/segment');
const stationRoutes = require('./src/routes/station');
const statisticRoutes = require('./src/routes/statistics');
const earlyWarningRoutes = require('./src/routes/earlyWarning');
const warningRouters = require('./src/routes/warning');
const loggerRoutes = require('./src/routes/logger');
const pusherRoutes = require('./src/routes/pusher');

app.use('/auth', authRoutes);
app.use('/dashboard', authenticateToken, dashboardRoutes);
app.use('/streamings',authenticateToken, streamingRoutes)
app.use('/segments', authenticateToken, segmenRoutes);
app.use('/stations', authenticateToken, stationRoutes);
app.use('/statistics', authenticateToken, statisticRoutes);
app.use('/earlyWarning', authenticateToken, earlyWarningRoutes);
app.use('/warnings', authenticateToken, warningRouters);
app.use('/logger', authenticateToken, loggerRoutes);
app.use('/pusher', authenticateToken, pusherRoutes);

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.DATA_BASE)
.then(() => {
    app.listen(PORT, () => console.log(`Server listen on port ${PORT}`));
})