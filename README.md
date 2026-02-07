# Digital Twin for Smart Buildings

A comprehensive digital twin platform for smart buildings that enables real-time monitoring, simulation, anomaly detection, forecasting, and AI-powered optimization of building systems for energy efficiency and occupant comfort.

## Features

### Core Functionality
- **Real-time Dashboard**: Live monitoring of building metrics including energy consumption, temperature, humidity, and occupancy with interactive charts and visualizations
- **3D Building Visualization**: Interactive 3D building model using Three.js for immersive digital twin experience
- **Building Simulation Engine**: Advanced simulation of HVAC systems, occupancy patterns, and thermal dynamics
- **Anomaly Detection**: Real-time detection of system anomalies using machine learning models (Autoencoder and Isolation Forest)
- **Energy & Occupancy Forecasting**: LSTM-based deep learning models for predicting energy consumption and occupancy patterns (24-hour horizon)
- **Smart Suggestions**: AI-powered recommendations for energy optimization with estimated savings calculations
- **AI Chatbot**: Intelligent building assistant powered by HuggingFace's Llama-3.2-3B-Instruct model for natural language queries about building operations
- **WebSocket Integration**: Real-time data streaming and live updates

### Pages & Views
- **Home**: Overview dashboard with key metrics, charts, and chatbot
- **Dashboard**: Detailed analytics with historical data visualization
- **Twin View**: 3D digital twin visualization of the building
- **Analytics**: In-depth data analysis and trends
- **Building Overview**: Building information and specifications
- **Zones & Floors**: Floor-by-floor breakdown of building zones
- **Building Systems**: Status of HVAC, lighting, and other systems
- **Contact**: Support and documentation

### Data Management
- **Time Series Database**: InfluxDB for high-performance sensor data and metrics storage

### Dataset
This project uses the [ASHRAE - Great Energy Predictor III](https://www.kaggle.com/c/ashrae-energy-prediction/data) dataset from Kaggle.

**About the Dataset:**
The dataset contains three years of hourly meter readings from over 1,000 buildings at several different sites around the world. It includes:
- **Building Metadata**: Information about building characteristics (size, usage type, year built)
- **Weather Data**: Hourly weather observations (temperature, humidity, wind speed, etc.)
- **Meter Readings**: Energy consumption data across four meter types:
  - Electricity
  - Chilled Water
  - Steam
  - Hot Water

**Purpose:**
The data is used to build counterfactual energy models - predicting what a building's energy consumption would have been without efficiency improvements. This enables accurate assessment of energy savings from building retrofits and supports better market incentives for energy efficiency investments.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: InfluxDB (time series data)
- **Machine Learning**: TensorFlow/Keras (LSTM, Autoencoder), Scikit-learn (Isolation Forest)
- **Data Processing**: Pandas, NumPy
- **AI/Chatbot**: HuggingFace Inference API (Llama-3.2-3B-Instruct)
- **Real-time**: WebSockets

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **3D Graphics**: Three.js with React Three Fiber (@react-three/fiber, @react-three/drei)
- **Styling**: CSS with dark/light mode support

### Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Containerization**: Docker (optional)
- **Web Server**: Uvicorn/Gunicorn

## Installation

### Prerequisites
- Python 3.11+
- Node.js 16+
- InfluxDB instance (cloud or self-hosted)
- HuggingFace API key (for chatbot)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables (create `.env` file):
   ```env
   INFLUXDB_URL=your_influxdb_url
   INFLUXDB_TOKEN=your_influxdb_token
   INFLUXDB_ORG=your_org
   INFLUXDB_BUCKET=your_bucket
   HUGGINGFACE_API_KEY=your_hf_api_key
   FRONTEND_URL=http://localhost:5173
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup
1. Set up an InfluxDB instance (InfluxDB Cloud recommended)
2. Seed the database with sample data:
   ```bash
   python database/timeseries/influx_init.py --mode seed
   ```

## Usage

1. Start the backend server (runs on port 8000)
2. Start the frontend development server (runs on port 5173)
3. Access the application at `http://localhost:5173`
4. Explore the dashboard to monitor building metrics
5. Interact with the 3D building model in Twin View
6. View anomaly detections and energy forecasts
7. Chat with the AI assistant for building insights
8. Review and apply smart optimization suggestions

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/simulation/*` | Building simulation controls |
| `/anomalies/*` | Anomaly detection and alerts |
| `/suggestions/*` | Smart optimization suggestions |
| `/forecasting/*` | Energy and occupancy forecasts |
| `/historical/*` | Historical data queries |
| `/dashboard/*` | Dashboard metrics |
| `/chat/*` | AI chatbot interface |
| `/ws/*` | WebSocket connections |
| `/docs` | Interactive API documentation (Swagger) |

## Project Structure

```
digital_twin_smart_buildings/
├── backend/                 # Python FastAPI backend
│   ├── api/                # API routes and gateway
│   │   └── routes/         # Individual route modules
│   ├── core/               # Core business logic
│   │   ├── anomaly_engine/ # ML anomaly detection (Autoencoder, Isolation Forest)
│   │   ├── services/       # Data services (InfluxDB, forecasting, WebSocket)
│   │   ├── simulation_engine/ # HVAC, occupancy, thermal simulation
│   │   └── suggestions_engine/ # Energy optimization algorithms
│   └── models/             # Pre-trained ML models (.h5, .pkl)
├── frontend/               # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       │   ├── Chatbot/    # AI chatbot interface
│       │   ├── Dashboard/  # Dashboard widgets
│       │   ├── InteractiveBuilding3D/ # 3D visualization
│       │   └── ...         # Other components
│       ├── pages/          # Application pages
│       └── services/       # API client functions
├── database/               # Database setup and seeding scripts
├── scripts/                # Training and utility scripts
└── docs/                   # Documentation
```
## Live Demo

- **Frontend**: Deployed on Vercel `https://digital-twin-smart-buildings-pvtr.vercel.app/`
- **Backend API**: Deployed on Render at `https://digital-twin-smart-buildings.onrender.com/`

