import React, { useState, useEffect } from 'react'; // Imports React hooks for component lifecycle and state management
import ReactECharts from 'echarts-for-react'; // Imports ECharts library to render data visualizations
import 'echarts-gl'; // Imports echarts-gl to enable 3D chart rendering support
import LiveQuerySimulator from './LiveQuerySimulator'; // Imports the LiveQuerySimulator child component
import StaffPerformance from './StaffPerformance'; // Imports the StaffPerformance child component
import AIQueryCategories from './AIQueryCategories'; // Imports the AIQueryCategories child component

// ======================== AdminDashboard ========================
// AdminDashboard -> Manages enterprise AI metrics, live call analytics, and smart natural language search.
//  || 
//  ||   
//  ||
//  Functions -> (handleSmartSearch) -> Detects AI intent  -> Hits the Backend Smart Search API
//  ||     │            
//  ||     │
//  ||     ├──> (fetchDashboardData) -> Retrieves/formats raw MySQL logs- DB rows->UI-friendly objects
//  ||     │    
//  ||     │
//  ||     ├──> (onChartClick) -> User clicks on a chart element (bar, bubble, sankey node):
//  ||     │    │
//  ||     │    ├── IF viewMode is 'queries' AND clicked a bar (category)
//  ||     │    │   └── (setDrillDownCategory) -> Opens drill-down modal
//  ||     │    ├── IF clicked a Category name
//  ||     │    │   └── (setActiveFilter) -> Updates active filter to Category
//  ||     │    ├── IF clicked a Team name
//  ||     │    │   └── (setActiveFilter) -> Updates active filter to Team
//  ||     │    ├── IF clicked an Agent name
//  ||     │    │   └── (setActiveFilter) -> Updates active filter to Agent
//  ||     │    └── IF clicked a Status (Resolved / Escalated / Active)
//  ||     │        └── (setActiveFilter) -> Updates active filter to Status
//  ||     │
//  ||     ├──> (getHexColor) -> Maps categories to specific hex codes for charts
//  ||     ├──> (getBadgeColor) -> Returns Tailwind CSS classes for UI badges
//  ||     ├──> (getDynamicPerformanceSankey) -> Generates data for staff routing flow
//  ||     ├──> (getDynamicQuerySankey) -> Generates data for query resolution flow
//  ||     └──> (get3DOptions) -> Configures 3D WebGL scatter plot settings
//  || 
//  Tools -> (React), (ECharts), (echarts-gl), (MySQL API), (AI Smart Search)
// ===============================================================

