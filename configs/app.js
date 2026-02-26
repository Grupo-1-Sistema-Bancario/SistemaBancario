'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { errorHandler } from '../middlewares/handle-errors.js';
import userRoutes from '../src/users/user.routes.js';
import favoriteRoutes from '../src/favorites/favorite.routes.js';
import productRoutes from '../src/products/product.routes.js'
import transactionRoutes from '../src/transactions/transaction.routes.js';
import {seedBankAccount} from './server.js';

const BASE_PATH = '/api/v1/bank';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(requestLimit);
    app.use(morgan('dev'));
}

const routes = (app) => {
    app.use(`${BASE_PATH}/users`, userRoutes);
    app.use(`${BASE_PATH}/favorites`, favoriteRoutes);
    app.use(`${BASE_PATH}/products`, productRoutes);
    app.use(`${BASE_PATH}/transactions`, transactionRoutes);

    app.get(`${BASE_PATH}/health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Banking System Core Server'
        })
    })

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado en el servidor bancario'
        })
    })
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3000;
    app.set('trust proxy', 1);

    try {
        await dbConnection();
        await seedBankAccount();
        middlewares(app);
        routes(app);

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Banking server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        })
    } catch (error) {
        console.error(`Error starting Banking Server: ${error.message}`);
        process.exit(1);
    }
}