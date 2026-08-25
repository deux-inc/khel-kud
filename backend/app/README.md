Structured around FastAPI with clean separation between endpoints, business services, and heavy data processing / ML pipelines.    
                                                                                                                                     
    backend/                                                                                                                         
    ├── app/                                                                                                                         
    │   ├── main.py                   # FastAPI entrypoint & middleware setup                                                        
    │   ├── core/                                                                                                                    
    │   │   ├── config.py             # App settings & env variables (Pydantic Settings)                                             
    │   │   └── security.py           # Auth, JWT, password hashing                                                                  
    │   │                                                                                                                            
    │   ├── api/                      # REST API routes                                                                              
    │   │   ├── v1/                                                                                                                  
    │   │   │   ├── router.py         # Consolidated API v1 router                                                                   
    │   │   │   ├── auth.py           # Login, registration, token refresh                                                           
    │   │   │   ├── sessions.py       # Upload raw session, fetch summaries                                                          
    │   │   │   └── analytics.py      # Query trajectories, heatmaps, aggregates                                                     
    │   │   └── deps.py               # FastAPI dependency injections (DB session, current_user)                                     
    │   │                                                                                                                            
    │   ├── db/                                                                                                                      
    │   │   ├── session.py            # SQLAlchemy engine & session factory                                                          
    │   │   ├── base.py               # Base declarative model class                                                                 
    │   │   └── migrations/           # Alembic migration scripts                                                                    
    │   │                                                                                                                            
    │   ├── models/                   # SQLAlchemy ORM database models                                                               
    │   │   ├── user.py                                                                                                              
    │   │   ├── session.py            # Match session, sport type, duration                                                          
    │   │   └── raw_data.py           # TimescaleDB / PostGIS / JSON storage for sensor data                                         
    │   │                                                                                                                            
    │   ├── schemas/                  # Pydantic models for validation and serialization                                             
    │   │   ├── session.py            # SessionCreate, SessionResponse                                                               
    │   │   └── metrics.py            # HeatmapResponse, TrajectoryResponse                                                          
    │   │                                                                                                                            
    │   ├── services/                 # Business logic layer                                                                         
    │   │   ├── session_service.py    # Session lifecycle & management                                                               
    │   │   └── user_service.py                                                                                                      
    │   │                                                                                                                            
    │   └── processing/               # Data science & processing pipeline                                                           
    │       ├── pipeline.py           # Pipeline orchestrator                                                                        
    │       ├── calibration.py        # Sensor bias correction & orientation alignment                                               
    │       ├── trajectory.py         # 2D court trajectory reconstruction                                                           
    │       ├── heatmaps.py           # Kernel Density Estimation (KDE) / Grid binning                                               
    │       └── sports_rules.py       # Boundaries clamping (e.g. basketball court boundary)                                         
    │                                                                                                                                
    ├── tests/                                                                                                                       
    │   ├── conftest.py                                                                                                              
    │   ├── test_api/                                                                                                                
    │   └── test_processing/                                                                                                         
    ├── requirements.txt / pyproject.toml
    └── Dockerfile