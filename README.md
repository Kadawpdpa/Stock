# AeroCount // Premium Sold Item Counter

A sleek, premium, minimal dark-themed web application to catalog items, count quantities sold, log interaction timelines, and view aggregate results.

## How to Run the App

Since this is a client-side web application built with HTML, CSS, and Vanilla JavaScript, you don't need any complex installation or backend compilation.

### Option A: Open directly in your browser (Easiest)
1. Navigate to the project directory: `C:\Users\hp\.gemini\antigravity\scratch\sold-item-counter`
2. Double-click the `index.html` file, or right-click it and choose **Open with** -> select your preferred browser (Chrome, Edge, Firefox, or Safari).

### Option B: Run via a local web server (Recommended)
If you'd like to run it over a local address (`http://localhost`), you can run a simple, lightweight server from your command line:

- **Using Python**:
  Open your terminal inside the project directory and run:
  ```bash
  python -m http.server 8000
  ```
  Then open your browser and navigate to `http://localhost:8000`.

- **Using Node.js (`npx`)**:
  Open your terminal inside the project directory and run:
  ```bash
  npx http-server -p 8000
  ```
  Then open your browser and navigate to `http://localhost:8000`.

---

## How to Use the App

### 1. Cataloging Your Items
- On the **left-hand panel**, fill in the **Item Name** (e.g. `Vintage Tee`).
- Choose a category from the dropdown (e.g., `Clothing`). If your category is not in the list, select **Other (Create custom...)**. A text field will fade in below it for you to enter your custom category (e.g. `Footwear`).
- Click **Register Item**. Your item card will fade in on the main grid.

### 2. Counting Sales
- Every item has a card showing its name, category, current count, and control buttons.
- Click the **`+` (Plus)** button to increase the sales number of that item by `1`.
- Click the **`-` (Minus)** button to decrease the sales number by `1`. The app prevents quantities from dropping below `0`.

### 3. Reviewing Live Logs
- Under the item cards, there is a real-time **Activity Log**.
- Every single click on `+` or `-` registers a timestamped log showing the exact change (e.g., `Increased Vintage Tee sold count (0 → 1) at 14:05:22`).
- Green indicators show additions, red indicates subtractions, and blue shows newly registered items.
- You can clear your logs at any time by clicking the **Clear Logs** link at the top right of the logs panel.

### 4. Viewing the Summary Dashboard
- Click the **View Summary** button in the header.
- The interface will smoothly transition to show the overall results:
  - **Total Items Sold**: Combined tally of all items.
  - **Active Categories**: Number of unique categories with registered items.
  - **Best Selling Item**: The item with the highest quantity sold.
  - **Sales Breakdown by Category**: A premium gradient bar chart displaying category sales performance.
  - **Tally Details**: A sorted tabular list of all items and their final quantities sold.
- Click the **Return to Counter** button in the header to navigate back to the main counting dashboard.

### 5. Data Safety (Persistence)
- All registered items, counts, and logs are automatically stored in your browser's `localStorage`.
- Feel free to refresh the page, close your browser tab, or restart your computer; your data will remain exactly where you left it.
