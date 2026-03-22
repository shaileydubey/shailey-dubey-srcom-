import React from 'react'; // Imports the core React library to enable component creation
import ReactECharts from 'echarts-for-react'; // Imports the ECharts React wrapper to render the visualization components

// ======================== StaffPerformance ========================
// Data Visualization -> Renders Staff and Team performance charts based on filtered logs
//      ||
//      Sub-calls -> getTeamPerformanceOptions / get2DAgentOptions -> Generates specific chart configurations
//      ||
//      React -> Component -> Receives data and event handlers as props from the parent AdminDashboard
// ===============================================================
const StaffPerformance = ({ filteredLogs, onChartClick, setActiveModal }) => {

  // ======================== getTeamPerformanceOptions ========================
  // Chart Configuration -> Processes log data to generate a dual-axis Bar and Line chart for team metrics
  //      ||
  //      Sub-calls -> Array.forEach() -> Aggregates total calls and CSAT scores grouped by team
  //      ||
  //      ECharts -> Bar/Line Series -> Maps the calculated metrics to visual chart axes
  // ===============================================================
  const getTeamPerformanceOptions = () => {
    const teamStats = {}; // Initializes an empty object to temporarily store and group the aggregated team data
    filteredLogs.forEach(log => { // Iterates over the currently filtered array of call logs
      if (log.team) { // Verifies that the current log entry contains a valid team assignment
        if (!teamStats[log.team]) teamStats[log.team] = { calls: 0, csat: 0 }; // Initializes the team's data structure if it does not already exist in the tracker
        teamStats[log.team].calls += 1; // Increments the total call count for the specific team
        teamStats[log.team].csat  += log.csat || 0; // Adds the log's CSAT score to the team's total, defaulting to 0 if missing
      }
    });
    const teams = Object.keys(teamStats); // Extracts an array of unique team names from the aggregated tracker object

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, // Configures the tooltip to display data for all series on the hovered axis with a shadow highlight
      grid: { left: '5%', right: '5%', bottom: '15%', top: '10%' }, // Sets the internal margins to provide padding around the chart area
      xAxis: {
        type: 'category', // Configures the horizontal axis to display discrete string categories rather than continuous numbers
        data: teams.length ? teams : ['No Data'], // Supplies the array of team names, or falls back to a 'No Data' label if empty
        axisLabel: { color: '#aaa' } // Applies a light gray styling to the X-axis text labels
      },
      yAxis: [ // Configures two independent vertical axes for different data scales (Calls vs CSAT)
        { type: 'value', name: 'Calls', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#aaa' }, minInterval: 1 }, // Left Y-axis representing absolute call volume
        { type: 'value', name: 'CSAT', min: 0, max: 5, splitLine: { show: false }, axisLabel: { color: '#aaa' } } // Right Y-axis representing average CSAT scores capped between 0 and 5
      ],
      series: [ 
        { name: 'Calls',  type: 'bar',  data: teams.map(t => teamStats[t].calls), itemStyle: { color: '#6366F1' }, borderRadius: [4,4,0,0] }, // Defines the bar series for call volume, mapped to the left Y-axis, colored indigo
        { name: 'CSAT',   type: 'line', data: teams.map(t => (teamStats[t].csat / teamStats[t].calls).toFixed(1)), itemStyle: { color: '#10B981' }, yAxisIndex: 1, smooth: true } // Defines the line series for average CSAT, mapped to the right Y-axis, colored emerald
      ]
    };
  };

  // ======================== get2DAgentOptions ========================
  // Chart Configuration -> Processes log data to generate a 2D scatter plot visualizing individual agent metrics
  //      ||
  //      Sub-calls -> Array.forEach() -> Aggregates call volume and CSAT scores grouped by individual agents
  //      ||
  //      ECharts -> Scatter Series -> Maps the computed metrics to dynamic plotted coordinates
  // ===============================================================
  const get2DAgentOptions = () => {
    const agentStats = {}; // Initializes an empty object to track and aggregate performance metrics for each agent
    filteredLogs.forEach(log => { // Iterates through the provided array of filtered call logs
      if (log.agent) { // Verifies that the current log entry contains a valid agent assignment
        if (!agentStats[log.agent]) agentStats[log.agent] = { calls: 0, csat: 0 }; // Initializes the agent's data structure if it does not already exist
        agentStats[log.agent].calls += 1; // Increments the total call count handled by the specific agent
        agentStats[log.agent].csat  += log.csat || 0; // Adds the log's CSAT score to the agent's total accumulation
      }
    });

    const agentData = Object.keys(agentStats).map(agent => ({ // Transforms the aggregated object into an array of specifically formatted data points
      name: agent, // Assigns the agent's name to the data point for tooltip identification
      value: [agentStats[agent].calls, parseFloat((agentStats[agent].csat / agentStats[agent].calls).toFixed(1))] // Maps the coordinates as [X: Total Calls, Y: Average CSAT]
    }));

    return {
      tooltip: { trigger: 'item', formatter: '{b}<br/>Total Calls: {c[0]}<br/>Avg CSAT: {c[1]}' }, // Customizes the hover tooltip to display the agent name alongside their specific metrics
      grid: { left: '8%', right: '8%', bottom: '15%', top: '10%' }, // Sets the internal spacing and margins around the scatter plot grid
      xAxis: { name: 'Calls Volume', type: 'value', minInterval: 1, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#aaa' } }, // Configures the horizontal axis to represent numeric call volume
      yAxis: { name: 'CSAT Score', type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#aaa' }, min: 2, max: 5 }, // Configures the vertical axis to represent CSAT scores, bounded between 2 and 5 for visual clarity
      series: [{
        type: 'scatter', // Declares the visualization type strictly as a scatter plot
        symbolSize: 25, // Assigns a static pixel radius to all plotted data points
        cursor: 'pointer', // Changes the mouse cursor to a pointer on hover to indicate interactive elements
        itemStyle: { 
          opacity: 0.8, // Applies slight transparency to handle overlapping data points
          shadowBlur: 10, // Adds a glowing shadow effect behind the plotted points
          shadowColor: 'rgba(0,0,0,0.5)', // Sets the shadow color to a semi-transparent black
          color: (params) => // Conditionally applies color based on the agent's calculated average CSAT score
            params.data.value[1] >= 4.0 ? '#10B981' : // Assigns emerald green for scores 4.0 and above
            params.data.value[1] >= 3.0 ? '#F59E0B' : '#ef4444' // Assigns amber for scores 3.0 and above, otherwise defaults to red
        },
        data: agentData // Injects the computed and formatted agent data array into the series
      }]
    };
  };
{/* React Fragment -> Groups the two sibling chart containers without injecting an extra DOM node */}
  return (
    
    <>
      {/* Team Performance Chart Container -> Applies glassmorphism styling, rounded corners, and a fixed height */}
      <div className="glass-card-hover rounded-2xl p-6 h-[280px]">
        {/* Section Title -> Displays the header for the Team Performance visualization */}
        <h2 className="text-lg font-semibold mb-2">Team Performance</h2>
        {/* ECharts Instance -> Renders the dual-axis chart utilizing the dynamically generated options and binds click handlers */}
        <ReactECharts notMerge={true} option={getTeamPerformanceOptions()} onEvents={{ click: onChartClick }} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Agent Breakdown Chart Container -> Applies glassmorphism styling and establishes a flex column layout */}
      <div className="glass-card-hover rounded-2xl p-6 h-[280px] flex flex-col relative">
        {/* Header Wrapper -> Arranges the title and action button horizontally using flexbox */}
        <div className="flex justify-between items-start mb-2">
          {/* Section Title -> Displays the header for the Agent Breakdown visualization */}
          <h2 className="text-lg font-semibold text-gray-200">Agent Breakdown</h2>
          {/* Action Button -> Triggers the 3D visualization modal by passing 'agent' to the parent's state handler */}
          <button onClick={() => setActiveModal('agent')} className="bg-[#6366F1]/20 text-white border border-[#6366F1]/40 px-3 py-1 rounded-lg text-xs font-bold z-10 hover:bg-[#6366F1]/50 transition-colors">
            🧊 View 3D
          </button>
        </div>
        {/* Chart Canvas Wrapper -> Ensures the ECharts instance expands to fill the remaining vertical space */}
        <div className="flex-1 relative">
          {/* ECharts Instance -> Renders the 2D scatter chart utilizing the dynamically generated options and binds click handlers */}
          <ReactECharts notMerge={true} option={get2DAgentOptions()} onEvents={{ click: onChartClick }} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </>
  );
};

export default StaffPerformance; // Exports the completed presentation component for integration into the main dashboard