import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { measureApi } from '../services/api';
import { Measure } from '../types';
import './Page.css';

const MeasureEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [measure, setMeasure] = useState<Measure>({
    id: '',
    name: '',
    isArchived: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadMeasure();
    }
  }, [id]);

  const loadMeasure = async () => {
    try {
      const response = await measureApi.getMeasure(id!);
      setMeasure(response.data);
    } catch (error) {
      console.error('Error loading measure:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isNew) {
        await measureApi.createMeasure({
          name: measure.name
        });
      } else {
        await measureApi.updateMeasure({
          id: measure.id,
          name: measure.name
        });
      }
      navigate('/measures');
    } catch (error) {
      console.error('Error saving measure:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту единицу измерения?')) {
      try {
        await measureApi.deleteMeasure(measure.id);
        navigate('/measures');
      } catch (error) {
        console.error('Error deleting measure:', error);
      }
    }
  };

  const handleArchiveToggle = async () => {
    try {
      if (measure.isArchived) {
        await measureApi.unarchiveMeasure(measure.id);
      } else {
        await measureApi.archiveMeasure(measure.id);
      }
      setMeasure(prev => ({ ...prev, isArchived: !prev.isArchived }));
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Единица измерения</h1>
      </div>

      <div className="form-container">
        <div className="form-actions">
          <button className="btn btn-success" onClick={handleSave} disabled={loading}>
            Сохранить
          </button>
          {!isNew && (
            <>
              <button className="btn btn-warning" onClick={handleArchiveToggle} disabled={loading}>
                {measure.isArchived ? 'В работу' : 'В архив'}
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                Удалить
              </button>
            </>
          )}
        </div>

        <div className="form-group">
          <label>Наименование</label>
          <input
            type="text"
            value={measure.name}
            onChange={(e) => setMeasure(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default MeasureEditPage; 