import { useState, useEffect } from 'react';

export default function ManageStudentsTab() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterHonors, setFilterHonors] = useState('all');
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [checkModalStudent, setCheckModalStudent] = useState(null);
  const [checkChart, setCheckChart] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [checkChartLoading, setCheckChartLoading] = useState(false);
  
  const [addingStudent, setAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    honors: false
  });
  
  const [newGroup, setNewGroup] = useState({
    name: '',
    color: '#4A90E2'
  });
  
  // Predefined color palette for easy selection
  const colorPalette = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Sky Blue
    '#96CEB4', // Mint
    '#FECA57', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Seafoam
    '#FFB6C1', // Light Pink
    '#87CEEB', // Sky Blue
    '#F4A460', // Sandy Brown
    '#9370DB', // Medium Purple
    '#20B2AA', // Light Sea Green
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching groups and students...');
      
      // Fetch groups
      const groupsResponse = await fetch('/api/admin/groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const groupsData = await groupsResponse.json();
      if (groupsData.success) {
        setGroups(groupsData.groups || []);
        console.log('Groups loaded:', groupsData.groups?.length || 0);
      } else {
        console.error('Failed to fetch groups:', groupsData.message);
      }

      // Fetch students
      const studentsResponse = await fetch('/api/students');
      const studentsData = await studentsResponse.json();
      if (studentsData.success) {
        // Remove duplicates from students
        const uniqueStudents = Array.from(
          new Map((studentsData.students || []).map(s => [`${s.firstName}_${s.lastName}_${s.id}`, s])).values()
        );
        setStudents(uniqueStudents);
        console.log('Students loaded:', uniqueStudents.length);
      } else {
        console.error('Failed to fetch students:', studentsData.message);
        showNotification('Failed to load students', 'error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    // Validate required fields on frontend
    if (!newStudent.firstName.trim() || !newStudent.lastName.trim()) {
      showNotification('First name and last name are required', 'error');
      return;
    }
    
    setAddingStudent(true);
    try {
      console.log('Adding student:', newStudent);
      
      const response = await fetch('/api/admin/add-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newStudent)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        showNotification(`HTTP Error: ${response.status}`, 'error');
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        const email = data.credentials?.email || `${newStudent.firstName}.${newStudent.lastName}@alpha.school`;
        showNotification(`Student added successfully! Email: ${email}`, 'success');
        
        // Reset form
        setNewStudent({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          honors: false
        });
        setShowAddForm(false);
        
        // Refresh data
        console.log('Refreshing student list...');
        await fetchData();
        console.log('Student list refreshed');
      } else {
        console.error('API returned error:', data.message);
        showNotification(data.message || 'Failed to add student', 'error');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      showNotification(`Error adding student: ${error.message}`, 'error');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleUpdateStudent = async (studentId, updates) => {
    try {
      const response = await fetch(`/api/admin/student/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Student updated successfully', 'success');
        fetchData();
        setEditingStudent(null);
      } else {
        showNotification('Failed to update student', 'error');
      }
    } catch (error) {
      showNotification('Error updating student', 'error');
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newGroup)
      });

      const data = await response.json();
      if (data.success) {
        showNotification('House created successfully', 'success');
        setNewGroup({ name: '', color: '#4A90E2' });
        setShowGroupForm(false);
        fetchData();
      } else {
        showNotification(data.message || 'Failed to create house', 'error');
      }
    } catch (error) {
      showNotification('Error creating house', 'error');
    }
  };

  const handleUpdateGroup = async (groupId, updates) => {
    try {
      const response = await fetch('/api/admin/groups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ id: groupId, ...updates })
      });

      const data = await response.json();
      if (data.success) {
        showNotification('House updated successfully', 'success');
        fetchData();
        setEditingGroup(null);
      } else {
        showNotification('Failed to update house', 'error');
      }
    } catch (error) {
      showNotification('Error updating house', 'error');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      const response = await fetch(`/api/admin/student/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Student removed successfully', 'success');
        setEditingStudent(null);
        fetchData();
      } else {
        showNotification(data.message || 'Failed to remove student', 'error');
      }
    } catch (error) {
      showNotification('Error removing student', 'error');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this house? All students will be unassigned.')) return;
    
    try {
      const response = await fetch('/api/admin/groups', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: groupId })
      });

      const data = await response.json();
      if (data.success) {
        showNotification('House deleted successfully', 'success');
        fetchData();
      } else {
        showNotification('Failed to delete house', 'error');
      }
    } catch (error) {
      showNotification('Error deleting house', 'error');
    }
  };

  const handleBulkAssign = async () => {
    if (selectedStudents.length === 0) {
      showNotification('Please select at least one student', 'error');
      return;
    }

    try {
      const response = await fetch('/api/admin/groups/assign-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          groupId: selectedGroup,
          studentIds: selectedStudents,
          action: selectedGroup ? 'assign' : 'unassign'
        })
      });

      const data = await response.json();
      if (data.success) {
        showNotification(data.message, 'success');
        setSelectedStudents([]);
        setShowAssignModal(false);
        fetchData();
      } else {
        showNotification(data.message || 'Failed to assign students', 'error');
      }
    } catch (error) {
      showNotification('Error assigning students', 'error');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllInGroup = (groupId) => {
    const groupStudents = students
      .filter(s => s.groupId == groupId)
      .map(s => s.id);
    setSelectedStudents(prev => {
      const newSelection = [...prev];
      groupStudents.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id == groupId);
    return group ? group.name : 'No House';
  };

  const openCheckModal = async (student) => {
    setCheckModalStudent(student);
    setShowCheckModal(true);
    setCheckChartLoading(true);
    
    try {
      // Fetch the appropriate check chart based on student's honors status
      const chartResponse = await fetch(`/api/admin/checkchart?type=${student.honors ? 'honors' : 'nonhonors'}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-user-role': 'admin'
        }
      });
      const chartData = await chartResponse.json();
      
      // Fetch student's progress
      const progressResponse = await fetch(`/api/admin/checkprogress?studentId=${student.id}&chartType=${student.honors ? 'honors' : 'nonhonors'}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-user-role': 'admin'
        }
      });
      const progressData = await progressResponse.json();
      
      if (chartData.success) {
        setCheckChart(chartData.chart);
      }
      if (progressData.success) {
        setStudentProgress(progressData.progress || []);
      }
    } catch (error) {
      console.error('Error fetching check data:', error);
      showNotification('Failed to load check chart data', 'error');
    } finally {
      setCheckChartLoading(false);
    }
  };

  const handleToggleCheck = async (taskId) => {
    if (!checkModalStudent) return;
    
    const isCompleted = studentProgress.some(p => p.taskId === taskId && p.completed);
    
    try {
      const response = await fetch('/api/admin/checkprogress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          studentId: checkModalStudent.id,
          taskId,
          chartType: checkModalStudent.honors ? 'honors' : 'nonhonors',
          completed: !isCompleted,
          adminEmail: localStorage.getItem('userEmail') || 'admin'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local progress state
        if (!isCompleted) {
          setStudentProgress(prev => [...prev, {
            taskId,
            completed: true,
            completedDate: new Date().toISOString(),
            completedBy: 'admin'
          }]);
        } else {
          setStudentProgress(prev => prev.filter(p => p.taskId !== taskId));
        }
        showNotification(`Check ${!isCompleted ? 'completed' : 'removed'} successfully`, 'success');
      }
    } catch (error) {
      console.error('Error toggling check:', error);
      showNotification('Failed to update check status', 'error');
    }
  };

  const getGroupColor = (groupId) => {
    const group = groups.find(g => g.id == groupId);
    return group ? group.color : '#999';
  };

  // Remove duplicates before filtering
  const uniqueStudents = Array.from(
    new Map(students.map(s => [`${s.firstName}_${s.lastName}_${s.id}`, s])).values()
  );
  
  const filteredStudents = uniqueStudents.filter(student => {
    const searchQuery = searchTerm.toLowerCase().trim();
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    
    // Partial match for better search experience
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchQuery) ||
      student.firstName.toLowerCase().includes(searchQuery) ||
      student.lastName.toLowerCase().includes(searchQuery);
      
    const matchesGroup = filterGroup === 'all' || 
      (filterGroup === 'none' && !student.groupId) ||
      student.groupId == filterGroup;
    const matchesHonors = filterHonors === 'all' || 
      (filterHonors === 'honors' && student.honors) ||
      (filterHonors === 'regular' && !student.honors);
    
    return matchesSearch && matchesGroup && matchesHonors;
  });

  if (loading) {
    return (
      <div className="manage-students-tab">
        <div className="loading">Loading...</div>
        <style jsx>{`
          .manage-students-tab {
            background: #fafafa;
            min-height: calc(100vh - 200px);
            padding: 40px;
          }
          .loading {
            text-align: center;
            padding: 40px;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="manage-students-tab">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button className="notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="tab-header">
        <h2>Manage Students & Houses</h2>
        <div className="header-actions">
          <button
            className="action-btn"
            onClick={() => setShowGroupForm(!showGroupForm)}
          >
            {showGroupForm ? 'Cancel' : '+ Create House'}
          </button>
          <button 
            className="action-btn primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Student'}
          </button>
        </div>
      </div>

      {/* Houses Section */}
      <div className="groups-section">
        <div className="section-header">
          <h3>Houses ({groups.length})</h3>
          {groups.length === 0 && !showGroupForm && (
            <p className="no-groups">No houses created yet. Create your first house to start organizing students.</p>
          )}
        </div>
        
        <div className="groups-grid">
          {groups.map(group => (
            <div key={group.id} className="group-card" style={{borderColor: group.color}}>
              {editingGroup?.id === group.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                    placeholder="House name"
                    className="house-name-input"
                  />
                  <div className="color-selector">
                    <div 
                      className="color-swatch active" 
                      style={{background: editingGroup.color}}
                      onClick={() => document.getElementById(`colorPickerEdit-${group.id}`).click()}
                    >
                      <input
                        type="color"
                        id={`colorPickerEdit-${group.id}`}
                        value={editingGroup.color}
                        onChange={(e) => setEditingGroup({...editingGroup, color: e.target.value})}
                        style={{opacity: 0, position: 'absolute', pointerEvents: 'none'}}
                      />
                    </div>
                    <span className="color-label">{editingGroup.color}</span>
                  </div>
                  <div className="color-palette">
                    {colorPalette.map(color => (
                      <div
                        key={color}
                        className={`palette-color ${editingGroup.color === color ? 'selected' : ''}`}
                        style={{background: color}}
                        onClick={() => setEditingGroup({...editingGroup, color})}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="edit-actions">
                    <button onClick={() => handleUpdateGroup(group.id, editingGroup)} className="save-btn">Save</button>
                    <button onClick={() => setEditingGroup(null)} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="group-header">
                    <h4 style={{color: group.color}}>{group.name}</h4>
                    <div className="color-badge" style={{background: group.color}}></div>
                  </div>
                  <div className="group-stats">
                    {students.filter(s => s.groupId == group.id).length} students
                  </div>
                  <div className="group-actions">
                    <button 
                      onClick={() => {
                        setSelectedGroup(group.id);
                        setShowAssignModal(true);
                      }}
                      className="assign-btn"
                    >
                      Assign Students
                    </button>
                    <button onClick={() => setEditingGroup(group)}>Edit</button>
                    <button onClick={() => handleDeleteGroup(group.id)} className="delete-btn">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {showGroupForm && (
            <div className="group-card new-group">
              <form onSubmit={handleAddGroup}>
                <div className="new-group-inner">
                  <div className="color-strip" style={{background: newGroup.color}}></div>
                  <div className="new-group-form">
                    <input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                      placeholder="Enter house name"
                      className="house-name-input"
                      required
                      autoFocus
                    />
                    <div className="color-selector">
                      <div className="color-swatch active" style={{background: newGroup.color}} onClick={() => document.getElementById('colorPicker').click()}>
                        <input
                          type="color"
                          id="colorPicker"
                          value={newGroup.color}
                          onChange={(e) => setNewGroup({...newGroup, color: e.target.value})}
                          style={{opacity: 0, position: 'absolute', pointerEvents: 'none'}}
                        />
                      </div>
                      <span className="color-label">{newGroup.color}</span>
                    </div>
                    <div className="color-palette">
                      {colorPalette.map(color => (
                        <div
                          key={color}
                          className={`palette-color ${newGroup.color === color ? 'selected' : ''}`}
                          style={{background: color}}
                          onClick={() => setNewGroup({...newGroup, color})}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="form-buttons">
                      <button type="submit" className="save-house-btn">Create</button>
                      <button type="button" onClick={() => {setShowGroupForm(false); setNewGroup({name: '', color: '#4A90E2'});}} className="cancel-house-btn">
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Assignment Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Students to {selectedGroup ? getGroupName(selectedGroup) : 'House'}</h3>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="selection-controls">
                <button 
                  onClick={() => setSelectedStudents(students.map(s => s.id))}
                  className="select-all-btn"
                >
                  Select All
                </button>
                <button 
                  onClick={() => setSelectedStudents([])}
                  className="clear-btn"
                >
                  Clear Selection
                </button>
                <button 
                  onClick={() => selectAllInGroup(null)}
                  className="select-unassigned-btn"
                >
                  Select Unassigned
                </button>
              </div>
              
              <div className="students-selection-list">
                {students.map(student => (
                  <label key={student.id} className="student-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                    />
                    <span className="student-info">
                      <span className="student-name">
                        {student.firstName} {student.lastName}
                        {student.honors && <span className="honors-badge">★</span>}
                      </span>
                      <span className="current-house" style={{color: getGroupColor(student.groupId)}}>
                        {getGroupName(student.groupId)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="modal-actions">
                <div className="selection-count">
                  {selectedStudents.length} student(s) selected
                </div>
                <button 
                  onClick={handleBulkAssign}
                  className="assign-btn primary"
                  disabled={selectedStudents.length === 0}
                >
                  Assign to {getGroupName(selectedGroup)}
                </button>
                <button 
                  onClick={() => {
                    setSelectedGroup(null);
                    handleBulkAssign();
                  }}
                  className="unassign-btn"
                  disabled={selectedStudents.length === 0}
                >
                  Remove from Houses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Form */}
      {showAddForm && (
        <div className="add-student-form">
          <h3>Add New Student</h3>
          <form onSubmit={handleAddStudent}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="firstname.lastname@alpha.school"
                />
              </div>
              <div className="form-group">
                <label>Password (optional)</label>
                <input
                  type="text"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  placeholder="Default: Iloveschool"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newStudent.honors}
                    onChange={(e) => setNewStudent({...newStudent, honors: e.target.checked})}
                  />
                  <span>Honors Student</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={addingStudent}>
                {addingStudent ? 'Adding Student...' : 'Add Student'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn" disabled={addingStudent}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      <div className="students-section">
        <div className="section-header">
          <div className="section-title">
            <h3>All Students ({filteredStudents.length} of {students.length})</h3>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filters">
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Houses</option>
              <option value="none">No House</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <select
              value={filterHonors}
              onChange={(e) => setFilterHonors(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Students</option>
              <option value="honors">Honors Only</option>
              <option value="regular">Regular Only</option>
            </select>
          </div>
        </div>

        <div className="students-table">
          <div className="table-header">
            <div>Name</div>
            <div>Email</div>
            <div>House</div>
            <div>Status</div>
            <div>Goals</div>
            <div>Checks</div>
            <div>Actions</div>
          </div>
          
          {filteredStudents.map(student => (
            <div key={student.id} className="table-row">
              {editingStudent?.id === student.id ? (
                <>
                  <div className="student-name">
                    {editingStudent.firstName} {editingStudent.lastName}
                    {editingStudent.honors && <span className="honors-badge">★</span>}
                  </div>
                  <div className="student-email">
                    {editingStudent.email || `${editingStudent.firstName?.toLowerCase()}.${editingStudent.lastName?.toLowerCase()}@alpha.school`}
                  </div>
                  <div className="student-group">
                    <span 
                      className="group-badge"
                      style={{
                        background: editingStudent.groupId ? getGroupColor(editingStudent.groupId) + '20' : '#f0f0f0',
                        color: editingStudent.groupId ? getGroupColor(editingStudent.groupId) : '#999'
                      }}
                    >
                      {getGroupName(editingStudent.groupId)}
                    </span>
                  </div>
                  <div>
                    <label className="inline-checkbox">
                      <input
                        type="checkbox"
                        checked={editingStudent.honors || false}
                        onChange={(e) => setEditingStudent({...editingStudent, honors: e.target.checked})}
                      />
                      <span>Honors</span>
                    </label>
                  </div>
                  <div className="student-goals">
                    {editingStudent.goals ? (
                      <span className="goals-summary">
                        X:{editingStudent.goals.x || 0} YT:{editingStudent.goals.youtube || 0} TT:{editingStudent.goals.tiktok || 0} IG:{editingStudent.goals.instagram || 0}
                      </span>
                    ) : (
                      <span className="no-goals">Not set</span>
                    )}
                  </div>
                  <div className="check-chart-cell">
                    <button 
                      className="check-btn"
                      onClick={() => openCheckModal(editingStudent)}
                      title="Manage check chart progress"
                    >
                      Checks
                    </button>
                  </div>
                  <div className="edit-actions-group">
                    <button 
                      className="action-btn save"
                      onClick={() => handleUpdateStudent(student.id, {
                        honors: editingStudent.honors || false,
                        groupId: editingStudent.groupId,
                        goals: editingStudent.goals
                      })}
                    >
                      Save
                    </button>
                    <button 
                      className="action-btn cancel"
                      onClick={() => setEditingStudent(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="action-btn remove"
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${editingStudent.firstName} ${editingStudent.lastName}?`)) {
                          handleDeleteStudent(student.id);
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="student-name">
                    {student.firstName} {student.lastName}
                    {student.honors && <span className="honors-badge">★</span>}
                  </div>
                  <div className="student-email">
                    {student.email || `${student.firstName?.toLowerCase()}.${student.lastName?.toLowerCase()}@alpha.school`}
                  </div>
                  <div className="student-group">
                    <span 
                      className="group-badge"
                      style={{
                        background: student.groupId ? getGroupColor(student.groupId) + '20' : '#f0f0f0',
                        color: student.groupId ? getGroupColor(student.groupId) : '#999'
                      }}
                    >
                      {getGroupName(student.groupId)}
                    </span>
                  </div>
                  <div className="student-status">
                    {student.honors ? 'Honors' : 'Regular'}
                  </div>
                  <div className="student-goals">
                    {student.goals ? (
                      <span className="goals-summary">
                        X:{student.goals.x || 0} YT:{student.goals.youtube || 0} TT:{student.goals.tiktok || 0} IG:{student.goals.instagram || 0}
                      </span>
                    ) : (
                      <span className="no-goals">Not set</span>
                    )}
                  </div>
                  <div className="check-chart-cell">
                    <button 
                      className="check-btn"
                      onClick={() => openCheckModal(student)}
                      title="Manage check chart progress"
                    >
                      Checks
                    </button>
                  </div>
                  <div className="student-actions">
                    <button 
                      className="edit-btn"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/admin/student/${student.id}`, {
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                            }
                          });
                          const data = await response.json();
                          if (data.success) {
                            // Merge the profile data with the student data, ensuring honors is properly set
                            setEditingStudent({
                              ...student,
                              ...data.profile,
                              honors: data.profile.honors !== undefined ? data.profile.honors : student.honors,
                              firstName: student.firstName,
                              lastName: student.lastName,
                              email: student.email || `${student.firstName?.toLowerCase()}.${student.lastName?.toLowerCase()}@alpha.school`
                            });
                          } else {
                            setEditingStudent({
                              ...student,
                              honors: student.honors || false,
                              goals: student.goals || { x: 0, youtube: 0, tiktok: 0, instagram: 0 }
                            });
                          }
                        } catch (error) {
                          setEditingStudent({
                            ...student,
                            honors: student.honors || false,
                            goals: student.goals || { x: 0, youtube: 0, tiktok: 0, instagram: 0 }
                          });
                        }
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Check Chart Modal */}
      {showCheckModal && checkModalStudent && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') {
            setShowCheckModal(false);
            setCheckModalStudent(null);
            setCheckChart(null);
            setStudentProgress([]);
          }
        }}>
          <div className="check-chart-modal">
            <div className="check-modal-header">
              <div className="check-modal-student-badge">
                <div className="student-avatar">
                  {checkModalStudent.firstName[0]}{checkModalStudent.lastName[0]}
                </div>
                <div className="student-details">
                  <h3>
                    {checkModalStudent.firstName} {checkModalStudent.lastName}
                    {checkModalStudent.honors && <span className="honors-star">★</span>}
                  </h3>
                  <p className="student-type">
                    {checkModalStudent.honors ? 'Honors' : 'Regular'} Student
                  </p>
                </div>
              </div>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setShowCheckModal(false);
                  setCheckModalStudent(null);
                  setCheckChart(null);
                  setStudentProgress([]);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            {checkChartLoading ? (
              <div className="check-loading-container">
                <div className="check-loading-spinner"></div>
                <p>Loading curriculum...</p>
              </div>
            ) : checkChart && checkChart.stages && checkChart.stages.length > 0 ? (
              <div className="check-modal-body">
                <div className="progress-overview">
                  <div className="progress-stat">
                    <div className="stat-value">{studentProgress.filter(p => p.completed).length}</div>
                    <div className="stat-label">Tasks Completed</div>
                  </div>
                  <div className="progress-stat">
                    <div className="stat-value">
                      {checkChart.stages.reduce((total, stage) => 
                        total + (stage.topics || []).reduce((topicTotal, topic) => 
                          topicTotal + (topic.tasks || []).length, 0), 0)}
                    </div>
                    <div className="stat-label">Total Tasks</div>
                  </div>
                  <div className="progress-stat">
                    <div className="stat-value">{studentProgress.reduce((sum, p) => sum + (p.points || 0), 0)}</div>
                    <div className="stat-label">Points Earned</div>
                  </div>
                  <div className="progress-stat">
                    <div className="stat-value">
                      {Math.round((studentProgress.filter(p => p.completed).length / 
                        Math.max(1, checkChart.stages.reduce((total, stage) => 
                          total + (stage.topics || []).reduce((topicTotal, topic) => 
                            topicTotal + (topic.tasks || []).length, 0), 0))) * 100)}%
                    </div>
                    <div className="stat-label">Progress</div>
                  </div>
                </div>

                <div className="check-stages-container">
                  {checkChart.stages.map((stage, stageIdx) => {
                    const stageTasks = (stage.topics || []).reduce((acc, topic) => 
                      acc + (topic.tasks || []).length, 0);
                    const stageCompleted = (stage.topics || []).reduce((acc, topic) => 
                      acc + (topic.tasks || []).filter(task => 
                        studentProgress.some(p => p.taskId === task.id && p.completed)
                      ).length, 0);
                    
                    return (
                      <div key={stage.id} className="check-stage-card">
                        <div className="stage-header-bar" style={{
                          background: stage.color || ['#1a1a1a', '#4A90E2', '#333333', '#666666'][stageIdx % 4]
                        }}>
                          <h4 className="stage-title">{stage.name}</h4>
                          <div className="stage-progress">
                            <span className="progress-text">{stageCompleted} / {stageTasks}</span>
                            <div className="progress-bar-mini">
                              <div 
                                className="progress-fill-mini" 
                                style={{ width: `${(stageCompleted / Math.max(1, stageTasks)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="stage-content">
                          {stage.topics && stage.topics.map(topic => (
                            <div key={topic.id} className="check-topic-section">
                              <div className="topic-header-row">
                                <div className="topic-icon">📚</div>
                                <h5 className="topic-title">{topic.name}</h5>
                                <span className="topic-task-count">{topic.tasks?.length || 0} tasks</span>
                              </div>
                              
                              <div className="check-tasks-grid">
                                {topic.tasks && topic.tasks.map((task, taskIdx) => {
                                  const isCompleted = studentProgress.some(p => p.taskId === task.id && p.completed);
                                  const progressInfo = studentProgress.find(p => p.taskId === task.id);
                                  
                                  return (
                                    <div 
                                      key={task.id} 
                                      className={`check-task-card ${isCompleted ? 'task-completed' : ''}`}
                                      onClick={() => handleToggleCheck(task.id)}
                                    >
                                      <div className="task-card-header">
                                        <div className="task-number-badge">{taskIdx + 1}</div>
                                        <div className="task-checkbox-modern">
                                          {isCompleted && (
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                              <path d="M13.5 4.5L6 12L2.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="task-card-body">
                                        <p className="task-description">{task.name}</p>
                                        
                                        <div className="task-footer">
                                          {task.instructions && (
                                            <a 
                                              href={task.instructions} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="task-instruction-link"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M10 7.5V12H2V4H6.5M8 2H12M12 2V6M12 2L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                              </svg>
                                              View Guide
                                            </a>
                                          )}
                                          <span className="task-points-badge">
                                            {task.points} pts
                                          </span>
                                        </div>
                                        
                                        {isCompleted && progressInfo && (
                                          <div className="task-completion-info">
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                              <path d="M10.5 5.5C10.5 8.26142 8.26142 10.5 5.5 10.5C2.73858 10.5 0.5 8.26142 0.5 5.5C0.5 2.73858 2.73858 0.5 5.5 0.5C8.26142 0.5 10.5 2.73858 10.5 5.5Z" stroke="currentColor"/>
                                              <path d="M5.5 2.5V5.5L7.5 7.5" stroke="currentColor" strokeLinecap="round"/>
                                            </svg>
                                            {new Date(progressInfo.completedDate).toLocaleDateString()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="check-empty-state">
                <div className="empty-state-icon">📋</div>
                <h4>No Curriculum Available</h4>
                <p>The {checkModalStudent.honors ? 'honors' : 'regular'} curriculum hasn't been configured yet.</p>
                <p className="empty-state-hint">Please set up the check chart in the Check Chart tab.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .manage-students-tab {
          background: #fafafa;
          min-height: calc(100vh - 200px);
          padding: 40px;
          position: relative;
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 8px;
          padding: 16px 20px;
          padding-right: 48px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 2000;
          animation: slideIn 0.3s ease-out;
          min-width: 300px;
          border-left: 4px solid #16a34a;
        }

        .notification.error {
          border-left-color: #dc2626;
        }

        .notification-close {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
        }

        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .tab-header h2 {
          font-size: 1.8rem;
          font-weight: 300;
          color: #1a1a1a;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          background: white;
          color: #666;
          border: 1px solid #e0e0e0;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn.primary {
          background: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
        }


        .action-btn:hover {
          transform: translateY(-1px);
        }

        /* Groups Section */
        .groups-section {
          background: white;
          padding: 32px;
          border-radius: 8px;
          margin-bottom: 32px;
          border: 1px solid #e0e0e0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 20px;
        }

        .section-title {
          flex: 0 0 auto;
        }

        .section-title h3 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 400;
        }

        .search-bar {
          flex: 1;
          max-width: 300px;
          display: flex;
          justify-content: center;
        }

        .no-groups {
          color: #666;
          font-size: 0.95rem;
          margin: 0;
        }

        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .group-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid;
          border-left-width: 4px;
        }

        .group-card.new-group {
          border: 2px solid #f0f0f0;
          background: white;
          padding: 0;
          overflow: hidden;
          position: relative;
          transition: all 0.2s ease;
        }

        .group-card.new-group:hover {
          border-color: #e0e0e0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .new-group-inner {
          position: relative;
          height: 100%;
          min-height: 140px;
          display: flex;
          flex-direction: column;
        }

        .color-strip {
          height: 4px;
          width: 100%;
          transition: height 0.2s ease;
        }

        .group-card.new-group:hover .color-strip {
          height: 6px;
        }

        .new-group-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }

        .house-name-input {
          border: none;
          background: transparent;
          font-size: 1.1rem;
          font-weight: 400;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
          transition: border-color 0.2s ease;
        }

        .house-name-input:focus {
          outline: none;
          border-bottom-color: #333;
        }

        .house-name-input::placeholder {
          color: #ccc;
        }

        .color-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .color-swatch {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .color-swatch:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .color-swatch.active {
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
        }

        .color-palette {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        .palette-color {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .palette-color:hover {
          transform: scale(1.15);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
        }

        .palette-color.selected {
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.5);
          transform: scale(1.1);
        }

        .color-label {
          font-size: 0.85rem;
          color: #999;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        }

        .form-buttons {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }

        .save-house-btn {
          flex: 1;
          padding: 10px 16px;
          background: #333;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-house-btn:hover {
          background: #000;
          transform: translateY(-1px);
        }

        .cancel-house-btn {
          width: 36px;
          height: 36px;
          background: transparent;
          color: #999;
          border: 1px solid #f0f0f0;
          border-radius: 6px;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .cancel-house-btn:hover {
          background: #f5f5f5;
          border-color: #e0e0e0;
          color: #666;
        }

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .group-header h4 {
          margin: 0;
          font-size: 1.1rem;
        }

        .color-badge {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .group-stats {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 12px;
        }

        .group-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .group-actions button {
          padding: 6px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .assign-btn {
          background: #4A90E2 !important;
          color: white !important;
          border-color: #4A90E2 !important;
        }

        .delete-btn {
          color: #dc2626;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 8px;
        }

        .edit-form .house-name-input {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
          width: 100%;
        }

        .edit-form .color-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .edit-form .color-swatch {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          position: relative;
        }

        .edit-form .color-swatch:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .edit-form .color-label {
          font-size: 0.9rem;
          color: #666;
          font-family: monospace;
        }

        .edit-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .edit-actions .save-btn,
        .edit-actions .cancel-btn {
          flex: 1;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-actions .save-btn {
          background: #4CAF50;
          color: white;
        }

        .edit-actions .save-btn:hover {
          background: #45a049;
        }

        .edit-actions .cancel-btn {
          background: #f44336;
          color: white;
        }

        .edit-actions .cancel-btn:hover {
          background: #da190b;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.3rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
        }

        /* Enhanced Check Chart Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .check-chart-modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .check-modal-header {
          padding: 24px 28px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to bottom, #ffffff, #fafafa);
        }

        .check-modal-student-badge {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .student-avatar {
          width: 48px;
          height: 48px;
          background: #1a1a1a;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          text-transform: uppercase;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .student-details h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1a1a1a;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .honors-star {
          color: #FFD700;
          font-size: 1.1rem;
        }

        .student-type {
          margin: 4px 0 0 0;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .modal-close-btn {
          background: none;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
        }

        .modal-close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .check-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .progress-overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 24px 28px;
          background: #fafafa;
          border-bottom: 1px solid #e5e7eb;
        }

        .progress-stat {
          text-align: center;
          padding: 12px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .selection-controls {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .selection-controls button {
          padding: 8px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .select-all-btn {
          background: #4A90E2 !important;
          color: white !important;
          border-color: #4A90E2 !important;
        }

        .students-selection-list {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
        }

        .student-checkbox {
          display: flex;
          align-items: center;
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
        }

        .student-checkbox:hover {
          background: #f5f5f5;
        }

        .student-checkbox input {
          margin-right: 12px;
        }

        .student-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex: 1;
        }

        .student-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .current-house {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .modal-actions {
          padding: 20px 24px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .selection-count {
          color: #666;
          font-size: 0.9rem;
        }

        .modal-actions .assign-btn,
        .modal-actions .unassign-btn {
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .modal-actions .assign-btn.primary {
          background: #4A90E2;
          color: white;
        }

        .modal-actions .unassign-btn {
          background: #dc2626;
          color: white;
        }

        .modal-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Add Student Form */
        .add-student-form {
          background: white;
          padding: 32px;
          border-radius: 8px;
          margin-bottom: 32px;
          border: 1px solid #e0e0e0;
        }

        .add-student-form h3 {
          margin: 0 0 24px 0;
          font-size: 1.3rem;
          font-weight: 400;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select {
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          margin-right: 8px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .submit-btn, .cancel-btn {
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 0.95rem;
          cursor: pointer;
          border: none;
        }

        .submit-btn {
          background: #1a1a1a;
          color: white;
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .cancel-btn {
          background: white;
          color: #666;
          border: 1px solid #e0e0e0;
        }

        .cancel-btn:disabled {
          background: #f5f5f5;
          color: #ccc;
          cursor: not-allowed;
        }

        /* Students Section */
        .students-section {
          background: white;
          padding: 32px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 20px;
        }

        .section-header h3 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 400;
          flex: 0 0 auto;
        }

        .search-bar {
          flex: 1;
          display: flex;
          justify-content: center;
          max-width: 300px;
        }

        .search-bar .search-input {
          width: 100%;
          max-width: 250px;
        }

        .filters {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .search-input,
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        /* Students Table */
        .students-table {
          display: flex;
          flex-direction: column;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1fr 1.5fr 1fr;
          padding: 12px 16px;
          align-items: center;
        }

        .table-header {
          background: #f5f5f5;
          font-weight: 500;
          color: #666;
          font-size: 0.9rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .table-row {
          border-bottom: 1px solid #f0f0f0;
        }

        .table-row:hover {
          background: #fafafa;
        }

        .table-row input[type="text"],
        .table-row input[type="email"],
        .table-row input[type="number"],
        .table-row select {
          padding: 6px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .table-row input[type="number"] {
          width: 45px;
        }

        .honors-badge {
          color: #FFD700;
        }

        .student-email {
          color: #666;
          font-size: 0.9rem;
        }

        .group-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .goals-summary {
          font-size: 0.85rem;
          color: #666;
        }

        .goals-edit {
          display: flex;
          gap: 4px;
        }

        .no-goals {
          color: #999;
          font-style: italic;
          font-size: 0.85rem;
        }

        .inline-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .inline-checkbox input {
          margin: 0;
        }

        .edit-btn {
          background: #4A90E2;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: #357ABD;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
        }

        .check-chart-cell {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .check-btn {
          background: #666;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .check-btn:hover {
          background: #333;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .check-stages-container {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .check-stage-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .check-stage-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }

        .stage-header-bar {
          padding: 16px 20px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stage-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .stage-progress {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-text {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .progress-bar-mini {
          width: 80px;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill-mini {
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .stage-content {
          padding: 20px;
        }

        .check-topic-section {
          margin-bottom: 24px;
        }

        .check-topic-section:last-child {
          margin-bottom: 0;
        }

        .topic-header-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .topic-icon {
          font-size: 1.2rem;
        }

        .topic-title {
          flex: 1;
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .topic-task-count {
          font-size: 0.875rem;
          color: #9ca3af;
          background: #f3f4f6;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .check-tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .check-task-card {
          background: #fafafa;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-height: 120px;
        }

        .check-task-card:hover {
          border-color: #9ca3af;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .check-task-card.task-completed {
          background: #f0f9ff;
          border-color: #4A90E2;
        }

        .task-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .task-number-badge {
          width: 24px;
          height: 24px;
          background: #e5e7eb;
          color: #6b7280;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .task-completed .task-number-badge {
          background: #4A90E2;
          color: white;
        }

        .task-checkbox-modern {
          width: 24px;
          height: 24px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .task-completed .task-checkbox-modern {
          background: #1a1a1a;
          border-color: #1a1a1a;
        }

        .check-task-card:hover .task-checkbox-modern {
          border-color: #9ca3af;
        }

        .task-card-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-description {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.4;
          font-weight: 500;
        }

        .task-completed .task-description {
          color: #1a1a1a;
        }

        .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .task-instruction-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .task-instruction-link:hover {
          background: #eff6ff;
          color: #2563eb;
        }

        .task-points-badge {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .task-completed .task-points-badge {
          background: #1a1a1a;
          color: white;
        }

        .task-completion-info {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 0.75rem;
        }

        .check-loading-container {
          padding: 80px 40px;
          text-align: center;
        }

        .check-loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f4f6;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: spin 1s linear infinite;
        }

        .check-loading-container p {
          color: #6b7280;
          font-size: 1rem;
        }

        .check-empty-state {
          padding: 80px 40px;
          text-align: center;
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .check-empty-state h4 {
          margin: 0 0 12px 0;
          font-size: 1.25rem;
          color: #374151;
        }

        .check-empty-state p {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .empty-state-hint {
          color: #9ca3af !important;
          font-size: 0.875rem !important;
          font-style: italic;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }


        .edit-actions-group {
          display: flex;
          gap: 4px;
        }

        .edit-actions-group .action-btn {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }

        .edit-actions-group .action-btn.save {
          background: #16a34a;
          color: white;
        }

        .edit-actions-group .action-btn.save:hover {
          background: #15803d;
        }

        .edit-actions-group .action-btn.cancel {
          background: #e5e7eb;
          color: #6b7280;
        }

        .edit-actions-group .action-btn.cancel:hover {
          background: #d1d5db;
        }

        .edit-actions-group .action-btn.remove {
          background: #dc2626;
          color: white;
        }

        .edit-actions-group .action-btn.remove:hover {
          background: #b91c1c;
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
          .manage-students-tab {
            padding: 20px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .groups-grid {
            grid-template-columns: 1fr;
          }
          
          .section-header {
            flex-direction: column;
            gap: 16px;
          }

          .section-title {
            order: 1;
            text-align: center;
          }

          .search-bar {
            order: 2;
            margin: 0;
            max-width: 100%;
          }

          .filters {
            order: 3;
            justify-content: center;
            flex-wrap: wrap;
          }

          /* Check Chart Modal Mobile Styles */
          .check-chart-modal {
            width: 100%;
            max-width: 100%;
            height: 100%;
            max-height: 100%;
            border-radius: 0;
          }

          .check-modal-header {
            padding: 16px 20px;
          }

          .student-avatar {
            width: 40px;
            height: 40px;
            font-size: 0.9rem;
          }

          .student-details h3 {
            font-size: 1.1rem;
          }

          .progress-overview {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 16px 20px;
          }

          .progress-stat {
            padding: 10px;
          }

          .stat-value {
            font-size: 1.4rem;
          }

          .stat-label {
            font-size: 0.75rem;
          }

          .check-stages-container {
            padding: 16px;
            gap: 16px;
          }

          .stage-header-bar {
            padding: 12px 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .stage-title {
            font-size: 1rem;
          }

          .stage-progress {
            width: 100%;
          }

          .progress-bar-mini {
            flex: 1;
          }

          .stage-content {
            padding: 16px;
          }

          .check-topic-section {
            margin-bottom: 20px;
          }

          .topic-header-row {
            flex-wrap: wrap;
            gap: 8px;
          }

          .topic-icon {
            display: none;
          }

          .topic-title {
            font-size: 0.95rem;
          }

          .check-tasks-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .check-task-card {
            min-height: auto;
            padding: 12px;
          }

          .task-description {
            font-size: 0.85rem;
          }

          .task-footer {
            flex-wrap: wrap;
            gap: 6px;
          }

          .task-instruction-link {
            font-size: 0.8rem;
            padding: 3px 6px;
          }

          .task-points-badge {
            font-size: 0.8rem;
            padding: 3px 8px;
          }

          .check-loading-container,
          .check-empty-state {
            padding: 60px 20px;
          }

          .empty-state-icon {
            font-size: 3rem;
          }

          .check-empty-state h4 {
            font-size: 1.1rem;
          }

          .check-empty-state p {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}