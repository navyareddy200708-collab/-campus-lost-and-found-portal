const API_URL = "http://localhost:5000/api";

// ===============================
// LOGIN
// ===============================

async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (error) {
        alert("Login failed");
    }
}


// ===============================
// REGISTER
// ===============================

async function registerUser() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Registration successful");

        window.location.href = "login.html";

    } catch (error) {
        alert("Registration failed");
    }
}


// ===============================
// REPORT ITEM
// ===============================

async function reportItem() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    const itemName = document.getElementById("itemName").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;
    const image = document.getElementById("image").value;

    if (!itemName ||
        !category ||
        !description ||
        !location ||
        !date ||
        !type
    ) {
        alert("Please fill all required fields");
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
                itemName: itemName,
                category: category,
                description: description,
                location: location,
                date: date,
                type: type,
                image: image
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Item reported successfully");

        window.location.href = "index.html";

    } catch (error) {
        alert("Failed to report item");
    }
}


// ===============================
// LOAD ITEMS
// ===============================

async function loadItems() {
    const itemsContainer = document.getElementById("itemsContainer");

    if (!itemsContainer) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/items`);

        const items = await response.json();

        displayItems(items);

    } catch (error) {
        itemsContainer.innerHTML =
            "<p>Failed to load items</p>";
    }
}


// ===============================
// DISPLAY ITEMS
// ===============================

function displayItems(items) {
    const itemsContainer = document.getElementById("itemsContainer");

    itemsContainer.innerHTML = "";

    if (items.length === 0) {
        itemsContainer.innerHTML =
            "<p>No items found</p>";
        return;
    }

    items.forEach(function(item) {

        const card = document.createElement("div");

        card.className = "item-card";

        let claimButton = "";

        // IMPORTANT:
        // Show Claim Item button only when status is active
        if (item.status === "active") {
            claimButton = `
                <button
                    class="claim-btn"
                    onclick="showClaimForm('${item._id}')">
                    Claim Item
                </button>
            `;
        }

        card.innerHTML = `
            <h3>${item.itemName}</h3>

            <p>
                <strong>Category:</strong>
                ${item.category}
            </p>

            <p>
                <strong>Description:</strong>
                ${item.description}
            </p>

            <p>
                <strong>Location:</strong>
                ${item.location}
            </p>

            <p>
                <strong>Date:</strong>
                ${formatDate(item.date)}
            </p>

            <p>
                <strong>Type:</strong>
                ${item.type}
            </p>

            <p>
                <strong>Status:</strong>
                <span class="status ${item.status}">
                    ${item.status}
                </span>
            </p>

            ${claimButton}
        `;

        itemsContainer.appendChild(card);
    });
}


// ===============================
// DATE FORMAT
// ===============================

function formatDate(date) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}


// ===============================
// SEARCH AND FILTER
// ===============================

async function searchItems() {

    const search =
        document.getElementById("search") ? .value || "";

    const category =
        document.getElementById("categoryFilter") ? .value || "";

    const location =
        document.getElementById("locationFilter") ? .value || "";

    const type =
        document.getElementById("typeFilter") ? .value || "";

    const sort =
        document.getElementById("dateSort") ? .value || "";

    let url = `${API_URL}/items?`;

    if (search) {
        url += `search=${encodeURIComponent(search)}&`;
    }

    if (category) {
        url += `category=${encodeURIComponent(category)}&`;
    }

    if (location) {
        url += `location=${encodeURIComponent(location)}&`;
    }

    if (type) {
        url += `type=${encodeURIComponent(type)}&`;
    }

    try {
        const response = await fetch(url);

        let items = await response.json();

        if (sort === "newest") {
            items.sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
            });
        }

        if (sort === "oldest") {
            items.sort(function(a, b) {
                return new Date(a.date) - new Date(b.date);
            });
        }

        displayItems(items);

    } catch (error) {
        alert("Failed to search items");
    }
}


// ===============================
// SHOW CLAIM FORM
// ===============================

function showClaimForm(itemId) {

    const claimSection =
        document.getElementById("claimSection");

    const claimItemId =
        document.getElementById("claimItemId");

    if (claimSection && claimItemId) {

        claimItemId.value = itemId;

        claimSection.style.display = "block";

        claimSection.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// ===============================
// SUBMIT CLAIM
// ===============================

async function submitClaim() {

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    const item =
        document.getElementById("claimItemId").value;

    const message =
        document.getElementById("claimMessage").value;

    if (!message) {
        alert("Please enter claim message");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/claims`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    item: item,
                    message: message
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Claim submitted successfully");

        document.getElementById("claimMessage").value = "";

        document.getElementById("claimSection").style.display = "none";

        loadItems();

    } catch (error) {
        alert("Failed to submit claim");
    }
}


