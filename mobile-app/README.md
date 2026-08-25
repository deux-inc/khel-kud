# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

mobile-app/                                                                                                                      
    ├── src/                                                                                                                         
    │   ├── app/                                # Expo Router: screens, tabs, and layout routes                                      
    │   │   ├── _layout.tsx                     # Root stack navigator and global app providers                                      
    │   │   ├── (tabs)/                         # Bottom tab navigation group                                                        
    │   │   │   ├── _layout.tsx                 # Bottom tab bar configuration (icons, labels, colors)                               
    │   │   │   ├── index.tsx                   # Dashboard/Home tab: welcome banner, quick start, recent games                      
    │   │   │   ├── record.tsx                  # Record tab: active game session, live timer, start/stop tracking                   
    │   │   │   ├── history.tsx                 # History tab: past matches list and search/filter                                   
    │   │   │   └── profile.tsx                 # Profile tab: user stats, personal records, and settings                            
    │   │   └── session/                                                                                                             
    │   │       └── [id].tsx                    # Detailed post-match review and analytics screen for a session                      
    │   │                                                                                                                            
    │   ├── features/                           # Feature-specific components and business logic                                     
    │   │   ├── tracking/                                                                                                            
    │   │   │   ├── components/                 # Live tracking UI: record button, timer display, live metrics                       
    │   │   │   └── hooks/                      # Custom hooks for managing active session state and sensor intervals                
    │   │   └── analytics/                                                                                                           
    │   │       ├── components/                 # Post-game charts, pace graphs, and heatmap views                                   
    │   │       └── utils/                      # Helper functions to calculate averages, top speed, and distance                    
    │   │                                                                                                                            
    │   ├── services/                           # Hardware integrations and persistent storage                                       
    │   │   ├── sensors/                                                                                                             
    │   │   │   ├── location.ts                 # GPS location subscriber and permission handling                                    
    │   │   │   ├── accelerometer.ts            # Accelerometer sensor subscriber for movement intensity                             
    │   │   │   └── sensorManager.ts            # Unified controller to start, pause, and stop all sensor listeners                  
    │   │   └── storage/                                                                                                             
    │   │       └── sessionRepo.ts              # Local database/storage CRUD operations to save and load sessions                   
    │   │                                                                                                                            
    │   ├── components/                         # Shared, reusable UI design system                                                  
    │   │   ├── ui/                                                                                                                  
    │   │   │   ├── Button.tsx                  # Reusable button component with primary, secondary, and danger styles               
    │   │   │   ├── Card.tsx                    # Reusable container card with shadow and borders                                    
    │   │   │   ├── Badge.tsx                   # Small status/sport pill tag (e.g., "Live", "Completed", "Basketball")              
    │   │   │   └── Typography.tsx              # Standardized heading, body, and caption text wrappers                              
    │   │   └── layout/                                                                                                              
    │   │       └── ScreenWrapper.tsx           # SafeAreaView wrapper providing consistent padding and background color             
    │   │                                                                                                                            
    │   ├── types/                              # Shared TypeScript models and interfaces                                            
    │   │   ├── session.ts                      # Type definitions for GameSession, SportType, and SessionStatus                     
    │   │   ├── sensor.ts                       # Type definitions for raw GPS coordinates and accelerometer samples                 
    │   │   └── metrics.ts                      # Type definitions for processed match metrics (distance, speed, zones)              
    │   │                                                                                                                            
    │   ├── constants/                          # Global theme and configuration constants                                           
    │   │   ├── theme.ts                        # Design system colors, spacing, typography scales, and border radii                 
    │   │   └── sports.ts                       # Sport configs and dimensions (e.g. Basketball, Football, Futsal)                   
    │   │                                                                                                                            
    │   └── utils/                              # General helper and formatting functions                                            
    │       ├── time.ts                         # Formatters for elapsed time, stopwatches, and match timestamps                     
    │       └── math.ts                         # Math utilities for distance calculation (Haversine) and speed conversions          
    │
    ├── assets/                                 # Static icons, splash screens, and sport court graphics
    ├── app.json                                # Expo configuration and mobile permission settings
    ├── package.json                            # Project dependencies and run scripts
    └── tsconfig.json 