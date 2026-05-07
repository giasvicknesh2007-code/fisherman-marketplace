/**
 * Fisherman Marketplace - Production Edition
 * Features: Cloudinary Uploads, Ownership Enforcement, Search/Filter
 * Robust Error Handling for SPA Deployments
 */

// USE RELATIVE URLS for unified deployment (Server & Client on same domain)
const API_BASE_URL = "/api";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800";

// DOM Elements
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const userDisplayEmail = document.getElementById('user-display-email');
const listingsContainer = document.getElementById('listings-container');
const postForm = document.getElementById('post-fish-form');

/**
 * UTILS
 */
async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            // Server returned HTML or something else (likely an error page)
            const text = await response.text();
            console.error("Non-JSON response received:", text.substring(0, 200));
            return { success: false, message: "Server returned unexpected response. Check logs." };
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        return { success: false, message: "Network connection failed." };
    }
}

/**
 * AUTHENTICATION
 */

async function handleAuth(action) {
    const btn = document.getElementById(`${action}-btn`);
    const email = document.getElementById(`${action}-email`).value;
    const password = document.getElementById(`${action}-password`).value;
    const name = action === 'signup' ? document.getElementById('signup-name').value : null;

    if (!email || !password) return alert("Email and password required");

    btn.textContent = action === 'login' ? "Logging in..." : "Creating Account...";
    btn.disabled = true;

    const data = await safeFetch(`${API_BASE_URL}/auth/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === 'signup' ? { name, email, password } : { email, password })
    });

    if (data.success) {
        localStorage.setItem("token", data.token);
        if (action === 'signup') alert("Account created!");
        checkAuthStatus();
    } else {
        alert(data.message);
    }

    btn.textContent = action === 'login' ? "Login" : "Create Account";
    btn.disabled = false;
}

function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    checkAuthStatus();
}

async function checkAuthStatus() {
    const token = localStorage.getItem("token");
    if (!token) {
        loginSection.style.display = 'block';
        mainSection.style.display = 'none';
        return;
    }

    const data = await safeFetch(`${API_BASE_URL}/protected/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (data.success) {
        localStorage.setItem("userId", data.user.id);
        userDisplayEmail.textContent = "Fisherman Session Active";
        loginSection.style.display = 'none';
        mainSection.style.display = 'block';
        loadListings();
    } else {
        handleLogout();
    }
}

/**
 * MARKETPLACE LOGIC
 */

async function postListing(e) {
    e.preventDefault();
    const btn = document.getElementById("submit-fish-btn");
    const token = localStorage.getItem("token");

    const name = document.getElementById("fish-name").value;
    const price = document.getElementById("price").value;
    const location = document.getElementById("district").value;
    const phone = document.getElementById("phone").value;
    const imageFile = document.getElementById("fish-image-file").files[0];

    if (!token) return alert("Please log in");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("location", location);
    formData.append("phone", phone);
    if (imageFile) formData.append("image", imageFile);

    btn.textContent = "Uploading...";
    btn.disabled = true;

    const data = await safeFetch(`${API_BASE_URL}/fish`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    });

    if (data.success) {
        postForm.reset();
        loadListings();
    } else {
        alert(data.message);
    }

    btn.textContent = "Post to Marketplace";
    btn.disabled = false;
}

async function loadListings(filters = {}) {
    listingsContainer.innerHTML = "<p class='empty-msg'>Fetching fresh catch...</p>";

    const params = new URLSearchParams(filters);
    const data = await safeFetch(`${API_BASE_URL}/fish?${params}`);

    listingsContainer.innerHTML = "";

    if (!data.success || !data.data || data.data.length === 0) {
        listingsContainer.innerHTML = `<p class='empty-msg'>${data.message || "No matches found."}</p>`;
        return;
    }

    data.data.forEach((listing) => {
        const isOwner = localStorage.getItem("userId") === (listing.owner?._id || listing.owner);
        const timeAgo = new Date(listing.createdAt).toLocaleDateString();
        
        const div = document.createElement("div");
        div.className = "listing-card";
        div.innerHTML = `
            <img src="${listing.imageUrl || DEFAULT_IMAGE}" class="fish-image" alt="${listing.name}" onerror="this.src='${DEFAULT_IMAGE}'" />
            <div class="listing-info">
                <div class="listing-header">
                    <h4>${listing.name}</h4>
                    <span class="tag">${listing.location}</span>
                </div>
                <p class="price">₹${listing.price} / kg</p>
                <div class="meta">
                    <small>Posted: ${timeAgo}</small>
                    <small>Seller: ${listing.owner?.name || 'Fisherman'}</small>
                </div>
            </div>
            <div class="listing-actions">
                <a href="tel:${listing.phone}" class="btn-secondary" style="text-decoration:none; text-align:center">Call Now</a>
                ${isOwner ? `<button class="btn-danger" onclick="deleteListing('${listing._id}')">Remove</button>` : ''}
            </div>
        `;
        listingsContainer.appendChild(div);
    });
}

window.deleteListing = async function(id) {
    if (!confirm("Remove this listing permanently?")) return;
    const token = localStorage.getItem("token");

    const data = await safeFetch(`${API_BASE_URL}/fish/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (data.success) loadListings();
    else alert(data.message);
};

/**
 * SEARCH & FILTER
 */
document.getElementById('filter-btn').addEventListener('click', () => {
    const search = document.getElementById('search-input').value;
    const location = document.getElementById('location-filter').value;
    loadListings({ search, location });
});

/**
 * EVENTS
 */
document.getElementById('go-to-signup').addEventListener('click', () => {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('signup-view').style.display = 'block';
});

document.getElementById('go-to-login').addEventListener('click', () => {
    document.getElementById('login-view').style.display = 'block';
    document.getElementById('signup-view').style.display = 'none';
});

document.getElementById('signup-btn').addEventListener('click', () => handleAuth('signup'));
document.getElementById('login-btn').addEventListener('click', () => handleAuth('login'));
document.getElementById('logout-btn').addEventListener('click', handleLogout);
postForm.addEventListener('submit', postListing);

checkAuthStatus();
