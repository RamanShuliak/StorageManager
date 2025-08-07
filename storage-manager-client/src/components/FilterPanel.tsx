import React, { useState } from 'react';
import './FilterPanel.css';

interface FilterOption {
  id: string;
  name: string;
}

interface FilterPanelProps {
  resources?: FilterOption[];
  measures?: FilterOption[];
  clients?: FilterOption[];
  numbers?: string[];
  selectedResources: string[];
  selectedMeasures: string[];
  selectedClients: string[];
  selectedNumbers: string[];
  dateFrom: string;
  dateTo: string;
  onResourceChange: (resourceIds: string[]) => void;
  onMeasureChange: (measureIds: string[]) => void;
  onClientChange: (clientIds: string[]) => void;
  onNumberChange: (numbers: string[]) => void;
  onDateFromChange: (isoDate: string) => void;
  onDateToChange: (isoDate: string) => void;
  onSearch: () => void;
  showClientFilter?: boolean;
  showNumberFilter?: boolean;
  showDateFilters?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  resources,
  measures,
  clients,
  numbers,
  selectedResources,
  selectedMeasures,
  selectedClients,
  selectedNumbers,
  dateFrom,
  dateTo,
  onResourceChange,
  onMeasureChange,
  onClientChange,
  onNumberChange,
  onDateFromChange,
  onDateToChange,
  onSearch,
  showClientFilter = false,
  showNumberFilter = false,
  showDateFilters = false,
}) => {
  const [openFilter, setOpenFilter] = useState<
    'resources' | 'measures' | 'clients' | 'numbers' | null
  >(null);

  const toggleDropdown = (
    name: 'resources' | 'measures' | 'clients' | 'numbers'
  ) => {
    setOpenFilter(prev => (prev === name ? null : name));
  };

  const buildLabel = (
    placeholder: string,
    _options: FilterOption[] | string[],
    selected: string[]
  ) => (selected.length ? `Выбрано ${selected.length}` : placeholder);

  const handleCheck =
    (
      id: string,
      selected: string[],
      onChange: (vals: string[]) => void
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.checked
        ? [...selected, id]
        : selected.filter(x => x !== id);
      onChange(next);
    };

  const asDateInput = (iso: string) => (iso ? iso.substring(0, 10) : '');

  const handleDateChange =
    (
      setter: (isoDate: string) => void,
      endOfDay: boolean = false
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [y, m, d] = e.target.value.split('-').map(n => parseInt(n, 10));
      const hour = endOfDay ? 23 : 0;
      const min = endOfDay ? 59 : 0;
      const sec = endOfDay ? 59 : 0;
      const utcDate = new Date(Date.UTC(y, m - 1, d, hour, min, sec));
      setter(utcDate.toISOString());
    };

  return (
    <div className="filter-panel">
      <div className="filter-row">
        {resources && (
          <div className="filter-group dropdown">
            <label>Ресурс</label>
            <button
              type="button"
              className="dropdown-toggle"
              onClick={() => toggleDropdown('resources')}
            >
              {buildLabel('Выберите ресурс', resources, selectedResources)}
            </button>
            {openFilter === 'resources' && (
              <ul className="dropdown-menu">
                {resources.map(r => (
                  <li key={r.id} className="dropdown-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(r.id)}
                        onChange={handleCheck(
                          r.id,
                          selectedResources,
                          onResourceChange
                        )}
                      />
                      <span>{r.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {measures && (
          <div className="filter-group dropdown">
            <label>Единица измерения</label>
            <button
              type="button"
              className="dropdown-toggle"
              onClick={() => toggleDropdown('measures')}
            >
              {buildLabel(
                'Выберите единицу измерения',
                measures,
                selectedMeasures
              )}
            </button>
            {openFilter === 'measures' && (
              <ul className="dropdown-menu">
                {measures.map(m => (
                  <li key={m.id} className="dropdown-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedMeasures.includes(m.id)}
                        onChange={handleCheck(
                          m.id,
                          selectedMeasures,
                          onMeasureChange
                        )}
                      />
                      <span>{m.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {showClientFilter && clients && (
          <div className="filter-group dropdown">
            <label>Клиент</label>
            <button
              type="button"
              className="dropdown-toggle"
              onClick={() => toggleDropdown('clients')}
            >
              {buildLabel('Выберите клиента', clients, selectedClients)}
            </button>
            {openFilter === 'clients' && (
              <ul className="dropdown-menu">
                {clients.map(c => (
                  <li key={c.id} className="dropdown-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(c.id)}
                        onChange={handleCheck(
                          c.id,
                          selectedClients,
                          onClientChange
                        )}
                      />
                      <span>{c.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {showNumberFilter && numbers && showDateFilters && (
      <div className="filter-row">
        {showNumberFilter && numbers && (
          <div className="filter-group dropdown">
            <label>Номер документа</label>
            <button
              type="button"
              className="dropdown-toggle"
              onClick={() => toggleDropdown('numbers')}
            >
              {buildLabel(
                'Выберите номер документа',
                numbers,
                selectedNumbers
              )}
            </button>
            {openFilter === 'numbers' && (
              <ul className="dropdown-menu">
                {numbers.map(num => (
                  <li key={num} className="dropdown-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedNumbers.includes(num)}
                        onChange={handleCheck(
                          num,
                          selectedNumbers,
                          onNumberChange
                        )}
                      />
                      <span>{num}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {showDateFilters && (
          <div className="date-filters">
            <div className="date-inputs">
              <div className="filter-group">
                <label>От</label>
                <input
                  type="date"
                  value={asDateInput(dateFrom)}
                  onChange={handleDateChange(onDateFromChange)}
                />
              </div>
              <div className="filter-group">
                <label>До</label>
                <input
                  type="date"
                  value={asDateInput(dateTo)}
                  onChange={handleDateChange(onDateToChange, true)}
                />
              </div>
            </div>
          </div>)}
        </div>)}

      <div className="filter-actions">
        <button className="btn btn-primary" onClick={onSearch}>
          Поиск
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
