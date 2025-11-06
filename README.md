# Wind Farm Health & Productivity Dashboard

A single-page React application for monitoring wind farm operations through CSV data ingestion, KPI tracking, and interactive drill-down analytics.

## Features

- **CSV Data Ingestion**: Upload three CSV files (cases, actions, site locations) for analysis
- **Real-time KPI Tracking**: Monitor critical metrics with color-coded thresholds
- **Executive Snapshot**: Four key tiles showing fleet health at a glance
- **Risk Heatmap**: Visualize critical cases by site and component
- **Case Lifecycle Tracking**: Monitor progression through detection, inspection, confirmation, and closure
- **Action Queue Management**: Track overdue actions, SLA compliance, and priority changes
- **Cross-filtering**: Apply filters that affect all visualizations simultaneously
- **Drill-down Views**: Click to explore site, turbine, case, and action details
- **LocalStorage Persistence**: Filters persist across browser sessions
- **Responsive Design**: Works on desktop and tablet devices

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **@tanstack/react-table** for data tables
- **papaparse** for CSV parsing
- **date-fns** for date manipulation
- **Zustand** for state management
- **Vitest** for testing

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

\`\`\`bash
# Navigate to project directory
cd wind-farm-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

The app will be available at \`http://localhost:5173\`

### Building for Production

\`\`\`bash
npm run build
\`\`\`

The production build will be in the \`dist/\` directory.

### Running Tests

\`\`\`bash
npm test
\`\`\`

## CSV Schema

### 1. Cases CSV (\`all-cases.csv\`)

Represents case lifecycle events for turbine issues.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| \`id\` | string | Yes | Unique case identifier |
| \`siteId\` | string | Yes | Site identifier |
| \`siteName\` | string | Yes | Site name |
| \`turbineId\` | string | Yes | Turbine identifier |
| \`turbineName\` | string | Yes | Turbine name |
| \`turbineMake\` | string | Yes | Turbine manufacturer |
| \`componentId\` | string | Yes | Component identifier |
| \`componentName\` | string | Yes | Component name |
| \`failureModeId\` | string | Yes | Failure mode identifier |
| \`failureModeName\` | string | Yes | Failure mode description |
| \`severity\` | string | Yes | One of: Critical, High, Medium, Low (case-insensitive) |
| \`createdAt\` | ISO 8601 | Yes | Case creation timestamp |
| \`inspectedAt\` | ISO 8601 | No | Inspection timestamp |
| \`confirmedAt\` | ISO 8601 | No | Confirmation timestamp |
| \`closedAt\` | ISO 8601 | No | Closure timestamp (null if open) |
| \`updatedAt\` | ISO 8601 | Yes | Last update timestamp |

**Column Name Flexibility**: Headers are case-insensitive and support variations like \`site_id\`, \`Site ID\`, \`siteid\`, etc.

### 2. Actions CSV (\`all-actions.csv\`)

Represents work actions linked to cases.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| \`actionId\` | string | Yes | Unique action identifier |
| \`caseId\` | string | Yes | References \`cases.id\` |
| \`createdAt\` | ISO 8601 | Yes | Action creation timestamp |
| \`updatedAt\` | ISO 8601 | Yes | Last update timestamp |
| \`deadline\` | ISO 8601 | No | Action deadline |
| \`priority\` | string | Yes | Critical/High/Medium/Low or P1/P2/P3/P4 |
| \`priorityChanged\` | boolean | Yes | \`true\`/\`false\`, \`1\`/\`0\`, or boolean |
| \`status\` | string | Yes | Open, In Progress, Closed, Blocked |
| \`activity\` | string | Yes | Action description |
| \`details\` | string | Yes | Detailed notes |

### 3. Site Locations CSV (\`site_locations.csv\`)

Provides geospatial data for sites.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| \`siteId\` | string | Yes | Matches \`cases.siteId\` |
| \`siteName\` | string | Yes | Site name |
| \`latitude\` | number | Yes | Latitude coordinate |
| \`longitude\` | number | Yes | Longitude coordinate |

**Note**: Cases without matching site location data are flagged with \`noGeo: true\` but still processed.

## KPI Formulas

See full documentation in the README for detailed formulas for:
- Open Cases & Critical Backlog
- Lifecycle Medians (d2i, i2c, c2close)
- SLA Hit Rate & Overdue Actions
- Risk Heatmap & Repeat Failures

## Configuration

Thresholds are defined in \`src/config/thresholds.ts\`. After modifying, rebuild with \`npm run build\`.

## Known Limitations

This MVP does not include:
- SCADA/EA integration
- Multi-user authentication
- Backend API or database
- Advanced geospatial maps
- Real-time updates

Performance target: <3s render for 5k-50k rows on typical laptop.

## Sample Data

Sample CSVs are in \`public/sample/\` for testing.

## License

MIT License

---

**Built for Wind Farm Operations Teams**