// ======================State mangament section start=================================
const AdminDashboard = () => {
  // --- UI & Modal States ---
  const [showUI, setShowUI] = useState(false); // Controls the delayed fade-in animation for the main UI
  const [viewMode, setViewMode] = useState('performance'); // Tracks the currently active tab or view mode
  const [activeFilter, setActiveFilter] = useState(null); // Stores global filters applied via chart interactions
  const [drillDownCategory, setDrillDownCategory] = useState(null); // Triggers and manages the specific category detail modal
  const [activeModal, setActiveModal] = useState(null); // Controls the visibility of the 3D visualization modal

  // --- Sidebar States ---
  const [selectedTeam, setSelectedTeam] = useState('All Teams'); // Stores the team selected from the sidebar dropdown
  const [selectedAgent, setSelectedAgent] = useState('All Agents'); // Stores the agent selected from the sidebar dropdown
  const [selectedCategory, setSelectedCategory] = useState('All Categories'); // Stores the category selected from the sidebar dropdown

  // --- Data States ---
  const [allCallLogs, setAllCallLogs] = useState([]); // Stores the raw call log data retrieved from the database
  const [isLoading, setIsLoading] = useState(true); // Controls the visibility of the loading spinner during data fetch
  const [isSyncing, setIsSyncing] = useState(false); // Manages the loading animation state for the manual sync button

  // --- Smart Search States (NEW) ---
  const [smartQuery, setSmartQuery] = useState(''); // Stores the user's natural language query
  const [isSearching, setIsSearching] = useState(false); // Controls the loading state of the AI search
  const [aiIntent, setAiIntent] = useState(null); // 🔴 NAYA STATE: AI filter ko store karne ke liye
// ======================State mangament section ends=================================
  
  // ======================== handleSmartSearch (UPDATED FOR CHARTS) ========================
  // AI Search Handler -> Processes the natural language query, fetches SQL data from Python backend, and updates charts
  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!smartQuery.trim()) {
      setAiIntent(null);
      fetchDashboardData(); // Agar search khali hai toh wapas saara data le aao
      return;
    }
    
    setIsSearching(true);
    
    try {
      // 🔴 Naya Python FastAPI server hit kar rahe hain
      const response = await fetch('http://localhost:8000/api/nl2sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: smartQuery })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`AI Generated SQL: ${result.generated_sql}`); // Debugging ke liye
        
        // 🔴 AI se aaye hue naye MySQL rows ko Dashboard ke UI format mein convert kar rahe hain
        const formattedAILogs = result.data.map(row => ({
          id: row.call_id,
          caller: row.caller_info,
          agent: row.agent_name,
          team: row.team_name,
          csat: row.csat_score,
          escalation_risk: row.escalation_risk || Math.floor(Math.random() * 10) + 1,
          startTime: row.start_time,
          duration: row.duration,
          status: row.status,
          statusColor:
            row.status === 'Resolved'  ? 'text-green-400 bg-green-500/20' :
            row.status === 'Escalated' ? 'text-red-400 bg-red-500/20'     :
            row.status === 'Active'    ? 'text-blue-400 bg-blue-500/20'   :
                                         'text-gray-400 bg-gray-500/20',
          queries: [{ time: "00:00", type: row.ai_category, text: row.query_text }]
        }));

        // 🔴 Poore dashboard ka data is naye AI data se replace kar do! (Charts apne aap update ho jayenge)
        setAllCallLogs(formattedAILogs.reverse());
        
        // 🔴 Filter button dikhane ke liye intent set kar do
        setAiIntent(`AI Query: ${smartQuery.substring(0, 15)}...`); 
        
      } else {
        alert("AI Could not process this query.");
      }
      
    } catch (error) {
      console.error('Smart Search Error:', error);
      alert('Python AI Server se connect nahi ho paya!');
    } finally {
      setIsSearching(false);
    }
  };
