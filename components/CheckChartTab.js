import { useState, useEffect } from 'react';

export default function CheckChartTab() {
  const [activeSubTab, setActiveSubTab] = useState('honors');
  const [honorsChart, setHonorsChart] = useState({ stages: [] });
  const [nonHonorsChart, setNonHonorsChart] = useState({ stages: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [stageColors, setStageColors] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(null);
  
  const colorOptions = [
    { name: 'Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Blue', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { name: 'Green', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { name: 'Orange', gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
    { name: 'Red', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    { name: 'Teal', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' },
    { name: 'Pink', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
    { name: 'Indigo', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }
  ];

  useEffect(() => {
    fetchCheckCharts();
  }, []);

  const fetchCheckCharts = async () => {
    try {
      setLoading(true);
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'x-user-role': 'admin'
      };
      
      const [honorsRes, nonHonorsRes] = await Promise.all([
        fetch('/api/admin/checkchart?type=honors', { headers }),
        fetch('/api/admin/checkchart?type=nonhonors', { headers })
      ]);

      const honorsData = await honorsRes.json();
      const nonHonorsData = await nonHonorsRes.json();

      if (honorsData.success) {
        const chart = honorsData.chart || { stages: [] };
        setHonorsChart(chart);
        // Initialize colors for existing stages
        const colors = {};
        chart.stages.forEach((stage, idx) => {
          colors[stage.id] = stage.color || colorOptions[idx % colorOptions.length].gradient;
        });
        setStageColors(prev => ({...prev, ...colors}));
      }
      if (nonHonorsData.success) {
        const chart = nonHonorsData.chart || { stages: [] };
        setNonHonorsChart(chart);
        // Initialize colors for existing stages
        const colors = {};
        chart.stages.forEach((stage, idx) => {
          colors[stage.id] = stage.color || colorOptions[idx % colorOptions.length].gradient;
        });
        setStageColors(prev => ({...prev, ...colors}));
      }
    } catch (error) {
      console.error('Error fetching check charts:', error);
      showNotification('Failed to load check charts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveChart = async () => {
    try {
      setSaving(true);
      const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
      
      // Add colors to stages before saving
      const chartWithColors = {
        ...chart,
        stages: chart.stages.map(stage => ({
          ...stage,
          color: stageColors[stage.id] || colorOptions[0].gradient
        }))
      };
      
      const response = await fetch('/api/admin/checkchart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          type: activeSubTab,
          chart: chartWithColors
        })
      });

      const data = await response.json();
      if (data.success) {
        showNotification(`${activeSubTab === 'honors' ? 'Honors' : 'Non-honors'} chart saved successfully`);
        setEditMode(false);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving chart:', error);
      showNotification('Failed to save check chart', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addStage = () => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    
    const newStage = {
      id: `stage_${Date.now()}`,
      name: 'New Stage',
      order: chart.stages.length,
      topics: []
    };
    
    // Set default color for new stage (Purple)
    setStageColors(prev => ({
      ...prev,
      [newStage.id]: colorOptions[0].gradient
    }));
    
    setChart({
      ...chart,
      stages: [...chart.stages, newStage]
    });
  };

  const updateStage = (stageIndex, updates) => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    
    const updatedStages = [...chart.stages];
    updatedStages[stageIndex] = { ...updatedStages[stageIndex], ...updates };
    
    setChart({ ...chart, stages: updatedStages });
  };

  const deleteStage = (stageIndex) => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    
    const updatedStages = chart.stages.filter((_, idx) => idx !== stageIndex);
    setChart({ ...chart, stages: updatedStages });
  };

  const addTopic = (stageIndex) => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    
    const newTopic = {
      id: `topic_${Date.now()}`,
      name: 'New Topic',
      tasks: []
    };
    
    const updatedStages = [...chart.stages];
    if (!updatedStages[stageIndex].topics) {
      updatedStages[stageIndex].topics = [];
    }
    updatedStages[stageIndex].topics.push(newTopic);
    
    setChart({ ...chart, stages: updatedStages });
  };

  const updateTopic = (stageIndex, topicIndex, updates) => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    
    const updatedStages = [...chart.stages];
    updatedStages[stageIndex].topics[topicIndex] = {
      ...updatedStages[stageIndex].topics[topicIndex],
      ...updates
    };
    
    setChart({ ...chart, stages: updatedStages });
  };

  const deleteTopic = (stageIndex, topicIndex) => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    
    const updatedStages = [...chart.stages];
    updatedStages[stageIndex].topics = updatedStages[stageIndex].topics.filter(
      (_, idx) => idx !== topicIndex
    );
    
    setChart({ ...chart, stages: updatedStages });
  };

  const addTask = (stageIndex, topicIndex) => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    
    const newTask = {
      id: `task_${Date.now()}`,
      name: 'New Task',
      instructions: '',
      points: 0,
      order: chart.stages[stageIndex].topics[topicIndex].tasks.length
    };
    
    const updatedStages = [...chart.stages];
    updatedStages[stageIndex].topics[topicIndex].tasks.push(newTask);
    
    setChart({ ...chart, stages: updatedStages });
  };

  const updateTask = (stageIndex, topicIndex, taskIndex, updates) => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    
    const updatedStages = [...chart.stages];
    updatedStages[stageIndex].topics[topicIndex].tasks[taskIndex] = {
      ...updatedStages[stageIndex].topics[topicIndex].tasks[taskIndex],
      ...updates
    };
    
    setChart({ ...chart, stages: updatedStages });
  };

  const deleteTask = (stageIndex, topicIndex, taskIndex) => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    
    const updatedStages = [...chart.stages];
    updatedStages[stageIndex].topics[topicIndex].tasks = updatedStages[stageIndex].topics[topicIndex].tasks.filter(
      (_, idx) => idx !== taskIndex
    );
    
    setChart({ ...chart, stages: updatedStages });
  };

  const moveItem = (type, fromIndex, toIndex, parentIndices = {}) => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    const setChart = activeSubTab === 'honors' ? setHonorsChart : setNonHonorsChart;
    const updatedStages = [...chart.stages];

    if (type === 'stage') {
      const [movedStage] = updatedStages.splice(fromIndex, 1);
      updatedStages.splice(toIndex, 0, movedStage);
      // Update order
      updatedStages.forEach((stage, idx) => {
        stage.order = idx;
      });
    } else if (type === 'topic' && parentIndices.stageIndex !== undefined) {
      const topics = [...updatedStages[parentIndices.stageIndex].topics];
      const [movedTopic] = topics.splice(fromIndex, 1);
      topics.splice(toIndex, 0, movedTopic);
      updatedStages[parentIndices.stageIndex].topics = topics;
    } else if (type === 'task' && parentIndices.stageIndex !== undefined && parentIndices.topicIndex !== undefined) {
      const tasks = [...updatedStages[parentIndices.stageIndex].topics[parentIndices.topicIndex].tasks];
      const [movedTask] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, movedTask);
      // Update order
      tasks.forEach((task, idx) => {
        task.order = idx;
      });
      updatedStages[parentIndices.stageIndex].topics[parentIndices.topicIndex].tasks = tasks;
    }

    setChart({ ...chart, stages: updatedStages });
  };

  const renderChart = () => {
    const chart = activeSubTab === 'honors' ? honorsChart : nonHonorsChart;
    
    if (!chart.stages || chart.stages.length === 0) {
      return (
        <div className="empty-state">
          {editMode ? (
            <button className="add-stage-button create-first" onClick={addStage}>
              <span className="btn-icon">+</span>
              <span className="btn-text">
                <span className="btn-title">Create First Stage</span>
                <span className="btn-subtitle">Start building your curriculum</span>
              </span>
            </button>
          ) : (
            <>
              <div className="empty-icon">📄</div>
              <p>No {activeSubTab === 'honors' ? 'honors' : 'non-honors'} curriculum defined</p>
              <button className="start-editing-btn" onClick={() => setEditMode(true)}>
                Start Building
              </button>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="chart-container">
        {chart.stages.map((stage, stageIndex) => (
          <div key={stage.id} className={`stage-card ${stage.topics && stage.topics.length > 0 ? 'has-content' : ''}`}>
            {editMode ? (
              <div className="stage-header-edit">
                <div className="stage-node" data-color={stageColors[stage.id] || colorOptions[0].gradient}>
                  <button
                    className="color-picker-btn"
                    onClick={() => setShowColorPicker(showColorPicker === stage.id ? null : stage.id)}
                    title="Choose color"
                  >
                    <span className="icon">🎨</span>
                  </button>
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateStage(stageIndex, { name: e.target.value })}
                    className="stage-name-input"
                    placeholder="Stage name..."
                  />
                  <button
                    className="control-btn delete"
                    onClick={() => deleteStage(stageIndex)}
                    title="Delete stage"
                  >
                    <span className="icon">×</span>
                  </button>
                </div>
                {showColorPicker === stage.id && (
                  <div className="color-picker-dropdown">
                    {colorOptions.map((color, idx) => (
                      <button
                        key={idx}
                        className="color-option"
                        style={{ background: color.gradient }}
                        onClick={() => {
                          setStageColors(prev => ({...prev, [stage.id]: color.gradient}));
                          setShowColorPicker(null);
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="stage-header-view">
                <div
                  className="stage-node-view"
                  data-color={stageColors[stage.id] || colorOptions[0].gradient}
                  style={{'--stage-color': stageColors[stage.id] || colorOptions[0].gradient}}
                >
                  <h3>{stage.name || 'Unnamed Stage'}</h3>
                  <span className="stage-meta">{stage.topics ? stage.topics.length : 0} topics</span>
                </div>
              </div>
            )}

            <div className="topics-container">
              {stage.topics && stage.topics.map((topic, topicIndex) => (
                <div key={topic.id} className="topic-card">
                  <div className="topic-node">
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={topic.name}
                          onChange={(e) => updateTopic(stageIndex, topicIndex, { name: e.target.value })}
                          className="topic-name-input"
                          placeholder="Topic name..."
                        />
                        <button
                          className="control-btn delete small"
                          onClick={() => deleteTopic(stageIndex, topicIndex)}
                          title="Delete"
                        >
                          <span className="icon">×</span>
                        </button>
                      </>
                    ) : (
                      <div className="topic-node-card">
                        <div className="topic-connector"></div>
                        <div className="topic-node-content">
                          <div className="topic-node-header">
                            <div className="topic-node-icon">📖</div>
                            <div className="topic-node-title">
                              <h4>{topic.name || 'Unnamed Topic'}</h4>
                              <div className="topic-node-subtitle">{topic.tasks ? topic.tasks.length : 0} tasks</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="tasks-container task-list">
                    {topic.tasks && topic.tasks.map((task, taskIndex) => (
                      <div key={task.id} className={`task-item ${editMode ? 'edit-mode' : ''}`}>
                        {editMode ? (
                          <div className="task-edit">
                            <div className="task-number">{taskIndex + 1}</div>
                            <input
                              type="text"
                              value={task.name}
                              onChange={(e) => updateTask(stageIndex, topicIndex, taskIndex, { name: e.target.value })}
                              className="task-name-input"
                              placeholder="Task description..."
                            />
                            <input
                              type="url"
                              value={task.instructions || ''}
                              onChange={(e) => updateTask(stageIndex, topicIndex, taskIndex, { instructions: e.target.value })}
                              className="task-url-input"
                              placeholder="Instructions URL (optional)"
                            />
                            <input
                              type="number"
                              value={task.points || 0}
                              onChange={(e) => updateTask(stageIndex, topicIndex, taskIndex, { points: parseInt(e.target.value) || 0 })}
                              className="task-points-input"
                              min="0"
                            />
                            <span className="pts-label">pts</span>
                            <button
                              className="control-btn delete small"
                              onClick={() => deleteTask(stageIndex, topicIndex, taskIndex)}
                              title="Delete"
                            >
                              <span className="icon">×</span>
                            </button>
                          </div>
                        ) : (
                          <div className="task-node">
                            <div className="task-number-circle">
                              {taskIndex + 1}
                            </div>
                            <div className="task-info">
                              <div className="task-title">{task.name}</div>
                              {task.instructions && (
                                <a href={task.instructions} target="_blank" rel="noopener noreferrer" className="task-link">
                                  View Instructions
                                </a>
                              )}
                            </div>
                            <div className="task-points">
                              <div className="task-points-value">{task.points}</div>
                              <div className="task-points-label">pts</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {editMode && (
                      <button
                        className="add-task-button"
                        onClick={() => addTask(stageIndex, topicIndex)}
                      >
                        + Add Task
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {editMode && (
                <button
                  className="add-topic-button"
                  onClick={() => addTopic(stageIndex)}
                >
                  <span className="btn-icon">+</span>
                  <span>Add Topic</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {editMode && (
          <button className="add-stage-button" onClick={addStage}>
            <span className="btn-icon">+</span>
            <span>Add New Stage</span>
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading check charts...</div>
      </div>
    );
  }

  return (
    <div className="check-chart-tab check-chart-wrapper">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="tab-header">
        <h2>Check Chart Management</h2>
        <div className="header-actions">
          {editMode ? (
            <>
              <button
                className="save-btn"
                onClick={saveChart}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setEditMode(false);
                  fetchCheckCharts(); // Reset to saved version
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="edit-btn"
              onClick={() => setEditMode(true)}
            >
              Edit Chart
            </button>
          )}
        </div>
      </div>


      <div className="sub-tabs">
        <button
          className={`sub-tab ${activeSubTab === 'honors' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('honors')}
        >
          Honors
        </button>
        <button
          className={`sub-tab ${activeSubTab === 'nonhonors' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('nonhonors')}
        >
          Non-Honors
        </button>
      </div>

      <div className="chart-content">
        {renderChart()}
      </div>

      <style jsx>{`
        .check-chart-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
        }

        .check-chart-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #e0e0e0;
          overflow: hidden;
        }

        .tab-header {
          padding: 32px;
          border-bottom: 1px solid #e0e0e0;
          background: #fafafa;
        }

        .tab-header h2 {
          margin: 0 0 24px 0;
          color: #1a1a1a;
          font-size: 1.8rem;
          font-weight: 300;
          letter-spacing: -0.02em;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .save-btn, .cancel-btn, .edit-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .save-btn {
          background: #10b981;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        .cancel-btn {
          background: #6b7280;
          color: white;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #4b5563;
          transform: translateY(-1px);
        }

        .edit-btn {
          background: #1a1a1a;
          color: white;
        }

        .edit-btn:hover {
          background: #333;
          transform: translateY(-1px);
        }

        .save-btn:disabled, .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .sub-tabs {
          display: flex;
          background: white;
          border-bottom: 1px solid #e0e0e0;
        }

        .sub-tab {
          padding: 16px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: #666;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sub-tab:hover {
          background: #f5f5f5;
          color: #333;
        }

        .sub-tab.active {
          border-bottom-color: #4A90E2;
          color: #4A90E2;
          background: #f8f9fa;
        }

        .chart-content {
          padding: 0;
          background: white;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          background: white;
          border-radius: 12px;
        }

        .loading-spinner {
          color: #666;
          font-size: 1.1rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 40px;
          text-align: center;
          background: #fafafa;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 24px;
          opacity: 0.6;
        }

        .empty-state p {
          color: #666;
          font-size: 1.1rem;
          margin: 0 0 32px 0;
        }

        .start-editing-btn, .add-stage-button {
          background: #4A90E2;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .start-editing-btn:hover, .add-stage-button:hover {
          background: #357ABD;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
        }

        .add-stage-button.create-first {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-size: 1.2rem;
          padding: 24px 48px;
        }

        .btn-icon {
          font-size: 1.5rem;
          font-weight: 300;
        }

        .btn-text {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .btn-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .btn-subtitle {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .chart-container {
          padding: 40px;
          background: white;
        }

        .stage-card {
          background: white;
          border-radius: 16px;
          margin-bottom: 32px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
          overflow: hidden;
          transition: box-shadow 0.2s ease;
        }

        .stage-card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .stage-card.has-content {
          border-left: 4px solid var(--stage-color);
        }

        .stage-header-edit, .stage-header-view {
          padding: 24px;
          background: #fafafa;
          border-bottom: 1px solid #e0e0e0;
        }

        .stage-node {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stage-node[data-color] {
          background: var(--stage-color);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stage-name-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .stage-name-input:focus {
          outline: none;
          border-color: #4A90E2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .color-picker-btn {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-picker-btn:hover {
          background: white;
          transform: scale(1.05);
        }

        .color-picker-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }

        .color-option {
          width: 32px;
          height: 32px;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .color-option:hover {
          transform: scale(1.2);
        }

        .control-btn {
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .control-btn:hover {
          background: #b91c1c;
          transform: scale(1.05);
        }

        .control-btn.delete.small {
          padding: 4px 8px;
          font-size: 0.8rem;
        }

        .stage-node-view {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stage-node-view[data-color] {
          background: var(--stage-color);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stage-node-view h3 {
          margin: 0;
          color: white;
          font-size: 1.3rem;
          font-weight: 500;
        }

        .stage-meta {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .topics-container {
          padding: 0;
        }

        .topic-card {
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
          background: white;
        }

        .topic-card:last-child {
          border-bottom: none;
        }

        .topic-node {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .topic-node-card {
          flex: 1;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          position: relative;
        }

        .topic-connector {
          width: 2px;
          height: 40px;
          background: #e0e0e0;
          margin-left: 19px;
          margin-top: 20px;
        }

        .topic-node-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .topic-node-header {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .topic-node-icon {
          font-size: 2rem;
          opacity: 0.7;
        }

        .topic-node-title h4 {
          margin: 0 0 4px 0;
          color: #1a1a1a;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .topic-node-subtitle {
          color: #666;
          font-size: 0.9rem;
        }

        .topic-name-input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
        }

        .topic-name-input:focus {
          outline: none;
          border-color: #4A90E2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .task-list {
          margin-left: 40px;
          padding-left: 20px;
          border-left: 2px solid #e0e0e0;
        }

        .task-item {
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
          margin-bottom: 12px;
          border: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .task-item:hover {
          background: #f5f5f5;
          border-color: #e0e0e0;
        }

        .task-item.edit-mode {
          background: white;
          border: 2px solid #e0e0e0;
        }

        .task-edit {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .task-number {
          background: #4A90E2;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .task-name-input, .task-url-input {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.9rem;
          flex: 1;
          min-width: 200px;
        }

        .task-points-input {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.9rem;
          width: 80px;
        }

        .pts-label {
          color: #666;
          font-size: 0.85rem;
          margin-left: 4px;
        }

        .task-node {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #f0f0f0;
        }

        .task-number-circle {
          background: #10b981;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .task-info {
          flex: 1;
        }

        .task-title {
          font-size: 0.95rem;
          color: #1a1a1a;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .task-link {
          color: #4A90E2;
          text-decoration: none;
          font-size: 0.85rem;
        }

        .task-link:hover {
          text-decoration: underline;
        }

        .task-points {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f0f0f0;
          border-radius: 8px;
          padding: 8px 12px;
          min-width: 50px;
        }

        .task-points-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .task-points-label {
          font-size: 0.75rem;
          color: #666;
        }

        .add-task-button, .add-topic-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 16px 0;
        }

        .add-task-button:hover, .add-topic-button:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }

        .notification.error {
          background: #dc2626;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .check-chart-tab {
            padding: 20px;
          }

          .tab-header {
            padding: 24px;
          }

          .tab-header h2 {
            font-size: 1.5rem;
          }

          .header-actions {
            flex-direction: column;
            gap: 12px;
          }

          .chart-container {
            padding: 20px;
          }

          .stage-card {
            margin-bottom: 20px;
          }

          .stage-header-edit, .stage-header-view, .topic-card {
            padding: 16px;
          }

          .task-list {
            margin-left: 20px;
            padding-left: 10px;
          }

          .task-edit {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
          }

          .task-name-input, .task-url-input {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
