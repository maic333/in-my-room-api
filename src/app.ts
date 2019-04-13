import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { apiRegistryService } from './services/api-registry.service';
import initializeSession from './middleware/initialize-session.middleware';
import jwtAuthentication from './middleware/jwt-authentication.middleware';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({path: '.env'});

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

// Extra middleware
app.use(initializeSession());
app.use(jwtAuthentication());

// Initialize API registry service
apiRegistryService.init(app);

export default app;