// ===============================handleSmartSearch ends================================
  
  // ======================== fetchDashboardData ========================
  // Data Fetching -> Retrieves live dashboard data from API and maps it to UI format
  const fetchDashboardData = () => {
    setIsSyncing(true); // Activates the sync loader animation when data fetching begins

    fetch('http://localhost:5000/api/calls') // Sends a GET request to the Node.js backend API endpoint
      .then(response => response.json()) // Parses the incoming network response into JSON format
      .then(data => {
        const formattedLogs = data.map(row => ({ // Transforms raw database rows into UI-friendly objects
          id: row.call_id, // Maps the unique call identifier
          caller: row.caller_info, // Maps the caller's information
          agent: row.agent_name, // Assigns the corresponding agent's name
          team: row.team_name, // Assigns the corresponding team's name
          csat: row.csat_score, // Maps the customer satisfaction score
          escalation_risk: row.escalation_risk || Math.floor(Math.random() * 10) + 1, // Generates a fallback random risk value if none exists
          startTime: row.start_time, // Maps the timestamp for when the call started
          duration: row.duration, // Maps the total duration of the call
          status: row.status, // Maps the current operational status of the call
          statusColor: // Assigns appropriate Tailwind CSS classes based on the call status
            row.status === 'Resolved'  ? 'text-green-400 bg-green-500/20' :
            row.status === 'Escalated' ? 'text-red-400 bg-red-500/20'     :
            row.status === 'Active'    ? 'text-blue-400 bg-blue-500/20'   :
                                         'text-gray-400 bg-gray-500/20',
          queries: [{ time: "00:00", type: row.ai_category, text: row.query_text }] // Structures the AI query into an array of objects
        }));

        setAllCallLogs(formattedLogs.reverse()); // Reverses the array to display the most recent calls first
        setIsLoading(false); // Disables the loading spinner after data is successfully processed
        setTimeout(() => setIsSyncing(false), 800); // Delays the sync animation shutdown slightly for visual feedback
      })
      .catch(err => { 
        console.error(err); // Logs the error to the console if the API request fails
        setIsLoading(false); // Disables the loading spinner even if an error occurs
        setTimeout(() => setIsSyncing(false), 800); // Ensures the sync animation stops on failure
      });
  };

  useEffect(() => {
    setTimeout(() => setShowUI(true), 100); // Triggers the UI fade-in effect 100ms after the component mounts
    fetchDashboardData(); // Initiates the first data fetch when the dashboard loads
  }, []); 

  // Compute dropdown options
  const uniqueTeams      = ['All Teams',      ...new Set(allCallLogs.map(log => log.team).filter(Boolean))]; // Creates an array of unique teams by removing duplicates
  const uniqueAgents     = ['All Agents',     ...new Set(allCallLogs.map(log => log.agent).filter(Boolean))]; // Creates an array of unique agents by removing duplicates
  const uniqueCategories = ['All Categories', ...new Set(allCallLogs.flatMap(log => log.queries.map(q => q.type)).filter(Boolean))]; // Extracts and dedupes all categories from nested queries

  // ======================== Filter Logic ========================
  // Data Filtering -> Filters logs dynamically based on sidebar dropdowns and chart interactions
  const filteredLogs = allCallLogs.filter(log => {
    // 1. Check Dropdowns
    if (selectedTeam     !== 'All Teams'      && log.team  !== selectedTeam)                                return false; // Excludes the row if the team does not match the dropdown selection
    if (selectedAgent    !== 'All Agents'     && log.agent !== selectedAgent)                               return false; // Excludes the row if the agent does not match the dropdown selection
    if (selectedCategory !== 'All Categories' && !log.queries.some(q => q.type === selectedCategory))       return false; // Excludes the row if the category is not found in the queries

    // 🔴 2. AI Smart Search Intent filter was removed from here because we are directly updating allCallLogs now. 

    // 3. Check Chart Interactions
    if (activeFilter) { 
      if (activeFilter.type === 'Agent'    && log.agent !== activeFilter.value)                             return false; // Filters data based on the chart-clicked agent
      if (activeFilter.type === 'Team'     && log.team  !== activeFilter.value)                             return false; // Filters data based on the chart-clicked team
      if (activeFilter.type === 'Category' && !log.queries.some(q => q.type === activeFilter.value))        return false; // Filters data based on the chart-clicked category
      if (activeFilter.type === 'Status'   && log.status !== activeFilter.value)                            return false; // Filters data based on the chart-clicked status
    }

    return true; 
  });

  const drillDownLogs = drillDownCategory 
    ? filteredLogs.filter(log => log.queries.some(q => q.type === drillDownCategory)) // Extracts specific logs that match the drill-down category for the modal
    : []; 

  // ======================== onChartClick ========================
  // Event Handler -> Activates global filters or modals when an ECharts element is clicked
  const onChartClick = (params) => { 
    const name = params.name; // Extracts the exact name of the clicked bar or node
    const isCategory = uniqueCategories.includes(name); // Validates if the clicked element is a known category
    const isTeam     = uniqueTeams.includes(name); // Validates if the clicked element is a known team
    const isAgent    = uniqueAgents.includes(name); // Validates if the clicked element is a known agent

    if (params.seriesType === 'bar' && (viewMode === 'queries' || viewMode === 'simulator') && isCategory) { 
      setDrillDownCategory(name); // Opens the detailed category modal if a bar chart category is clicked
    } else if (isCategory) {
      setActiveFilter({ type: 'Category', value: name }); // Sets the global filter state to the clicked category
    } else if (isTeam) {
      setActiveFilter({ type: 'Team', value: name }); // Sets the global filter state to the clicked team
    } else if (isAgent) {
      setActiveFilter({ type: 'Agent', value: name }); // Sets the global filter state to the clicked agent
    } else if (['Resolved', 'Escalated', 'Active'].includes(name)) {
      setActiveFilter({ type: 'Status', value: name }); // Sets the global filter state to the clicked status
    }
  };

  // ======================== getHexColor ========================
  // UI Theming -> Returns a specific hex color code based on the category name for charts
  const getHexColor = (type) => { 
    switch(type) { 
      case 'Complaints': return '#ef4444'; 
      case 'Finance':    return '#F59E0B'; 
      case 'Billing':    return '#eab308'; 
      case 'HR':         return '#8B5CF6'; 
      case 'Technical':  return '#10B981'; 
      case 'Sales':      return '#06b6d4'; 
      default:           return '#6b7280'; // Provides a default gray color if the category is unknown
    }
  };

  // ======================== getBadgeColor ========================
  // UI Theming -> Returns corresponding Tailwind CSS classes based on the category name
  const getBadgeColor = (type) => { 
    switch(type) { 
      case 'Complaints': return 'border-red-500 text-red-400 bg-red-500/10';
      case 'Finance':    return 'border-amber-500 text-amber-400 bg-amber-500/10';
      case 'Billing':    return 'border-yellow-500 text-yellow-400 bg-yellow-500/10';
      case 'HR':         return 'border-purple-500 text-purple-400 bg-purple-500/10';
      case 'Technical':  return 'border-emerald-500 text-emerald-400 bg-emerald-500/10';
      case 'Sales':      return 'border-cyan-500 text-cyan-400 bg-cyan-500/10';
      default:           return 'border-gray-500 text-gray-400 bg-gray-500/10'; // Assigns default styling for unmapped categories
    }
  };

  // ======================== getDynamicPerformanceSankey ========================
  // Data Visualization -> Generates the complex flow chart data for agent routing and performance
  const getDynamicPerformanceSankey = () => { 
    if (filteredLogs.length === 0) return { series: { type: 'sankey', data: [], links: [] } }; // Returns an empty configuration if no data is available
    const nodesMap = new Map(); // Initializes a map to store unique nodes like teams and agents
    const linksMap = new Map(); // Initializes a map to store the connections and their weights between nodes

    const addNode = (name) => { if (name && !nodesMap.has(name)) nodesMap.set(name, { name }); }; // Helper: Adds a node to the map if it doesn't already exist
    const addLink = (src, tgt, val) => {
      if (!src || !tgt) return; // Skips link creation if source or target is missing
      const key = `${src}_||_${tgt}`; // Creates a unique composite key representing the connection
      linksMap.set(key, (linksMap.get(key) || 0) + val); // Increments the weight of the connection if it exists, or initializes it
    };

    addNode('Total Calls'); 
    filteredLogs.forEach(log => {
      const team   = log.team   || 'Unassigned'; // Assigns a fallback if the team data is missing
      const agent  = log.agent  || 'Unknown'; // Assigns a fallback if the agent data is missing
      const status = log.status || 'Unknown'; // Assigns a fallback if the status data is missing
      addNode(team); addNode(agent); addNode(status); 
      addLink('Total Calls', team,  1); // Creates a primary flow from Total Calls to the specific team
      addLink(team,          agent, 1); // Creates a secondary flow from the team to the specific agent
      addLink(agent,         status,1); // Creates a final flow from the agent to the call status
    });

    return {
      tooltip: { trigger: 'item' }, 
      series: {
        type: 'sankey', layout: 'none', focusNodeAdjacency: true, 
        data: Array.from(nodesMap.values()), // Converts the unique nodes map into an array for ECharts
        links: Array.from(linksMap.entries()).map(([k, v]) => ({ // Transforms the links map into the exact array structure required by ECharts
          source: k.split('_||_')[0], // Extracts the source node from the composite key
          target: k.split('_||_')[1], // Extracts the target node from the composite key
          value:  v // Assigns the calculated weight to the link
        })),
        lineStyle: { color: 'source', opacity: 0.4 }, 
        label: { color: '#fff', fontSize: 11 } 
      }
    };
  };

  // ======================== getDynamicQuerySankey ========================
  // Data Visualization -> Generates the flow chart data mapping AI categories to resolution statuses
  const getDynamicQuerySankey = () => { 
    if (filteredLogs.length === 0) return { series: { type: 'sankey', data: [], links: [] } }; // Returns empty config if filtered data is empty
    const nodesMap = new Map(); // Initializes map for query and status nodes
    const linksMap = new Map(); // Initializes map for relationship weights

    const addNode = (name) => { if (name && !nodesMap.has(name)) nodesMap.set(name, { name }); }; // Helper: Registers unique nodes
    const addLink = (src, tgt, val) => {
      if (!src || !tgt) return; 
      const key = `${src}_||_${tgt}`; // Generates the unique link identifier string
      linksMap.set(key, (linksMap.get(key) || 0) + val); // Accumulates connection weights dynamically
    };

    addNode('All Queries'); 
    filteredLogs.forEach(log => {
      const status = log.status || 'Unknown'; // Secures the status value against nulls
      addNode(status); 
      log.queries.forEach(q => {
        const cat = q.type || 'General'; // Extracts the query category or applies a default
        addNode(cat); 
        addLink('All Queries', cat,    1); // Links root to specific query category
        addLink(cat,           status, 1); // Links category to its final resolution status
      });
    });

    return {
      tooltip: { trigger: 'item' }, 
      series: {
        type: 'sankey', layout: 'none', focusNodeAdjacency: true, nodeAlign: 'left', 
        data: Array.from(nodesMap.values()), // Prepares node dataset for charting engine
        links: Array.from(linksMap.entries()).map(([k, v]) => ({ // Prepares link dataset for charting engine
          source: k.split('_||_')[0], 
          target: k.split('_||_')[1], 
          value:  v 
        })),
        lineStyle: { color: 'source', opacity: 0.4 }, 
        label: { color: '#fff', fontSize: 11 } 
      }
    };
  };

  // ======================== get3DOptions ========================
  // Data Visualization -> Prepares 3D scatter plot configurations for either agents or categories
  const get3DOptions = (type) => { 
    let xName, yName, zName, chartData, categoryCounts; 
    if (type === 'agent') {
      xName = 'Call Index'; yName = 'CSAT'; zName = 'Escalations'; // Defines axes labels for the agent view
      chartData = filteredLogs.map((l, i) => ({ // Maps individual logs to 3D coordinates
        name: l.agent, 
        value: [i, l.csat, l.escalation_risk], // Plots X as index, Y as CSAT, Z as risk
        itemStyle: { color: l.csat >= 4.0 ? '#10B981' : '#ef4444' } // Colors nodes green for good CSAT, red for poor
      }));
    } else {
      categoryCounts = {}; // Initializes frequency tracker for categories
      filteredLogs.forEach(log => { log.queries.forEach(q => { categoryCounts[q.type] = (categoryCounts[q.type] || 0) + 1; }); }); // Counts volume of each category
      const uniqueCats = Object.keys(categoryCounts); // Extracts unique category names from tracker keys
      xName = 'Category'; yName = 'Volume'; zName = 'Risk Level'; // Defines axes labels for the category view
      chartData = uniqueCats.map((c, i) => ({ // Maps aggregated category data to 3D coordinates
        name: c, 
        value: [c, categoryCounts[c], Math.random() * 20], // Plots X as category string, Y as volume, Z as random risk factor
        itemStyle: { color: getHexColor(c) } // Assigns uniform category colors using the helper function
      }));
    }

    return {
      tooltip: { trigger: 'item', formatter: '{b}' }, 
      grid3D: { viewControl: { projection: 'perspective', autoRotate: false, distance: 250, alpha: 20, beta: 40 }, axisLine:  { lineStyle: { color: 'rgba(255,255,255,0.3)' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, environment: 'transparent' }, 
      xAxis3D: { type: 'category', name: xName, data: type === 'agent' ? null : Object.keys(categoryCounts || {}) }, // Configures dynamic X-axis depending on view mode
      yAxis3D: { type: 'value', name: yName }, zAxis3D: { type: 'value', name: zName }, // Configures Y and Z value axes
      series: [{ type: 'scatter3D', symbolSize: 15, itemStyle: { opacity: 0.8 }, data: chartData }] // Injects the computed 3D data array into the series
    };
  };

  return (
    <div className="w-full h-screen flex text-white overflow-hidden bg-noise font-sans relative">{/* Main Application Wrapper -> Full width/height container with noise background and hidden overflow */}
           {/* ======================== Sidebar Filter Area ======================== */}
      {/* Sidebar Navigation -> Slides in based on showUI state, contains all dropdown filters */}
      <aside className={`w-64 p-6 glass-card border-r border-white/10 flex flex-col gap-6 z-10 transform transition-all duration-700 delay-100 ${showUI ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
        <h2 className="text-xl font-bold text-gradient mb-4">Filters</h2>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#8B5CF6] uppercase font-bold tracking-wider">Team</label>
            <select className="input-field bg-[#020617]/50 text-sm py-2" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
              {uniqueTeams.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#8B5CF6] uppercase font-bold tracking-wider">Agent</label>
            <select className="input-field bg-[#020617]/50 text-sm py-2" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
              {uniqueAgents.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#8B5CF6] uppercase font-bold tracking-wider">Category</label>
            <select className="input-field bg-[#020617]/50 text-sm py-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {uniqueCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {activeFilter && ( 
            <button onClick={() => setActiveFilter(null)} className="mt-2 text-xs bg-red-500/20 text-red-400 py-2 rounded-lg font-bold hover:bg-red-500/30 transition-all">
              ✕ Clear Selection
            </button>
          )}
          {/* 🔴 NAYA UI: Agar AI search se kuch filter hua hai toh use yahan clear karne ka option */}
          {aiIntent && ( 
            <button onClick={() => { setAiIntent(null); setSmartQuery(''); fetchDashboardData(); }} className="mt-2 text-xs bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 py-2 rounded-lg font-bold hover:bg-[#10B981]/30 transition-all flex items-center justify-center gap-2">
              <span>🤖</span> Clear AI Filter
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative z-0">
        
        {/* Header */}
        <header className="glass-card flex justify-between items-center px-6 py-4 rounded-2xl">
          <h1 className="text-2xl font-bold text-gradient">Admin Insights Dashboard</h1>
          {viewMode === 'simulator' && (
            <button onClick={fetchDashboardData} disabled={isSyncing} className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border ${isSyncing ? 'bg-gray-500/20 text-gray-400 border-gray-500/40 cursor-not-allowed' : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40 hover:bg-[#10B981]/30'}`}>
              {isSyncing ? '↻ Syncing with MySQL...' : '↻ Sync DB'}
            </button>
          )}
        </header>

        {/* Tab Controls */}
        <div className="flex justify-center gap-4">
          <button onClick={() => { setViewMode('performance'); setActiveFilter(null); }} className={`px-6 py-2 rounded-full font-semibold transition-all ${viewMode === 'performance' ? 'bg-[#6366F1] text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            👨‍💻 Staff Performance
          </button>
          <button onClick={() => { setViewMode('queries'); setActiveFilter(null); }} className={`px-6 py-2 rounded-full font-semibold transition-all ${viewMode === 'queries' ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            🤖 AI Query Categories
          </button>
          <button onClick={() => { setViewMode('simulator'); setActiveFilter(null); }} className={`px-6 py-2 rounded-full font-semibold transition-all ${viewMode === 'simulator' ? 'bg-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            🧪 Query Simulator
          </button>
        </div>

        {/* Component Renders Based on View */}
        <div style={{ display: viewMode === 'simulator' ? 'block' : 'none' }}>
          <LiveQuerySimulator />
        </div>

        <div style={{ display: viewMode !== 'simulator' ? 'block' : 'none' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="flex flex-col gap-6">
              {/* Dynamic Sub-Component injection */}
              {viewMode === 'performance' ? (
                <StaffPerformance filteredLogs={filteredLogs} onChartClick={onChartClick} setActiveModal={setActiveModal} />
              ) : (
                <AIQueryCategories 
                  filteredLogs={filteredLogs} 
                  onChartClick={onChartClick} 
                  setActiveModal={setActiveModal} 
                  getHexColor={getHexColor} 
                  // 🔴 Passing Smart Search props down to AIQueryCategories
                  smartQuery={smartQuery}
                  setSmartQuery={setSmartQuery}
                  handleSmartSearch={handleSmartSearch}
                  isSearching={isSearching}
                />
              )}
            </div>

            {/* Transcript Logs Section */}
            <div className="glass-card rounded-2xl p-6 h-[585px] flex flex-col">
              <h2 className="text-lg font-semibold mb-4 text-gray-200">Call Transcripts & Logs</h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {isLoading ? ( 
                  <div className="text-[#32CD32] font-semibold animate-pulse">Fetching from MySQL...</div>
                ) : filteredLogs.length === 0 ? ( 
                  <div className="text-gray-500 italic text-center mt-10">No logs match the selected filters.</div>
                ) : (
                  filteredLogs.map((log, index) => ( 
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                      <div className="flex justify-between items-start border-b border-white/10 pb-2 mb-2">
                        <div>
                          <p className="font-semibold text-white text-sm">{log.caller}</p>
                          <p className="text-xs text-gray-400">{log.startTime} | Agent: {log.agent} | {log.team}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${log.statusColor}`}>{log.status}</span>
                      </div>
                      {log.queries.map((q, i) => (
                        <div key={i} className="text-sm mt-1">
                          <span className="text-[#8B5CF6] font-bold mr-2">{q.type}:</span>
                          {q.text}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Full-width Sankey Flow Charts */}
          <div className="glass-card-hover rounded-2xl p-6 h-[300px] mt-2">
            <h2 className="text-lg font-semibold mb-2">
              {viewMode === 'performance' ? 'Call Routing Flow Map (Reactive)' : 'Query Resolution Flow Map (Reactive)'}
            </h2>
            <ReactECharts notMerge={true} option={viewMode === 'performance' ? getDynamicPerformanceSankey() : getDynamicQuerySankey()} onEvents={{ click: onChartClick }} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </main>

      {/* Drill-down Modal View */}
      {drillDownCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full max-w-6xl glass-card rounded-3xl p-8 border border-white/20 shadow-[0_0_100px_rgba(139,92,246,0.3)]">
            <button onClick={() => setDrillDownCategory(null)} className="absolute top-6 right-6 text-white bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 px-5 py-2.5 rounded-xl transition-all z-20 font-bold">
              ✕ Close Drill-down
            </button>
            <div className="mb-6 border-b border-white/10 pb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border ${getBadgeColor(drillDownCategory)}`}>
                {drillDownCategory} CATEGORY
              </span>
              <h2 className="text-4xl font-bold text-white mb-2">Deep Dive Analysis</h2>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar bg-[#020617]/50 rounded-2xl border border-white/5 p-2 max-h-[500px]">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-white/5 sticky top-0 backdrop-blur-md">
                  <tr><th className="px-6 py-4">Call ID</th><th className="px-6 py-4">Agent Name</th><th className="px-6 py-4">Team</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Exact Query Transcript</th></tr>
                </thead>
                <tbody>
                  {drillDownLogs.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No calls found.</td></tr>
                  ) : (
                    drillDownLogs.map((log, i) => {
                      const specificQuery = log.queries.find(q => q.type === drillDownCategory);
                      return (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-[#6366F1]">{log.id}</td>
                          <td className="px-6 py-4 font-semibold text-white">{log.agent}</td>
                          <td className="px-6 py-4 text-gray-400">{log.team}</td>
                          <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded-md ${log.statusColor}`}>{log.status}</span></td>
                          <td className="px-6 py-4 italic text-gray-300">"{specificQuery?.text}"</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3D Visualizer Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full h-full max-w-7xl max-h-[800px] glass-card rounded-3xl p-6 flex flex-col relative border border-[#6366F1]/30 shadow-[0_0_80px_rgba(99,102,241,0.2)]">
          
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-white bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 px-5 py-2.5 rounded-xl transition-all z-20 font-bold flex items-center gap-2">
              ✕ Close 3D View
            </button>
            {/* Dynamic Title based on whether Agent or Category 3D view was requested */}
            <h2 className="text-3xl font-bold text-gradient mb-2">
              {activeModal === 'agent' ? '3D Agent Performance Engine' : '3D AI Query Categorization Engine'}
            </h2>
            {/* Interactive 3D Canvas Container */}
            <div className="flex-1 w-full bg-[#020617]/80 rounded-2xl overflow-hidden border border-white/10 relative shadow-inner cursor-grab active:cursor-grabbing">
              <ReactECharts option={get3DOptions(activeModal)} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} /> {/* Renders the ECharts instance forcing the HTML canvas renderer for 3D performance */}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;// Exports the completed component for application routing