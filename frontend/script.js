const API_URL = "http://localhost:5000/api";

// ===============================
// TOAST NOTIFICATION SYSTEM (ES6+)
// ===============================
const showToast = (message, type = "info") => {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
    toast.textContent = `${icon} ${message}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-hide");
        setTimeout(() => toast.remove(), 300);
    }, 3200);
};


// ===============================
// AUTH STATE HELPER
// ===============================
const getAuthData = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    let user = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    } catch {
        user = null;
    }
    return { token, user };
};

const updateNavbarState = () => {
    const { token, user } = getAuthData();
    const nav = document.querySelector("nav");
    if (!nav) return;

    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll("a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    if (token && user) {
        const loginLink = Array.from(nav.querySelectorAll("a")).find(a => a.getAttribute("href") === "login.html");
        const registerLink = Array.from(nav.querySelectorAll("a")).find(a => a.getAttribute("href") === "register.html");
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";
    }
};


// ===============================
// LOGIN
// ===============================
const loginUser = async () => {
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        showToast("Please enter email and password", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Login failed", "error");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showToast("Login successful! Welcome back.", "success");

        setTimeout(() => {
            if (data.user?.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "dashboard.html";
            }
        }, 500);

    } catch (error) {
        showToast("Login failed. Check server connection.", "error");
    }
};


// ===============================
// REGISTER
// ===============================
const registerUser = async () => {
    const name = document.getElementById("name")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;

    if (!name || !email || !password) {
        showToast("Please fill all fields", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Registration failed", "error");
            return;
        }

        showToast("Registration successful! Redirecting to login...", "success");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);

    } catch (error) {
        showToast("Registration failed. Check server connection.", "error");
    }
};


// ===============================
// REPORT ITEM
// ===============================
const reportItem = async () => {
    const { token } = getAuthData();

    if (!token) {
        showToast("Please login first to report an item", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);
        return;
    }

    const itemName = document.getElementById("itemName")?.value?.trim();
    const category = document.getElementById("category")?.value;
    const description = document.getElementById("description")?.value?.trim();
    const location = document.getElementById("location")?.value?.trim();
    const date = document.getElementById("date")?.value;
    const type = document.getElementById("type")?.value;
    const image = document.getElementById("image")?.value?.trim();

    if (!itemName || !category || !description || !location || !date || !type) {
        showToast("Please fill all required fields", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                itemName,
                category,
                description,
                location,
                date,
                type,
                image
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Failed to report item", "error");
            return;
        }

        showToast("Item reported successfully!", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);

    } catch (error) {
        showToast("Failed to report item. Please try again.", "error");
    }
};


// ===============================
// LOAD ITEMS
// ===============================
const loadItems = async () => {
    const itemsContainer = document.getElementById("itemsContainer") || document.getElementById("itemsList");

    if (!itemsContainer) return;

    itemsContainer.innerHTML = "<p class='empty-state'>Loading campus listings...</p>";

    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();

        displayItems(items);

    } catch (error) {
        itemsContainer.innerHTML = "<p class='empty-state'>Failed to load items. Make sure your backend server is running.</p>";
    }
};


// ===============================
// DISPLAY ITEMS (Modern Card Layout & Modal Support)
// ===============================
let currentLoadedItems = [];

const openItemModal = (itemId) => {
    const item = currentLoadedItems.find(i => i._id === itemId);
    if (!item) return;

    const modal = document.getElementById("itemDetailModal");
    const modalTitle = document.getElementById("modalItemTitle");
    const modalBody = document.getElementById("modalItemBody");

    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = item.itemName || "Item Details";

    const imageHtml = item.image
        ? `<div style="text-align: center; margin-bottom: 16px;"><img src="${item.image}" alt="${item.itemName}" style="max-height: 220px; max-width: 100%; border-radius: 8px; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" onerror="this.style.display='none';"></div>`
        : "";

    modalBody.innerHTML = `
        ${imageHtml}
        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
            <span class="type-pill ${item.type}">${item.type}</span>
            <span class="status ${item.status}">${item.status}</span>
            <span class="val-tag" style="background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-weight: 600;">${item.category}</span>
        </div>
        <div class="item-card-details">
            <div class="item-detail-row">
                <span class="label-tag">Description:</span>
                <span class="val-tag">${item.description || "No description provided."}</span>
            </div>
            <div class="item-detail-row">
                <span class="label-tag">Location Found/Lost:</span>
                <span class="val-tag">${item.location || "N/A"}</span>
            </div>
            <div class="item-detail-row">
                <span class="label-tag">Date Reported:</span>
                <span class="val-tag">${formatDate(item.date)}</span>
            </div>
        </div>
        <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
            ${item.status === "active" ? `<button class="claim-btn" onclick="closeItemModal(); showClaimForm('${item._id}')">Proceed to Claim</button>` : ""}
            <button type="button" class="btn-cancel" onclick="closeItemModal()">Close</button>
        </div>
    `;

    modal.style.display = "flex";
};

const closeItemModal = () => {
    const modal = document.getElementById("itemDetailModal");
    if (modal) modal.style.display = "none";
};

window.openItemModal = openItemModal;
window.closeItemModal = closeItemModal;

const updateItemBadgeCount = (count) => {
    const badge = document.getElementById("itemCounterBadge");
    if (badge) {
        badge.textContent = `${count} ${count === 1 ? 'record' : 'records'} found`;
    }
    const heroLiveCount = document.getElementById("heroLiveCount");
    if (heroLiveCount) {
        heroLiveCount.textContent = `Connected (${count} active ${count === 1 ? 'item' : 'items'})`;
    }
};

const displayItems = (items) => {
    const itemsContainer = document.getElementById("itemsContainer") || document.getElementById("itemsList");

    if (!itemsContainer) return;

    itemsContainer.innerHTML = "";
    currentLoadedItems = Array.isArray(items) ? items : [];

    updateItemBadgeCount(currentLoadedItems.length);

    if (!Array.isArray(items) || items.length === 0) {
        itemsContainer.innerHTML = "<p class='empty-state'>No items found matching your filter criteria</p>";
        return;
    }

    items.forEach((item) => {
        const card = document.createElement("div");
        card.className = `item-card type-${item.type || 'other'}`;

        const claimButton = item.status === "active"
            ? `<button class="claim-btn" onclick="showClaimForm('${item._id}')">Claim Item</button>`
            : "";

        const imageTag = item.image
            ? `<img src="${item.image}" alt="${item.itemName}" onerror="this.style.display='none';">`
            : "";

        card.innerHTML = `
            <div class="item-card-inner">
                <div class="item-card-header">
                    <h3>${item.itemName}</h3>
                    <span class="type-pill ${item.type}">${item.type}</span>
                </div>

                ${imageTag}

                <div class="item-card-details">
                    <div class="item-detail-row">
                        <span class="label-tag">Category:</span>
                        <span class="val-tag">${item.category}</span>
                    </div>

                    <div class="item-detail-row">
                        <span class="label-tag">Description:</span>
                        <span class="val-tag">${item.description}</span>
                    </div>

                    <div class="item-detail-row">
                        <span class="label-tag">Location:</span>
                        <span class="val-tag">${item.location}</span>
                    </div>

                    <div class="item-detail-row">
                        <span class="label-tag">Date:</span>
                        <span class="val-tag">${formatDate(item.date)}</span>
                    </div>

                    <div class="item-detail-row" style="margin-top: 6px;">
                        <span class="label-tag">Status:</span>
                        <span class="val-tag"><span class="status ${item.status}">${item.status}</span></span>
                    </div>
                </div>
            </div>

            <div class="item-card-actions">
                <button type="button" class="details-btn" onclick="openItemModal('${item._id}')">Quick View</button>
                ${claimButton}
            </div>
        `;

        itemsContainer.appendChild(card);
    });
};


// ===============================
// DATE FORMAT
// ===============================
const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};


// ===============================
// SEARCH AND FILTER
// ===============================
const searchItems = async () => {
    const search = (document.getElementById("searchInput")?.value || document.getElementById("search")?.value || "").trim();
    const category = document.getElementById("categoryFilter")?.value || "";
    const location = document.getElementById("locationFilter")?.value?.trim() || "";
    const type = document.getElementById("typeFilter")?.value || "";
    const sort = document.getElementById("dateSort")?.value || "";

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    if (type) params.append("type", type);

    try {
        const response = await fetch(`${API_URL}/items?${params.toString()}`);
        let items = await response.json();

        if (Array.isArray(items)) {
            if (sort === "newest") {
                items.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else if (sort === "oldest") {
                items.sort((a, b) => new Date(a.date) - new Date(b.date));
            }

            displayItems(items);
        }

    } catch (error) {
        showToast("Failed to search items", "error");
    }
};

const debounce = (func, delay = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};


// ===============================
// SHOW CLAIM FORM
// ===============================
const showClaimForm = (itemId) => {
    const claimSection = document.getElementById("claimSection");
    const claimItemId = document.getElementById("claimItemId");

    if (claimSection && claimItemId) {
        claimItemId.value = itemId;
        claimSection.style.display = "block";
        claimSection.scrollIntoView({ behavior: "smooth" });
        showToast("Please fill out the claim details below.", "info");
    }
};


// ===============================
// SUBMIT CLAIM
// ===============================
const submitClaim = async () => {
    const { token } = getAuthData();

    if (!token) {
        showToast("Please login first to submit a claim", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);
        return;
    }

    const item = document.getElementById("claimItemId")?.value;
    const message = document.getElementById("claimMessage")?.value?.trim();

    if (!message) {
        showToast("Please enter a verification message for the claim", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/claims`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ item, message })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Failed to submit claim", "error");
            return;
        }

        showToast("Claim submitted successfully! Waiting for admin review.", "success");
        const claimMsgInput = document.getElementById("claimMessage");
        if (claimMsgInput) claimMsgInput.value = "";

        const claimSection = document.getElementById("claimSection");
        if (claimSection) claimSection.style.display = "none";

        loadItems();

    } catch (error) {
        showToast("Failed to submit claim", "error");
    }
};


