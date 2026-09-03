# SevaZo Vendor Partner Portal & App

Official merchant onboarding, catalog management, inventory control, and live operations portal for verified SevaZo merchants.

## 🚀 Key Features
- **11-Step Structured Onboarding Wizard**: Multi-category merchant verification (Grocery, Food & Beverage, Pharmacy, Electronics, Fashion, etc.).
- **Real-Time Verification Desk**: Immediate Application ID generation (`SVZ-VND-XXXXXX`), state-driven status tracking, and compliance validation.
- **Dynamic Catalog & Order Management**: Full inventory and order fulfillment management.
- **Cross-Platform**: Powered by React Native (Expo) supporting Android, iOS, and Web.

## 🛠️ Tech Stack
- **Framework**: React Native 0.81 / Expo SDK 54
- **State Management**: Zustand
- **Navigation**: React Navigation v7 (Stack & Bottom Tabs)
- **Validation**: Zod + React Hook Form
- **Styling & UI**: Custom Design System with Dark/Light theme support, Lucide Icons

## 💻 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm or yarn

### Installation
```bash
npm install --legacy-peer-deps
```

### Run Locally
```bash
# Start development server
npm run start

# Web version
npm run web

# Android
npm run android

# iOS
npm run ios
```

### Build for Web / Vercel
```bash
npm run build
```
