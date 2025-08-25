
import React, { useState } from "react";

function TaskList({ tasks, onRemove, onEdit, onToggleComplete }) {
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (idx, value) => {
    setEditIdx(idx);
    setEditValue(value);
  };

  const handleEditSave = (idx) => {
    onEdit(idx, editValue);
    setEditIdx(null);
    setEditValue("");
  };

  return (
    <ul className="task-list">
      {tasks.map((task, idx) => (
        <li key={idx} style={{ textDecoration: task.completed ? "line-through" : "none" }}>
          {editIdx === idx ? (
            <>
              <input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
              />
              <button onClick={() => handleEditSave(idx)}>Guardar</button>
              <button onClick={() => setEditIdx(null)}>Cancelar</button>
            </>
          ) : (
            <>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(idx)}
                style={{ marginRight: 8 }}
              />
              {task.text}
              <button onClick={() => handleEdit(idx, task.text)} style={{ marginLeft: 8 }}>Editar</button>
              <button onClick={() => onRemove(idx)} style={{ marginLeft: 8 }}>Eliminar</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
