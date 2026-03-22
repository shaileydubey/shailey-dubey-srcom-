import React from 'react'; // Imports the core React library required to build the UI component
import ReactECharts from 'echarts-for-react'; // Imports the ECharts React wrapper to render interactive data visualizations

// ======================== AIQueryCategories ========================
// Data Visualization -> Renders AI Query volume and intent cluster charts based on filtered logs
//      ||
//      Sub-calls -> getQueryBubbleOptions / getQueryBarChartOptions -> Generates specific chart configurations
//      ||
//      React -> Component -> Receives props from AdminDashboard and maps them to ECharts components
// ===============================================================
const AIQueryCategories = ({ filteredLogs, onChartClick, setActiveModal, getHexColor, smartQuery, setSmartQuery, handleSmartSearch, isSearching }) => {

  // ======================== getQueryBubbleOptions ========================
  // Chart Configuration -> Processes log data to generate a bubble (scatter) chart layout for query intents
  //      ||
  //      Sub-calls -> forEach -> Iterates over nested query arrays to aggregate category volumes
  //      ||
  //      ECharts -> Scatter Series -> Maps aggregated data to dynamic bubble sizes and colors
  // ===============================================================
  const getQueryBubbleOptions = () => {
    const categoryCounts = {}; // Initializes an empty object to track the volume of each query category
    filteredLogs.forEach(log => { // Iterates through the currently filtered array of call logs
      log.queries.forEach(q => { // Iterates through the nested array of AI queries within each call log
        categoryCounts[q.type] = (categoryCounts[q.type] || 0) + 1; // Increments the volume count for the specific query category, initializing at 0 if it doesn't exist
      });
    });
    const uniqueCats = Object.keys(categoryCounts); // Extracts an array of unique category names from the tracker object keys

    return {
      tooltip: { trigger: 'item', formatter: '{b}<br/>Volume: {c[1]}' }, // Configures the tooltip to show the category name and its specific volume on hover
      grid: { left: '8%', right: '8%', bottom: '15%', top: '15%' }, // Sets the internal padding margins for the chart grid
      xAxis: { type: 'category', data: uniqueCats, axisLabel: { color: '#aaa' } }, // Configures the X-axis to display the unique category names with custom text styling
      yAxis: { type: 'value', name: 'Volume', minInterval: 1, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#aaa' } }, // Configures the Y-axis to show numeric volumes with subtle background split lines
      series: [{
        type: 'scatter', // Defines the chart series as a scatter plot to simulate a bubble chart
        symbolSize: (val) => (val[2] * 8) + 15, // Dynamically calculates the radius of each bubble based on its volume value
        cursor: 'pointer', // Changes the mouse cursor to a pointer on hover to indicate interactivity
        itemStyle: {
          opacity: 0.9, // Sets slight transparency for overlapping bubbles
          shadowBlur: 10, // Applies a glowing shadow effect around the bubbles
          shadowColor: 'rgba(0,0,0,0.5)', // Sets the color of the bubble shadow
          color: (params) => getHexColor(params.name) // Dynamically assigns the bubble color using the passed getHexColor helper function
        },
        data: uniqueCats.map(c => ({ name: c, value: [c, categoryCounts[c], categoryCounts[c]] })) // Maps the aggregated category data into the specific array structure required by ECharts scatter plots
      }]
    };
  };

  // ======================== getQueryBarChartOptions ========================
  // Chart Configuration -> Processes and sorts log data to generate a standard bar chart for query volumes
  //      ||
  //      Sub-calls -> Object.keys().sort() -> Sorts categories in descending order based on volume
  //      ||
  //      ECharts -> Bar Series -> Maps the sorted aggregated data into vertical columns
  // ===============================================================
  const getQueryBarChartOptions = () => {
    const categoryCounts = {}; // Initializes an empty object to track and aggregate query category frequencies
    filteredLogs.forEach(log => { // Iterates through the filtered call logs provided via props
      log.queries.forEach(q => { // Iterates through the inner array of queries for each log
        categoryCounts[q.type] = (categoryCounts[q.type] || 0) + 1; // Increments the counter for the specific AI query type
      });
    });
    const sortedCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]); // Extracts category names and sorts them in descending order based on their calculated volumes

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, // Configures the tooltip to highlight the hovered column with a background shadow
      grid: { left: '5%', right: '5%', bottom: '15%', top: '15%' }, // Sets the internal margins and spacing for the bar chart rendering area
      xAxis: { type: 'category', data: sortedCategories, axisLabel: { color: '#aaa', interval: 0 } }, // Configures the X-axis with the sorted category names, forcing all labels to display without skipping
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#aaa' }, minInterval: 1 }, // Configures the Y-axis for whole number values with customized faint grid lines
      series: [{
        name: 'Queries', // Assigns a name to the data series for tooltip reference
        type: 'bar', // Defines the visualization type strictly as a vertical bar chart
        data: sortedCategories.map(c => categoryCounts[c]), // Maps the sorted category names to their corresponding volume counts
        cursor: 'pointer', // Changes the cursor to indicate the bars are clickable for filtering
        itemStyle: {
          color: (params) => getHexColor(params.name), // Dynamically assigns a consistent color to each bar using the external helper function
          borderRadius: [4, 4, 0, 0] // Rounds the top left and top right corners of each bar for aesthetic styling
        }
      }]
    };
  };

  {/* Changed Fragment to a flex-col div so the search box and charts stack properly */}
  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* ======================== SMART AI SEARCH BOX ======================== */}
      {/* Interactive natural language query input powered by Cortex AI styling */}
      <div className="bg-[#020617]/80 p-1.5 rounded-xl border border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] focus-within:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all">
        <form onSubmit={handleSmartSearch} className="flex items-center gap-2">
          <span className="pl-3 text-[#10B981] animate-pulse">🤖</span>
          <input 
            type="text" 
            value={smartQuery}
            onChange={(e) => setSmartQuery(e.target.value)}
            placeholder="Ask the Dashboard: e.g., '10 minute pehle aayi HR queries dikhao'" 
            className="w-full bg-transparent text-sm text-white px-2 py-2 outline-none placeholder-gray-500"
            disabled={isSearching}
          />
          <button 
            type="submit" 
            disabled={isSearching || !smartQuery.trim()}
            className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-80 disabled:opacity-50 text-white text-xs font-bold py-2 px-5 rounded-lg transition-all"
          >
            {isSearching ? 'Analyzing...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Container for the Bar Chart -> Applies glassmorphism styling, rounded corners, and a fixed height */}
      <div className="glass-card-hover rounded-2xl p-6 h-[280px]">
        {/* Header title for the Bar Chart section */}
        <h2 className="text-lg font-semibold mb-2">Query Volumes (Bar)</h2>
        {/* Renders the ECharts instance dynamically utilizing the generated bar chart options and binding click events */}
        <ReactECharts notMerge={true} option={getQueryBarChartOptions()} onEvents={{ click: onChartClick }} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Container for the Bubble Chart -> Applies glassmorphism styling, fixed height, and flex column layout for internal elements */}
      <div className="glass-card-hover rounded-2xl p-6 h-[280px] flex flex-col relative">
        {/* Wrapper for the header and action button, utilizing flexbox for horizontal spacing */}
        <div className="flex justify-between items-start mb-2">
          {/* Header title for the Bubble Chart section */}
          <h2 className="text-lg font-semibold text-gray-200">Intent Clusters (Bubble)</h2>
          {/* Action Button -> Triggers the 3D visualization modal by setting state in the parent component */}
          <button onClick={() => setActiveModal('queryCat')} className="bg-[#6366F1]/20 text-white border border-[#6366F1]/40 px-3 py-1 rounded-lg text-xs font-bold z-10 hover:bg-[#6366F1]/50 transition-colors">
            🧊 View 3D
          </button>
        </div>
        {/* Wrapper for the chart canvas ensuring it takes up remaining vertical space */}
        <div className="flex-1 relative">
          {/* Renders the ECharts instance dynamically utilizing the generated bubble chart options and binding click events */}
          <ReactECharts notMerge={true} option={getQueryBubbleOptions()} onEvents={{ click: onChartClick }} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

    </div>
  );
};

export default AIQueryCategories; // Exports the customized visualization component for integration into the main dashboard application