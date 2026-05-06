import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcftVAmpLNDaM9XeeS4PsbgjY9eWlYLNU",
    authDomain: "aws1-5fb58.firebaseapp.com",
    projectId: "aws1-5fb58",
    storageBucket: "aws1-5fb58.firebasestorage.app",
    messagingSenderId: "451488715895",
    appId: "1:451488715895:web:b547b21ac82e35fa842272",
    measurementId: "G-GSGKTMCHF6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const userDisplayEmail = document.getElementById('user-display-email');
const listingsContainer = document.getElementById('listings-container');
const postForm = document.getElementById('post-fish-form');

// Fallback image for missing/broken URLs
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800";

/**
 * AUTHENTICATION
 */

async function handleSignup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    if (!email || !password) return alert("Email and password required");

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created!");
    } catch (error) {
        alert(error.message);
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) return alert("Email and password required");

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert(error.message);
    }
}

function handleLogout() {
    signOut(auth);
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        userDisplayEmail.textContent = user.email;
        loginSection.style.display = 'none';
        mainSection.style.display = 'block';
        loadListings();
    } else {
        loginSection.style.display = 'block';
        mainSection.style.display = 'none';
    }
});

/**
 * FIRESTORE LOGIC
 */

async function postListing(e) {
    e.preventDefault();

    const fishName = document.getElementById("fish-name").value;
    const district = document.getElementById("district").value;
    const price = document.getElementById("price").value;
    const phone = document.getElementById("phone").value;
    const imageUrl = document.getElementById("image-url").value;

    const user = auth.currentUser;
    if (!user) return alert("Login required");

    if (!fishName || !district || !price || !phone) {
        alert("All fields required");
        return;
    }

    try {
        await addDoc(collection(db, "listings"), {
            fishName,
            district,
            price,
            phone,
            imageUrl: imageUrl || DEFAULT_IMAGE,
            ownerId: user.uid,
            ownerEmail: user.email,
            createdAt: serverTimestamp()
        });

        console.log("Listing posted with image");
        postForm.reset();
        loadListings(); 
    } catch (error) {
        console.error("Firestore Error:", error);
        alert("Error posting listing");
    }
}

async function loadListings() {
    listingsContainer.innerHTML = "<p class='empty-msg'>Refreshing live feed...</p>";

    try {
        const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        listingsContainer.innerHTML = "";
        
        if (querySnapshot.empty) {
            listingsContainer.innerHTML = "<p class='empty-msg'>No active listings.</p>";
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const listing = documentSnapshot.data();
            const listingId = documentSnapshot.id;
            
            if (!listing.fishName || !listing.district) return;

            const isOwner = auth.currentUser && auth.currentUser.uid === listing.ownerId;
            const displayImage = listing.imageUrl || DEFAULT_IMAGE;

            const div = document.createElement("div");
            div.className = "listing-card";
            div.innerHTML = `
                <img src="${displayImage}" class="fish-image" alt="${listing.fishName}" onerror="this.src='${DEFAULT_IMAGE}'" />
                <div class="listing-info">
                    <h4>${listing.fishName}</h4>
                    <p class="location">${listing.district}</p>
                    <p class="price">₹${listing.price}</p>
                    <small>Seller: ${listing.ownerEmail}</small>
                </div>
                <div class="listing-actions">
                    <a href="tel:${listing.phone}" class="btn-secondary" style="text-decoration:none">Call</a>
                    ${isOwner ? `<button class="btn-danger" onclick="deleteListing('${listingId}')">Delete</button>` : ''}
                </div>
            `;
            listingsContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Load Error:", error);
    }
}

window.deleteListing = async function(id) {
    if (!confirm("Delete this listing?")) return;
    try {
        await deleteDoc(doc(db, "listings", id));
        loadListings();
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Failed to delete");
    }
};

/**
 * EVENT LISTENERS
 */

document.getElementById('go-to-signup').addEventListener('click', () => {
    loginView.style.display = 'none';
    signupView.style.display = 'block';
});

document.getElementById('go-to-login').addEventListener('click', () => {
    loginView.style.display = 'block';
    signupView.style.display = 'none';
});

document.getElementById('signup-btn').addEventListener('click', handleSignup);
document.getElementById('login-btn').addEventListener('click', handleLogin);
document.getElementById('logout-btn').addEventListener('click', handleLogout);
postForm.addEventListener('submit', postListing);
