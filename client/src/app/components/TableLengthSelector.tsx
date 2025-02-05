interface TableLengthSelectorProps {
  minGw: number; 
  maxGw: number;
  gwArray: number[];
  setMinGw: (value: number) => void; // Function to update parent state
  setMaxGw: (value: number) => void; // Function to update parent state
}

const TableLengthSelector: React.FC<TableLengthSelectorProps> = ({ 
  minGw, 
  maxGw, 
  gwArray, 
  setMinGw, 
  setMaxGw
}) => {

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value, 10);

    // Ensure that value stays within the valid range
    if (isNaN(value)) value = minGw; // If not a valid number, fallback to current minGw
    if (value < gwArray[0]) value = gwArray[0]; // Ensure it's not less than the first gameweek
    if (value >= maxGw) value = maxGw - 1; // Ensure it's not greater than or equal to maxGw

    setMinGw(value);
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value, 10);

    // Ensure that value stays within the valid range
    if (isNaN(value)) value = maxGw; // If not a valid number, fallback to current maxGw
    if (value <= minGw) value = minGw; // Ensure it's not less than or equal to minGw
    if (value > gwArray[gwArray.length - 1]) value = gwArray[gwArray.length - 1]; // Ensure it's not greater than the last gameweek

    setMaxGw(value);
  };


  return (
    <div className="flex items-center space-x-2 mr-8">
      <label className="text-sm font-medium text-white-700">From GW:</label>
      <input
        type="number"
        value={minGw}
        onChange={handleMinChange}
        min={gwArray[0]}
        max={maxGw}
        className="w-16 px-0 py-1 border rounded text-center text-black"
      />
      <label className="text-sm font-medium text-white-700">To GW:</label>
      <input
        type="number"
        value={maxGw}
        onChange={handleMaxChange}
        min={minGw}
        max={gwArray[gwArray.length - 1]}
        className="w-16 px-0 py-1 border rounded text-center text-black"
      />
    </div>
  );
};

export default TableLengthSelector;
