// ============================================================
// FILE: LiveQuerySimulator.jsx
// PURPOSE: Live AI Query Routing Simulator — allows users to:
//   1. Type a test query → AI categorizes it → saves to MySQL
//   2. View real-time intent clusters (bubble chart)
//   3. View real-time resolution flow (sankey chart)
//   4. Resolve or Escalate active queries
//   5. View 3D distribution chart in a modal
// DEPENDENCIES: echarts-for-react, echarts-gl
// API ENDPOINTS USED:
//   GET  http://localhost:5000/api/calls       → fetch all logs
//   POST http://localhost:5000/api/calls       → save new query
//   PUT  http://localhost:5000/api/calls/:id   → update status
//   POST http://localhost:8000/api/rag         → AI categorization
// =============================================================

import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import 'echarts-gl'; // Required for 3D scatter chart (scatter3D)

const LiveQuerySimulator = () => {

  // ----------------------------------------------------------
  // SECTION 1: STATE VARIABLES
  // ---------------------------------------------------------
  const [inputText, setInputText] = useState('');           // Controlled input — the query user types
  const [isProcessing, setIsProcessing] = useState(false);  // Disables form while AI is processing
  const [simulatedLogs, setSimulatedLogs] = useState([]);   // All query logs (from DB + newly added)
  const [activeModal, setActiveModal] = useState(false);    // Controls 3D modal open/close


  // ----------------------------------------------------------
  // SECTION 2: INITIAL DATA FETCH FROM MySQL
  // On component mount, fetches existing call logs from the
  // Flask API and formats them for display in the simulator.
  // ----------------------------------------------------------
  useEffect(() => {
    fetch('http://localhost:5000/api/calls')
      .then(res => res.json())
      .then(data => {
        // Map raw DB rows to the shape the simulator UI needs
        const formatted = data.map(row => ({
          id: row.call_id,
          text: row.query_text,
          category: row.ai_category || 'General', // Fallback if category is null
          status: row.status || 'Active',          // Fallback if status is null
          time: new Date(row.created_at || Date.now()).toLocaleTimeString()
        }));
        setSimulatedLogs(formatted.reverse()); // Show newest entries at the top
      })
      .catch(err => console.error("DB Fetch Error:", err));
  }, []); // Empty array = runs only once on mount


  // ----------------------------------------------------------
  // SECTION 3: DYNAMIC SANKEY DATA BUILDER
  // Builds the nodes and links for the Sankey chart dynamically
  // based on current simulatedLogs. Only adds nodes/links for
  // statuses that actually have data (no empty nodes).
  //
  // Flow: New Queries → [Category] → [Active/Resolved/Escalated]
  // ----------------------------------------------------------
  const getDynamicSankeyData = () => {

    // If no logs yet, show a placeholder sankey with dummy nodes
    if (simulatedLogs.length === 0) {
      return {
        nodes: [{ name: 'Waiting for Queries...' }, { name: '...' }],
        links: [{ source: 'Waiting for Queries...', target: '...', value: 1 }]
      };
    }

    // Get all unique category names from the current logs
    const uniqueCategories = [...new Set(simulatedLogs.map(l => l.category))];

    // Start with the root node
    let nodes = [{ name: 'New Queries', itemStyle: { color: '#8B5CF6' } }];
    let links = [];

    uniqueCategories.forEach(cat => {
      const catLogs = simulatedLogs.filter(l => l.category === cat);

      if (catLogs.length > 0) {
        // Add this category as a node
        nodes.push({ name: cat, itemStyle: { color: '#6366F1' } });

        // Link: New Queries → this Category (value = number of logs)
        links.push({ source: 'New Queries', target: cat, value: catLogs.length });

        // Count logs by status within this category
        const activeCount    = catLogs.filter(l => l.status === 'Active').length;
        const resolvedCount  = catLogs.filter(l => l.status === 'Resolved').length;
        const escalatedCount = catLogs.filter(l => l.status === 'Escalated').length;

        // Only add 'Active' node + link if there are active logs in this category
        if (activeCount > 0) {
          if (!nodes.find(n => n.name === 'Active'))
            nodes.push({ name: 'Active', itemStyle: { color: '#ef4444' } }); // Red
          links.push({ source: cat, target: 'Active', value: activeCount, lineStyle: { color: '#ef4444', opacity: 0.4 } });
        }

        // Only add 'Resolved' node + link if there are resolved logs
        if (resolvedCount > 0) {
          if (!nodes.find(n => n.name === 'Resolved'))
            nodes.push({ name: 'Resolved', itemStyle: { color: '#10B981' } }); // Green
          links.push({ source: cat, target: 'Resolved', value: resolvedCount, lineStyle: { color: '#10B981', opacity: 0.4 } });
        }

        // Only add 'Escalated' node + link if there are escalated logs
        if (escalatedCount > 0) {
          if (!nodes.find(n => n.name === 'Escalated'))
            nodes.push({ name: 'Escalated', itemStyle: { color: '#F59E0B' } }); // Yellow/Amber
          links.push({ source: cat, target: 'Escalated', value: escalatedCount, lineStyle: { color: '#F59E0B', opacity: 0.4 } });
        }
      }
    });

    return { nodes, links };
  };

  // Call the builder to get current sankey data (recalculates on every render)
  const sankeyData = getDynamicSankeyData();


  // ----------------------------------------------------------
  // SECTION 4: BUBBLE CHART DATA + COLOR HELPERS
  // Builds scatter/bubble chart data from simulatedLogs.
  // Each category becomes one bubble, sized by query count.
  // ----------------------------------------------------------

  // Returns a hex color for each known query category
  const getCategoryColor = (cat) => {
    const colors = {
      'HR':         '#8B5CF6', // Purple
      'Finance':    '#F59E0B', // Amber
      'Technical':  '#10B981', // Emerald
      'Sales':      '#06b6d4', // Cyan
      'Complaints': '#ef4444', // Red
      'General':    '#6b7280'  // Gray
    };
    return colors[cat] || '#6b7280'; // Gray fallback for unknown categories
  };

  // Get unique category names for the bubble chart X-axis
  const uniqueCatsForBubble = [...new Set(simulatedLogs.map(l => l.category))];

  // Build one data point per category: value = [categoryName, count, count]
  // Third value (count) is used to scale the bubble size
  const bubbleData = uniqueCatsForBubble.map(c => {
    const count = simulatedLogs.filter(l => l.category === c).length;
    return {
      name: c,
      value: [c, count, count], // [xAxis, yAxis, size]
      itemStyle: {
        color: getCategoryColor(c),
        shadowBlur: 15,
        shadowColor: 'rgba(0,0,0,0.5)'
      }
    };
  });

  // ECharts option object for the 2D bubble/scatter chart
  const bubbleOptions = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => `${params.data.name}: ${params.data.value[1]} Queries`
    },
    grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' },
    xAxis: {
      type: 'category',
      // Fallback to ['No Data'] if no logs yet
      data: uniqueCatsForBubble.length > 0 ? uniqueCatsForBubble : ['No Data'],
      axisLabel: { color: '#aaa' },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Volume',
      axisLabel: { color: '#aaa' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      minInterval: 1 // Prevents decimal Y-axis ticks
    },
    series: [{
      type: 'scatter',
      // Bubble size: 0 if empty, otherwise scales proportionally with volume
      symbolSize: (val) => val[2] === 0 ? 0 : (val[2] * 5) + 20,
      data: bubbleData,
      label: { show: false }
    }]
  };

  // ECharts option object for the Sankey flow chart
  const sankeyOptions = {
    tooltip: { trigger: 'item' },
    series: {
      type: 'sankey',
      layout: 'none',
      focusNodeAdjacency: true, // Highlights connected nodes on hover
      nodeAlign: 'left',
      data: sankeyData.nodes,
      links: sankeyData.links,
      label: { color: '#fff', fontSize: 11, fontWeight: 'bold' }
    }
  };


  // ----------------------------------------------------------
  // SECTION 5: 3D CHART OPTION BUILDER
  // Returns ECharts option for the 3D scatter modal.
  // X: Category, Y: Query Volume, Z: Random risk level (placeholder)
  // Auto-rotates for a dynamic visual effect.
  // ----------------------------------------------------------
  const get3DOptions = () => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c[1]} Queries' },
    grid3D: {
      viewControl: {
        projection: 'perspective',
        autoRotate: true,  // Spins automatically in the modal
        distance: 200
      },
      environment: 'transparent'
    },
    xAxis3D: { type: 'category', data: uniqueCatsForBubble, name: 'Category' },
    yAxis3D: { type: 'value', name: 'Volume' },
    zAxis3D: { type: 'value', name: 'Risk' },
    series: [{
      type: 'scatter3D',
      symbolSize: 20,
      // Re-map bubbleData for 3D: add a random Z value as placeholder risk
      data: bubbleData.map((d, i) => ({
        name: d.name,
        value: [d.name, d.value[1], Math.random() * 10], // Z = random risk
        itemStyle: d.itemStyle                            // Reuse same category colors
      }))
    }]
  });


  // ----------------------------------------------------------
  // SECTION 6: HANDLE NEW QUERY SUBMISSION
  // Flow:
  //   1. Prevent empty submission
  //   2. Try AI RAG API (localhost:8000) for category detection
  //   3. If AI API fails → fallback to keyword-based detection
  //   4. Save the new query to MySQL via Flask API (POST)
  //   5. Prepend the new log to simulatedLogs (optimistic UI)
  // ----------------------------------------------------------
  const handleSimulate = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    if (!inputText.trim()) return; // Ignore empty/whitespace-only input

    const currentQuery = inputText;       // Save query before clearing input
    let detectedCategory = 'General';     // Default category fallback

    setInputText('');        // Clear input field immediately
    setIsProcessing(true);   // Disable form + show loading state

    // --- STEP A: Try AI RAG API for intelligent categorization ---
    try {
      const response = await fetch('http://localhost:8000/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery })
      });

      if (response.ok) {
        const data = await response.json();
        detectedCategory = data.category || 'General'; // Use AI result
      } else {
        throw new Error("API failed"); // Force fallback if non-200 response
      }

    } catch (error) {
      // --- STEP B: Keyword-based fallback if AI API is unavailable ---
      const lower = currentQuery.toLowerCase();
      if      (lower.includes('hr')       || lower.includes('leave'))   detectedCategory = 'HR';
      else if (lower.includes('finance')  || lower.includes('tax'))     detectedCategory = 'Finance';
      else if (lower.includes('tech')     || lower.includes('login'))   detectedCategory = 'Technical';
      else if (lower.includes('sales')    || lower.includes('price'))   detectedCategory = 'Sales';
      else if (lower.includes('complain') || lower.includes('angry'))   detectedCategory = 'Complaints';
      // else: stays 'General'
    }

    // --- STEP C: Save the new query to MySQL via Flask POST API ---
    try {
      const dbRes = await fetch('http://localhost:5000/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_text:   currentQuery,
          ai_category:  detectedCategory,
          status:       'Active'           // New queries always start as Active
        })
      });
      const newLog = await dbRes.json();

      // Prepend new log to the list (newest first, optimistic update)
      setSimulatedLogs(prev => [{
        id:       newLog.id || Date.now(), // Fallback to timestamp if no ID returned
        text:     currentQuery,
        category: detectedCategory,
        status:   'Active',
        time:     new Date().toLocaleTimeString()
      }, ...prev]);

    } catch(err) {
      console.error("DB Save Error:", err);
    }

    setIsProcessing(false); // Re-enable the form
  };


  // ----------------------------------------------------------
  // SECTION 7: HANDLE RESOLVE / ESCALATE ACTIONS
  // Uses optimistic UI: updates state immediately, then syncs
  // to the DB in the background. If DB update fails, UI stays
  // updated (no rollback — acceptable for this simulator).
  // ----------------------------------------------------------
  const handleAction = async (id, newStatus) => {
    // Optimistic UI: instantly reflect the status change in the list
    setSimulatedLogs(prev =>
      prev.map(log => log.id === id ? { ...log, status: newStatus } : log)
    );

    // Background DB sync via PUT endpoint
    try {
      await fetch(`http://localhost:5000/api/calls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch(err) {
      console.error("Update failed", err);
    }
  };


  // ----------------------------------------------------------
  // SECTION 8: RENDER
  // Layout:
  //   Left column  → Query input form + scrollable log list
  //   Right columns (2) → Bubble chart + Sankey chart
  //   Modal (conditional) → 3D chart fullscreen overlay
  // ----------------------------------------------------------
  return (
    <div className="glass-card-hover rounded-2xl p-6 flex flex-col min-h-[450px] border border-[#6366F1]/30 animate-in fade-in duration-500 relative">

      {/* --- Header: Title + DB Synced badge --- */}
      <div className="mb-6 border-b border-white/10 pb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gradient flex items-center gap-3">
          🤖 Live AI Query Routing Simulator
          {/* Green pulsing badge indicates live DB connection */}
          <span className="text-xs bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded-full font-mono flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse"></span> DB SYNCED
          </span>
        </h2>
      </div>

      {/* --- Main 3-column grid layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ======================================================
            LEFT COLUMN: Query Input Form + Log List
        ====================================================== */}
        <div className="flex flex-col gap-4 bg-white/5 p-5 rounded-xl border border-white/10">

          {/* Query input form */}
          <form onSubmit={handleSimulate} className="flex flex-col gap-3">
            <label className="text-xs font-bold text-[#8B5CF6] uppercase">Inject Test Query</label>

            {/* Multiline textarea for typing the test query */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., 'Total profit this year'..."
              className="w-full bg-[#020617]/80 text-white p-3 rounded-lg border border-white/10 outline-none h-24 custom-scrollbar"
              disabled={isProcessing} // Locked while AI is processing
            />

            {/* Submit button: shows processing state while waiting for AI */}
            <button
              type="submit"
              disabled={isProcessing}
              className="bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-500 text-white font-bold py-2.5 px-4 rounded-lg transition-all"
            >
              {isProcessing ? 'Processing with AI...' : 'Simulate Routing'}
            </button>
          </form>

          {/* Scrollable list of all query logs (newest on top) */}
          <div className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar mt-3 pr-2 flex flex-col gap-3">
            {simulatedLogs.map((log) => (
              // Card background color changes based on log status
              <div
                key={log.id}
                className={`p-3 rounded-lg border border-white/5 text-xs flex flex-col gap-2 transition-colors
                  ${log.status === 'Active'    ? 'bg-[#ef4444]/10 border-[#ef4444]/30'  : // Red tint
                    log.status === 'Resolved'  ? 'bg-[#10B981]/10 border-[#10B981]/30' : // Green tint
                                                 'bg-[#F59E0B]/10 border-[#F59E0B]/30'}` // Amber tint (Escalated)
                }
              >
                {/* Query text displayed in italics */}
                <span className="text-gray-200 italic">"{log.text}"</span>

                {/* Footer row: category badge + action buttons or status label */}
                <div className="flex justify-between items-center border-t border-white/5 pt-2">

                  {/* Category badge (purple outline) */}
                  <span className="px-2 py-1 rounded text-[9px] font-bold uppercase border border-[#8B5CF6] text-[#8B5CF6]">
                    {log.category}
                  </span>

                  {/* Active logs get Resolve/Escalate buttons */}
                  {log.status === 'Active' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(log.id, 'Resolved')}
                        className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/40 px-2 py-1 rounded transition-colors font-bold"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleAction(log.id, 'Escalated')}
                        className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/40 px-2 py-1 rounded transition-colors font-bold"
                      >
                        Escalate
                      </button>
                    </div>
                  ) : (
                    // Resolved/Escalated logs just show their status as text
                    <span className={`font-bold ${log.status === 'Resolved' ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                      {log.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================
            RIGHT COLUMNS (span 2): Bubble Chart + Sankey Chart
        ====================================================== */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* --- Bubble/Scatter Chart: Live Intent Clusters --- */}
          <div className="bg-[#020617]/40 rounded-xl p-5 border border-white/5 relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs text-[#8B5CF6] font-bold uppercase">Live Intent Clusters</h3>
              {/* Button opens the 3D modal for this chart */}
              <button
                onClick={() => setActiveModal(true)}
                className="bg-[#6366F1]/20 text-white border border-[#6366F1]/40 px-2 py-1 rounded text-[10px] font-bold z-10 hover:bg-[#6366F1]/50 transition-colors"
              >
                🧊 3D View
              </button>
            </div>
            {/* 2D Bubble chart — rerenders when simulatedLogs changes */}
            <ReactECharts option={bubbleOptions} notMerge={true} style={{ height: '220px', width: '100%' }} />
          </div>

          {/* --- Sankey Chart: Real-time Resolution Flow --- */}
          <div className="bg-[#020617]/40 rounded-xl p-5 border border-white/5">
            <h3 className="text-xs text-[#8B5CF6] font-bold mb-4 uppercase">Real-time Resolution Flow</h3>
            {/* Sankey rerenders dynamically as logs are added or statuses change */}
            <ReactECharts option={sankeyOptions} notMerge={true} style={{ height: '220px', width: '100%' }} />
          </div>
        </div>
      </div>


      {/* ======================================================
          MODAL: 3D Query Distribution Chart
          Full-screen overlay triggered by "🧊 3D View" button.
          Uses echarts-gl with autoRotate for a dynamic effect.
      ====================================================== */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="w-full h-full max-w-5xl max-h-[600px] glass-card rounded-3xl p-6 flex flex-col relative border border-[#10B981]/30 shadow-[0_0_80px_rgba(16,185,129,0.2)]">

            {/* Close button */}
            <button
              onClick={() => setActiveModal(false)}
              className="absolute top-6 right-6 text-white bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 px-5 py-2.5 rounded-xl transition-all z-20 font-bold"
            >
              ✕ Close 3D View
            </button>

            {/* Modal title */}
            <h2 className="text-2xl font-bold text-[#10B981] mb-2">3D Live Query Distribution Engine</h2>

            {/* 3D chart canvas — cursor shows grab interaction hint */}
            <div className="flex-1 w-full bg-[#020617]/80 rounded-2xl overflow-hidden border border-white/10 relative shadow-inner cursor-grab active:cursor-grabbing">
              <ReactECharts
                option={get3DOptions()}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'canvas' }} // Canvas renderer required for echarts-gl 3D
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveQuerySimulator;
