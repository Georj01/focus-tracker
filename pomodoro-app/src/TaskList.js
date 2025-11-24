import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function TaskList({ tasks, onRemove, onEdit, onToggleComplete }) {
  const { t } = useTranslation();
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (id, value) => {
    setEditId(id);
    setEditValue(value);
  };

  const handleEditSave = (id) => {
    if (editValue.trim()) {
      onEdit(id, editValue.trim());
    }
    setEditId(null);
    setEditValue("");
  };

  const handleKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      handleEditSave(id);
    } else if (e.key === 'Escape') {
      setEditId(null);
      setEditValue("");
    }
  };

  if (tasks.length === 0) {
    return (
      <p className="empty-tasks">{t('labels.noTasks')}</p>
    );
  }

  return (
    <ul className="task-items">
      {tasks.map((task) => (
        <li key={task.id} className="task-item">
          {editId === task.id ? (
            <div className="task-edit-mode">
              <input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => handleKeyPress(e, task.id)}
                autoFocus
                maxLength="100"
                aria-label="Editar tarea"
              />
              <button 
                onClick={() => handleEditSave(task.id)}
                className="task-btn save-btn"
                aria-label="Guardar cambios"
              >
                ✓
              </button>
              <button 
                onClick={() => setEditId(null)}
                className="task-btn cancel-btn"
                aria-label="Cancelar edición"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="task-view-mode">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
                id={`task-${task.id}`}
                aria-label={`Marcar tarea "${task.text}" como ${task.completed ? 'incompleta' : 'completada'}`}
              />
              <label 
                htmlFor={`task-${task.id}`}
                className={task.completed ? "completed" : ""}
              >
                {task.text}
              </label>
              <div className="task-actions">
                <button 
                  onClick={() => handleEdit(task.id, task.text)}
                  className="task-btn edit-btn"
                  aria-label="Editar tarea"
                  disabled={task.completed}
                >
                  ✏️
                </button>
                <button 
                  onClick={() => onRemove(task.id)}
                  className="task-btn delete-btn"
                  aria-label="Eliminar tarea"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
