import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { chrome } from "chrome"

const SUPABASE_URL = "NEXT_PUBLIC_SUPABASE_URL"
const SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

class MarketplaceApp {
  constructor() {
    this.currentView = "listings"
    this.currentUser = null
    this.selectedListing = null
    this.init()
  }

  async init() {
    await this.checkAuth()
    this.render()
    this.attachEventListeners()
  }

  async checkAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    this.currentUser = session?.user || null
  }

  render() {
    const root = document.getElementById("root")

    if (!this.currentUser) {
      root.innerHTML = this.renderAuth()
      return
    }

    root.innerHTML = `
      <div class="header">
        <div class="header-title">Marketplace</div>
        <div class="header-actions">
          <button class="btn btn-sm btn-secondary" id="logout-btn">Logout</button>
        </div>
      </div>
      <nav class="nav">
        <button class="nav-item ${this.currentView === "listings" ? "active" : ""}" data-view="listings">
          Browse
        </button>
        <button class="nav-item ${this.currentView === "purchases" ? "active" : ""}" data-view="purchases">
          Purchases
        </button>
        <button class="nav-item ${this.currentView === "sell" ? "active" : ""}" data-view="sell">
          Sell
        </button>
      </nav>
      <div class="content" id="content">
        ${this.renderContent()}
      </div>
    `

    this.attachEventListeners()
  }

  renderAuth() {
    return `
      <div class="auth-container">
        <h1 class="auth-title">Welcome to Marketplace</h1>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="email" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Login</button>
        </form>
        <p style="margin-top: 16px; font-size: 12px; color: var(--muted-foreground);">
          Don't have an account? <a href="#" id="signup-link" style="color: var(--primary);">Sign up</a>
        </p>
      </div>
    `
  }

  renderContent() {
    if (this.selectedListing) {
      return this.renderListingDetail()
    }

    switch (this.currentView) {
      case "listings":
        return '<div id="listings-container"><div class="loading"><div class="spinner"></div></div></div>'
      case "purchases":
        return '<div id="purchases-container"><div class="loading"><div class="spinner"></div></div></div>'
      case "sell":
        return this.renderSellForm()
      default:
        return '<div class="empty-state">Select a view</div>'
    }
  }

  renderListingDetail() {
    const listing = this.selectedListing
    return `
      <div class="detail-view">
        <button class="btn btn-sm btn-secondary" id="back-btn">← Back</button>
        <img src="${listing.image_url || "/placeholder.svg?height=200&width=400"}" alt="${listing.title}" class="detail-image">
        <h2 class="detail-title">${listing.title}</h2>
        <div class="detail-price">₹${listing.price_inr}</div>
        <span class="badge badge-info">${listing.category}</span>
        <p class="detail-description">${listing.description}</p>
        <div class="detail-actions">
          <button class="btn btn-primary btn-full" id="buy-btn">Buy Now</button>
        </div>
      </div>
    `
  }

  renderSellForm() {
    return `
      <div style="padding: 16px;">
        <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Create Listing</h2>
        <form id="sell-form">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" id="title" required>
          </div>
          <div class="form-group">
            <label class="form-label">Price (INR)</label>
            <input type="number" class="form-input" id="price" required>
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-input" id="category" required>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home</option>
              <option value="books">Books</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-input" id="description" rows="4" required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="url" class="form-input" id="image-url">
          </div>
          <button type="submit" class="btn btn-primary btn-full">Create Listing</button>
        </form>
      </div>
    `
  }

  attachEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        this.currentView = e.target.dataset.view
        this.selectedListing = null
        this.render()
        if (this.currentView === "listings") {
          this.loadListings()
        } else if (this.currentView === "purchases") {
          this.loadPurchases()
        }
      })
    })

    // Logout
    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut()
        this.currentUser = null
        this.render()
      })
    }

    // Login form
    const loginForm = document.getElementById("login-form")
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          alert("Login failed: " + error.message)
        } else {
          await this.checkAuth()
          this.render()
          this.loadListings()
        }
      })
    }

    // Sell form
    const sellForm = document.getElementById("sell-form")
    if (sellForm) {
      sellForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        await this.createListing()
      })
    }

    // Back button
    const backBtn = document.getElementById("back-btn")
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.selectedListing = null
        this.render()
        this.loadListings()
      })
    }

    // Buy button
    const buyBtn = document.getElementById("buy-btn")
    if (buyBtn) {
      buyBtn.addEventListener("click", () => {
        this.handlePurchase()
      })
    }

    // Load initial data
    if (this.currentView === "listings" && this.currentUser) {
      this.loadListings()
    }
  }

  async loadListings() {
    const container = document.getElementById("listings-container")
    if (!container) return

    const { data: listings, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) {
      container.innerHTML = '<div class="empty-state">Error loading listings</div>'
      return
    }

    if (!listings || listings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <div class="empty-state-title">No listings yet</div>
        </div>
      `
      return
    }

    container.innerHTML = listings
      .map(
        (listing) => `
      <div class="listing-card" data-id="${listing.id}">
        <img src="${listing.image_url || "/placeholder.svg?height=120&width=400"}" alt="${listing.title}" class="listing-image">
        <div class="listing-title">${listing.title}</div>
        <div class="listing-price">₹${listing.price_inr}</div>
        <span class="listing-category">${listing.category}</span>
      </div>
    `,
      )
      .join("")

    // Attach click handlers to listing cards
    document.querySelectorAll(".listing-card").forEach((card) => {
      card.addEventListener("click", () => {
        const listingId = card.dataset.id
        this.selectedListing = listings.find((l) => l.id === listingId)
        this.render()
      })
    })
  }

  async loadPurchases() {
    const container = document.getElementById("purchases-container")
    if (!container) return

    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("*, listings(*)")
      .eq("buyer_id", this.currentUser.id)
      .order("created_at", { ascending: false })

    if (error) {
      container.innerHTML = '<div class="empty-state">Error loading purchases</div>'
      return
    }

    if (!purchases || purchases.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛍️</div>
          <div class="empty-state-title">No purchases yet</div>
        </div>
      `
      return
    }

    container.innerHTML = purchases
      .map(
        (purchase) => `
      <div class="listing-card">
        <img src="${purchase.listings?.image_url || "/placeholder.svg?height=120&width=400"}" alt="${purchase.listings?.title}" class="listing-image">
        <div class="listing-title">${purchase.listings?.title}</div>
        <div class="listing-price">₹${purchase.amount_inr}</div>
        <span class="badge badge-${purchase.status === "completed" ? "success" : "warning"}">${purchase.status}</span>
      </div>
    `,
      )
      .join("")
  }

  async createListing() {
    const title = document.getElementById("title").value
    const price = document.getElementById("price").value
    const category = document.getElementById("category").value
    const description = document.getElementById("description").value
    const imageUrl = document.getElementById("image-url").value

    const { error } = await supabase.from("listings").insert({
      title,
      price_inr: price,
      category,
      description,
      image_url: imageUrl || null,
      seller_id: this.currentUser.id,
      status: "active",
    })

    if (error) {
      alert("Error creating listing: " + error.message)
    } else {
      alert("Listing created successfully!")
      this.currentView = "listings"
      this.render()
      this.loadListings()
    }
  }

  async handlePurchase() {
    // Send message to background script to handle Razorpay
    chrome.runtime.sendMessage(
      {
        action: "createOrder",
        listing: this.selectedListing,
        userId: this.currentUser.id,
      },
      (response) => {
        if (response.success) {
          alert("Purchase initiated! Opening payment page...")
          // Open Razorpay checkout in new tab
          chrome.tabs.create({ url: response.checkoutUrl })
        } else {
          alert("Error: " + response.error)
        }
      },
    )
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new MarketplaceApp()
})
