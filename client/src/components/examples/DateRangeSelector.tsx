import DateRangeSelector from '../DateRangeSelector';

export default function DateRangeSelectorExample() {
  const handleRangeChange = (type: string, customDates?: any) => {
    console.log('Date range changed:', type, customDates);
  };

  return (
    <div className="p-8 bg-background">
      <div className="max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Date Range Filter</h3>
        <DateRangeSelector onRangeChange={handleRangeChange} />
      </div>
    </div>
  );
}
