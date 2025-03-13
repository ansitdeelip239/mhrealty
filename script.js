const API_BASE_URL =
  "https://dncrnewapi-bmbfb6f6awd8b0bd.westindia-01.azurewebsites.net/partners/properties/featured";
const PARTNER_ID = 3;
const PAGE_SIZE = 10;

let currentPage = 1;
let totalPages = 0;

// DOM elements
const propertiesContainer = document.getElementById("properties-container");
const paginationContainer = document.getElementById("pagination-container");
const pageNumbers = document.getElementById("page-numbers");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("error-message");
const firstPageBtn = document.getElementById("first-page");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const lastPageBtn = document.getElementById("last-page");

// Fetch properties from API
async function fetchProperties(page) {
  try {
    // Show loader
    loader.classList.remove("hidden");
    propertiesContainer.classList.add("hidden");
    paginationContainer.classList.add("hidden");
    errorMessage.classList.add("hidden");

    const url = `${API_BASE_URL}?partnerid=${PARTNER_ID}&page=${page}&pageSize=${PAGE_SIZE}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch properties");
    }

    // Update UI with properties
    displayProperties(data.data.properties);

    // Update pagination
    updatePagination(data.data.pagination);

    // Hide loader, show properties and pagination
    loader.classList.add("hidden");
    propertiesContainer.classList.remove("hidden");
    paginationContainer.classList.remove("hidden");
  } catch (error) {
    console.error("Error fetching properties:", error);

    // Hide loader, show error message
    loader.classList.add("hidden");
    errorMessage.textContent = `Error: ${error.message}`;
    errorMessage.classList.remove("hidden");
  }
}

// Display properties in cards
function displayProperties(properties) {
  propertiesContainer.innerHTML = "";

  properties.forEach((property) => {
    let imageUrl = "https://placehold.co/400x300";

    // Try to parse the imageURL if it's in JSON format
    try {
      if (property.imageURL && property.imageURL.startsWith("[")) {
        const images = JSON.parse(property.imageURL);
        if (images && images.length > 0 && images[0].imageUrl) {
          imageUrl = images[0].imageUrl;
        }
      } else if (property.imageURL && property.imageURL.trim() !== "") {
        imageUrl = property.imageURL;
      }
    } catch (e) {
      console.error("Error parsing image URL:", e);
      // Keep the fallback image if parsing fails
    }

    // Add image error handler
    const handleImageError = `onerror="this.onerror=null; this.src='https://placehold.co/400x300';"`;

    // Format price with commas
    const formattedPrice = property.price.toLocaleString("en-IN");

    // Create property card
    const propertyCard = document.createElement("div");
    propertyCard.className =
      "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300";

    propertyCard.innerHTML = `
          <div class="relative h-48 overflow-hidden">
            <img src="${imageUrl}" alt="${
      property.propertyName || "Property"
    }" class="w-full h-full object-cover" ${handleImageError}>
            <div class="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              ${property.propertyDetails.propertyForType || "Property"}
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-1">${
              property.propertyName || "Unnamed Property"
            }</h3>
            <p class="text-gray-600 text-sm mb-2"><i class="fas fa-map-marker-alt mr-1"></i> ${
              property.location || "Location not specified"
            }</p>
            <p class="font-bold text-blue-600 text-xl mb-2">₹ ${formattedPrice}</p>
            <div class="flex flex-wrap gap-2 mb-3">
              ${
                property.propertyDetails.bhkType
                  ? `<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">${property.propertyDetails.bhkType}</span>`
                  : ""
              }
              ${
                property.propertyDetails.area
                  ? `<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">${property.propertyDetails.area} sq.ft</span>`
                  : ""
              }
              ${
                property.propertyDetails.furnishing
                  ? `<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">${property.propertyDetails.furnishing}</span>`
                  : ""
              }
            </div>
            <p class="text-gray-700 text-sm mb-4 line-clamp-2">${
              property.shortDescription || "No description available"
            }</p>
            <div class="flex justify-between items-center border-t pt-3">
              <div class="text-gray-500 text-xs">Posted by: ${
                property.userName
              }</div>
              <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">View Details</button>
            </div>
          </div>
        `;

    propertiesContainer.appendChild(propertyCard);
  });
}

// Update pagination controls
function updatePagination(pagination) {
  totalPages = pagination.totalPages;

  // Update page numbers
  pageNumbers.innerHTML = "";

  // Determine which page numbers to show
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4 && totalPages > 4) {
    startPage = Math.max(1, endPage - 4);
  }

  // Create page number buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.className = `px-3 py-2 rounded-md ${
      i === currentPage
        ? "bg-blue-600 text-white"
        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
    }`;
    pageButton.textContent = i;
    pageButton.onclick = () => {
      currentPage = i;
      fetchProperties(currentPage);
    };
    pageNumbers.appendChild(pageButton);
  }

  // Update next/prev buttons
  prevPageBtn.disabled = !pagination.hasPrevPage;
  nextPageBtn.disabled = !pagination.hasNextPage;
  firstPageBtn.disabled = currentPage === 1;
  lastPageBtn.disabled = currentPage === totalPages;
}

// Event listeners for pagination buttons
firstPageBtn.addEventListener("click", () => {
  if (currentPage !== 1) {
    currentPage = 1;
    fetchProperties(currentPage);
  }
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchProperties(currentPage);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchProperties(currentPage);
  }
});

lastPageBtn.addEventListener("click", () => {
  if (currentPage !== totalPages) {
    currentPage = totalPages;
    fetchProperties(currentPage);
  }
});

// Initial fetch
document.addEventListener("DOMContentLoaded", () => {
  fetchProperties(currentPage);
});
