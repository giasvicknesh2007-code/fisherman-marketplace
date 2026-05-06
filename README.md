# Fisherman Marketplace Setup Instructions

Follow these steps to get the app running:

## 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it "Fisherman-App".
3. Once the project is ready, click the **Web icon (</>)** to register an app.
4. Copy the `firebaseConfig` object from the setup instructions.
5. Open `app.js` and replace the placeholder `firebaseConfig` with your actual config.

## 2. Firestore Database
1. In the Firebase Sidebar, click **Firestore Database**.
2. Click **Create database**.
3. Choose **Start in test mode** (this allows anyone to read/write for 30 days - perfect for simple testing).
4. Select a location and click **Enable**.

## 3. Running the App
1. You can run this app locally using any web server.
2. If you have VS Code, use the **Live Server** extension.
3. Or, you can just open `index.html` in your browser (Note: Firebase modules require a local server to work correctly due to CORS/Modules).

### Quick local server command (if you have Python installed):
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Features
- **Login**: Just enter a name and phone. It's stored in your browser.
- **Post**: Fill the form to add your fish to the global list.
- **View**: See all fish available. Click "Call" to contact the seller.
