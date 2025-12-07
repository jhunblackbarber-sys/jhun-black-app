import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useState } from 'react';

export default function MultiDatePicker({ onChange }) {
  const [selected, setSelected] = useState([]);

  function handleSelect(dates) {
    setSelected(dates);
    if (onChange) onChange(dates);
  }

  return (
    <DayPicker
      mode="multiple"
      selected={selected}
      onSelect={handleSelect}
    />
  );
}
