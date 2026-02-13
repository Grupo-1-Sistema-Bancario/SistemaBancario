'use strict';

import express, { response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';

const BASE_PATH = '/sistemaBancario/v1';

const middlewars = (app) => {
}

const routes = (app) => {

    app.get(`${BASE_PATH}/Health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'SistemaBancario Server'
        })
    })

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado en el servidor',
            timestamp: new Date().toISOString()
        })
    })
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('trust proxy', 1);

    try {
        await dbConnection();
        middlewars(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`SistemaBancario server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        })
    } catch (error) {
        console.error(`Error starting en Server: ${error.message}`);
        process.exit(1);
    }
}