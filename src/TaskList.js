import React, { useState } from "react";

function TaskList({ tasks, onRemove, onEdit, onToggleComplete }) {
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEditStart = (task) => {
    setEditId(task.id);
    setEditValue(task.text);
  };

  const handleEditSave = (id) => {
    if (editValue.trim()) {
      onEdit(id, editValue.trim());
    }
    setEditId(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditId(null);
    setEditValue("");
  };

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        /* CORRECCIÓN: Usamos task.id en lugar de idx */
        <li key={task.id} className="task-item" style={{ textDecoration: task.completed ? "line-through" : "none" }}>
          {editId === task.id ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditSave(task.id)}
              />
              <button className="control-btn small" onClick={() => handleEditSave(task.id)}>💾</button>
              <button className="control-btn small cancel" onClick={handleCancel}>❌</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete(task.id)}
                />
                <span>{task.text}</span>
              </div>
              <div>
                <button onClick={() => handleEditStart(task)} style={{ marginRight: '8px' }}>✏️</button>
                <button onClick={() => onRemove(task.id)}>🗑️</button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