// ===============================
// USER DASHBOARD
// ===============================
const loadDashboard = async () => {
    const { token, user } = getAuthData();

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const welcomeEl = document.getElementById("welcomeMessage");
    if (welcomeEl && user?.name) {
        welcomeEl.textContent = `Welcome back, ${user.name} (${user.email || ""})`;
    }

    loadMyItems();
    loadMyClaims();
};


// ===============================
// MY ITEMS
// ===============================
const loadMyItems = async () => {
    const { token, user } = getAuthData();

    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();

        const myItems = Array.isArray(items)
            ? items.filter((item) => item.reportedBy && (item.reportedBy._id === user?.id || item.reportedBy === user?.id))
            : [];

        const container = document.getElementById("myListings") || document.getElementById("myItems");
        if (!container) return;

        container.innerHTML = "";

        if (myItems.length === 0) {
            container.innerHTML = "<p class='empty-state'>You haven't reported any items yet</p>";
            return;
        }

        myItems.forEach((item) => {
            const card = document.createElement("div");
            card.className = `item-card type-${item.type || 'other'}`;

            const imageTag = item.image
                ? `<img src="${item.image}" alt="${item.itemName}" onerror="this.style.display='none';">`
                : "";

            card.innerHTML = `
                <div class="item-card-inner">
                    <div class="item-card-header">
                        <h3>${item.itemName}</h3>
                        <span class="type-pill ${item.type}">${item.type}</span>
                    </div>

                    ${imageTag}

                    <div class="item-card-details">
                        <div class="item-detail-row">
                            <span class="label-tag">Category:</span>
                            <span class="val-tag">${item.category}</span>
                        </div>

                        <div class="item-detail-row">
                            <span class="label-tag">Description:</span>
                            <span class="val-tag">${item.description || "N/A"}</span>
                        </div>

                        <div class="item-detail-row">
                            <span class="label-tag">Location:</span>
                            <span class="val-tag">${item.location}</span>
                        </div>

                        <div class="item-detail-row">
                            <span class="label-tag">Date:</span>
                            <span class="val-tag">${formatDate(item.date)}</span>
                        </div>

                        <div class="item-detail-row" style="margin-top: 6px;">
                            <span class="label-tag">Status:</span>
                            <span class="val-tag"><span class="status ${item.status}">${item.status}</span></span>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
    }
};


// ===============================
// MY CLAIMS
// ===============================
const loadMyClaims = async () => {
    const { token } = getAuthData();

    try {
        const response = await fetch(`${API_URL}/claims/my`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const claims = await response.json();
        const container = document.getElementById("myClaims");
        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(claims) || claims.length === 0) {
            container.innerHTML = "<p class='empty-state'>No claim requests found</p>";
            return;
        }

        claims.forEach((claim) => {
            const card = document.createElement("div");
            card.className = "item-card";

            const itemName = claim.item ? claim.item.itemName : "Unknown Item";

            card.innerHTML = `
                <div class="item-card-inner">
                    <div class="item-card-header">
                        <h3>${itemName}</h3>
                        <span class="status ${claim.status}">${claim.status}</span>
                    </div>

                    <div class="item-card-details">
                        <div class="item-detail-row">
                            <span class="label-tag">Claim Message:</span>
                            <span class="val-tag">${claim.message}</span>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
    }
};


// ===============================
// ADMIN DASHBOARD
// ===============================
const loadAdminDashboard = async () => {
    const { token, user } = getAuthData();

    if (!token || !user || user.role !== "admin") {
        showToast("Admin access required", "error");
        window.location.href = "login.html";
        return;
    }

    loadAdminItems();
    loadAdminClaims();
};


// ===============================
// ADMIN ITEMS
// ===============================
const loadAdminItems = async () => {
    const { token } = getAuthData();

    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();

        const totalListingsEl = document.getElementById("totalListings");
        if (totalListingsEl && Array.isArray(items)) {
            totalListingsEl.textContent = items.length;
        }

        const container = document.getElementById("adminListings") || document.getElementById("adminItems");
        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = "<p class='empty-state'>No items found</p>";
            return;
        }

        items.forEach((item) => {
            const card = document.createElement("div");
            card.className = `item-card type-${item.type || 'other'}`;

            const imageTag = item.image
                ? `<img src="${item.image}" alt="${item.itemName}" onerror="this.style.display='none';">`
                : "";

            card.innerHTML = `
                <div class="item-card-inner">
                    <div class="item-card-header">
                        <h3>${item.itemName}</h3>
                        <span class="type-pill ${item.type}">${item.type}</span>
                    </div>

                    ${imageTag}

                    <div class="item-card-details">
                        <div class="item-detail-row">
                            <span class="label-tag">Category:</span>
                            <span class="val-tag">${item.category}</span>
                        </div>

                        <div class="item-detail-row">
                            <span class="label-tag">Location:</span>
                            <span class="val-tag">${item.location}</span>
                        </div>

                        <div class="item-detail-row">
                            <span class="label-tag">Date:</span>
                            <span class="val-tag">${formatDate(item.date)}</span>
                        </div>

                        <div class="item-detail-row" style="margin-top: 6px;">
                            <span class="label-tag">Status:</span>
                            <span class="val-tag"><span class="status ${item.status}">${item.status}</span></span>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
    }
};


// ===============================
// ADMIN CLAIMS
// ===============================
const loadAdminClaims = async () => {
    const { token } = getAuthData();

    try {
        const response = await fetch(`${API_URL}/claims`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const claims = await response.json();

        if (Array.isArray(claims)) {
            const totalClaimsEl = document.getElementById("totalClaims");
            if (totalClaimsEl) totalClaimsEl.textContent = claims.length;

            const pendingClaimsEl = document.getElementById("pendingClaims");
            if (pendingClaimsEl) {
                pendingClaimsEl.textContent = claims.filter((c) => c.status === "pending").length;
            }
        }

        const container = document.getElementById("adminClaims");
        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(claims) || claims.length === 0) {
            container.innerHTML = "<p class='empty-state'>No claim requests found</p>";
            return;
        }

        claims.forEach((claim) => {
            const card = document.createElement("div");
            card.className = "item-card";

            const itemName = claim.item ? claim.item.itemName : "Unknown Item";
            const userName = claim.claimedBy ? claim.claimedBy.name : "N/A";
            const userEmail = claim.claimedBy ? claim.claimedBy.email : "N/A";

            const actionButtons = claim.status === "pending"
                ? `
                <div class="item-card-actions">
                    <button class="approve-btn" onclick="updateClaimStatus('${claim._id}', 'approved')">Approve Claim</button>
                    <button class="reject-btn" onclick="updateClaimStatus('${claim._id}', 'rejected')">Reject Claim</button>
                </div>
                `
                : "";

            card.innerHTML = `
                <div class="item-card-inner">
                    <div class="item-card-header">
                        <h3>${itemName}</h3>
                        <span class="status ${claim.status}">${claim.status}</span>
                    </div>

                    <div class="item-card-details">
                        <div class="item-detail-row">
                            <span class="label-tag">Claimed By:</span>
                            <span class="val-tag">${userName} (${userEmail})</span>
                        </div>

                        <div class="item-detail-row">
                            <span class="label-tag">Message:</span>
                            <span class="val-tag">${claim.message}</span>
                        </div>
                    </div>
                </div>

                ${actionButtons}
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
    }
};


// ===============================
// UPDATE CLAIM STATUS
// ===============================
const updateClaimStatus = async (claimId, status) => {
    const { token } = getAuthData();

    try {
        const response = await fetch(`${API_URL}/claims/${claimId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Failed to update claim", "error");
            return;
        }

        showToast(`Claim marked as ${status}!`, "success");
        loadAdminClaims();
        loadAdminItems();

    } catch (error) {
        showToast("Failed to update claim", "error");
    }
};


// ===============================
// LOGOUT
// ===============================
const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showToast("Logged out successfully", "info");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 400);
};


// ===============================
// PAGE LOAD & EVENT BINDINGS (ES6+)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    updateNavbarState();

    document.getElementById("loginForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        loginUser();
    });

    document.getElementById("registerForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        registerUser();
    });

    document.getElementById("reportForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        reportItem();
    });

    document.getElementById("claimForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        submitClaim();
    });

    const debouncedSearch = debounce(searchItems, 300);
    const searchInput = document.getElementById("searchInput") || document.getElementById("search");
    searchInput?.addEventListener("input", debouncedSearch);
    searchInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") searchItems();
    });

    document.getElementById("locationFilter")?.addEventListener("input", debouncedSearch);
    document.getElementById("categoryFilter")?.addEventListener("change", searchItems);
    document.getElementById("typeFilter")?.addEventListener("change", searchItems);
    document.getElementById("dateSort")?.addEventListener("change", searchItems);
    document.getElementById("searchBtn")?.addEventListener("click", searchItems);

    // Quick filter chips click handler
    const chipButtons = document.querySelectorAll("#categoryChips .chip");
    chipButtons.forEach((chip) => {
        chip.addEventListener("click", () => {
            chipButtons.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            const cat = chip.getAttribute("data-cat") || "";
            const catFilter = document.getElementById("categoryFilter");
            if (catFilter) {
                catFilter.value = cat;
            }
            searchItems();
        });
    });

    // Close modal on escape key or clicking outside content
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeItemModal();
    });
    const modalEl = document.getElementById("itemDetailModal");
    if (modalEl) {
        modalEl.addEventListener("click", (e) => {
            if (e.target === modalEl) closeItemModal();
        });
    }

    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("adminLogoutBtn")?.addEventListener("click", logout);

    if (document.getElementById("itemsContainer") || document.getElementById("itemsList")) {
        loadItems();
    }

    if (document.getElementById("dashboardPage") || document.getElementById("myListings") || document.getElementById("myItems")) {
        loadDashboard();
    }

    if (document.getElementById("adminPage") || document.getElementById("adminListings") || document.getElementById("adminItems")) {
        loadAdminDashboard();
    }
});
