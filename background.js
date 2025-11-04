// Declare chrome variable
const chrome = window.chrome

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "createOrder") {
    handleCreateOrder(request.listing, request.userId)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // Keep message channel open for async response
  }
})

async function handleCreateOrder(listing, userId) {
  try {
    // Call your API to create Razorpay order
    const response = await fetch("YOUR_API_URL/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingId: listing.id,
        amount: listing.price_inr,
        userId: userId,
      }),
    })

    const data = await response.json()

    if (data.orderId) {
      return {
        success: true,
        checkoutUrl: `YOUR_CHECKOUT_PAGE_URL?orderId=${data.orderId}`,
      }
    } else {
      return { success: false, error: "Failed to create order" }
    }
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return { success: false, error: error.message }
  }
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("[v0] Marketplace extension installed")
})
