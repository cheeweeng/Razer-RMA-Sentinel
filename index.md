# Razer RMA Sentinel 🐍

**Razer RMA Sentinel** is a high-performance analytics dashboard and AI-powered prototype designed for Quality Assurance (QA) and Product Engineering teams. Built using **Google AI Studio**, this application provides a comprehensive suite of tools to monitor defect trends, analyze Return Merchandise Authorization (RMA) data, and measure the real-world impact of product improvements.

## 🚀 Key Features

### 1. Global RMA Dashboard

A high-level overview of quality metrics across Razer product lines.

* **Quality Score:** At-a-glance monitoring based on return rates.
* **Defect Trend Analysis:** Interactive line charts to identify seasonal spikes or batch-specific issues.
* **Improvement Effectiveness Tracking:** A specialized "Product Detail" view that overlays firmware updates or component changes onto RMA volume charts to visualize the ROI of engineering fixes.

### 2. Trends Tab (Market Quality Analysis)

Strategic analysis tools for long-term product health:

* **RMA Share by Category:** Compare performance across Mice, Keyboards, and Audio.
* **Defect Velocity Tracker:** A real-time monitor that flags rapid growth in specific defect types (e.g., "Battery Swelling") with red trend indicators for rapid response.

### 3. Live Feed Tab (Global Sentinel Stream)

A "Mission Control" view for real-time data ingestion:

* **Live Ingestion Stream:** A scrolling feed of the most recent RMA reports.
* **Visual Alerts:** New entries flash with a signature **Razer-green glow** to highlight fresh data.
* **Instant Status Tracking:** Real-time visibility into "PENDING" vs. "RESOLVED" queues.

### 4. Data Portability

* **One-Click CSV Export:** Generate dynamic reports including total counts, monthly breakdowns, and top defect types.
* **Dynamic Naming:** Reports are automatically timestamped (e.g., `razer_rma_report_2026-03-09.csv`) for easy organization.

---

🗺 Future Roadmap
The next phase of development focuses on moving from viewing data to conversing with it.

* Natural Language RMA Queries: Instead of filtering charts, engineers can ask: "What were the top 3 causes of mouse sensor failures in Q3?"
* Vector Database Implementation: Migrating from flat CSV/SQL storage to a vector database (like Pinecone or ChromaDB) to allow for semantic search across unstructured technician notes and customer feedback.
* Telegram/Discord Bot: Deploying the agent directly into internal team communication channels.
  
---
## 🛠 Development Notes
* **For setup and installation - clone the [repository](https://github.com/cheeweeng/Razer-RMA-Sentinel)
* **Original Prototype:** Vibe-coded and built in Google AI Studio
* **Status:** Active Development / MVP Phase