// ===============================
// USER DASHBOARD
// ===============================

async function loadDashboard() {

    const token =
        localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    loadMyItems();
    loadMyClaims();
}


// ===============================
// MY ITEMS
// ===============================

async function loadMyItems() {

    const token =
        localStorage.getItem("token");

    const user =
        JSON.parse(localStorage.getItem("user"));

    try {

        const response =
            await fetch(`${API_URL}/items`);

        const items =
            await response.json();

        const myItems =
            items.filter(function(item) {

                return (
                    item.reportedBy &&
                    item.reportedBy._id === user.id
                );
            });

        const container =
            document.getElementById("myItems");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        myItems.forEach(function(item) {

            container.innerHTML += `
                <div class="item-card">

                    <h3>${item.itemName}</h3>

                    <p>
                        Category: ${item.category}
                    </p>

                    <p>
                        Location: ${item.location}
                    </p>

                    <p>
                        Date: ${formatDate(item.date)}
                    </p>

                    <p>
                        Type: ${item.type}
                    </p>

                    <p>
                        Status: ${item.status}
                    </p>

                </div>
            `;
        });

    } catch (error) {
        console.log(error);
    }
}


// ===============================
// MY CLAIMS
// ===============================

async function loadMyClaims() {

    const token =
        localStorage.getItem("token");

    try {

        const response =
            await fetch(`${API_URL}/claims/my`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

        const claims =
            await response.json();

        const container =
            document.getElementById("myClaims");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        claims.forEach(function(claim) {

            container.innerHTML += `
                <div class="item-card">

                    <h3>
                        ${claim.item.itemName}
                    </h3>

                    <p>
                        Claim Message:
                        ${claim.message}
                    </p>

                    <p>
                        Status:
                        ${claim.status}
                    </p>

                </div>
            `;
        });

    } catch (error) {
        console.log(error);
    }
}


// ===============================
// ADMIN DASHBOARD
// ===============================

async function loadAdminDashboard() {

    const token =
        localStorage.getItem("token");

    const user =
        JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    loadAdminItems();
    loadAdminClaims();
}


// ===============================
// ADMIN ITEMS
// ===============================

async function loadAdminItems() {

    const token =
        localStorage.getItem("token");

    try {

        const response =
            await fetch(`${API_URL}/items`);

        const items =
            await response.json();

        const container =
            document.getElementById("adminItems");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        items.forEach(function(item) {

            container.innerHTML += `
                <div class="item-card">

                    <h3>
                        ${item.itemName}
                    </h3>

                    <p>
                        Category:
                        ${item.category}
                    </p>

                    <p>
                        Location:
                        ${item.location}
                    </p>

                    <p>
                        Type:
                        ${item.type}
                    </p>

                    <p>
                        Status:
                        ${item.status}
                    </p>

                </div>
            `;
        });

    } catch (error) {
        console.log(error);
    }
}


// ===============================
// ADMIN CLAIMS
// ===============================

async function loadAdminClaims() {

    const token =
        localStorage.getItem("token");

    try {

        const response =
            await fetch(`${API_URL}/claims`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

        const claims =
            await response.json();

        const container =
            document.getElementById("adminClaims");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        claims.forEach(function(claim) {

                    container.innerHTML += `
                <div class="item-card">

                    <h3>
                        ${claim.item.itemName}
                    </h3>

                    <p>
                        User:
                        ${claim.claimedBy.name}
                    </p>

                    <p>
                        Email:
                        ${claim.claimedBy.email}
                    </p>

                    <p>
                        Message:
                        ${claim.message}
                    </p>

                    <p>
                        Status:
                        ${claim.status}
                    </p>

                    ${
                        claim.status === "pending"
                            ? `
                            <button
                                onclick="updateClaimStatus('${claim._id}', 'approved')">
                                Approve
                            </button>

                            <button
                                onclick="updateClaimStatus('${claim._id}', 'rejected')">
                                Reject
                            </button>
                            `
                            : ""
                    }

                </div>
            `;
        });

    } catch (error) {
        console.log(error);
    }
}


// ===============================
// UPDATE CLAIM STATUS
// ===============================

async function updateClaimStatus(claimId, status) {

    const token =
        localStorage.getItem("token");

    try {

        const response =
            await fetch(
                `${API_URL}/claims/${claimId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert(data.message);

        loadAdminClaims();
        loadAdminItems();

    } catch (error) {
        alert("Failed to update claim");
    }
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById("itemsContainer")) {
        loadItems();
    }

    if (document.getElementById("dashboardPage")) {
        loadDashboard();
    }

    if (document.getElementById("adminPage")) {
        loadAdminDashboard();
    }
});