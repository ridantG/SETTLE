

// Define the shape of the filters object and the function prop
type FilterSidebarProps = {
    filters: {
      name: string;
      city: string;
      gender: string;
    };
    onFilterChange: (filterName: string, value: string) => void;
  };
  
  const FilterSidebar = ({ filters, onFilterChange }: FilterSidebarProps) => {
    
    // Reusable styles
    const inputStyles = "w-full p-2 border border-gray-300 rounded-lg text-sm";
    const labelStyles = "font-bold text-md mb-2 text-gray-800 block";
  
    return (
      <aside className="w-full md:w-1/4 lg:w-1/5 p-4 bg-white md:bg-transparent rounded-lg shadow-md md:shadow-none">
        <div className="space-y-6">
          <div>
            <label htmlFor="name-search" className={labelStyles}>Search by Name</label>
            <input
              id="name-search"
              type="text"
              placeholder="e.g. Angela Carter"
              value={filters.name}
              onChange={(e) => onFilterChange('name', e.target.value)}
              className={inputStyles}
            />
          </div>
          
          <div>
            <label htmlFor="city-search" className={labelStyles}>City</label>
            <input
              id="city-search"
              type="text"
              placeholder="e.g. Bhopal"
              value={filters.city}
              onChange={(e) => onFilterChange('city', e.target.value)}
              className={inputStyles}
            />
          </div>
  
          <div>
            <label htmlFor="gender-select" className={labelStyles}>Gender</label>
            <select
              id="gender-select"
              value={filters.gender}
              onChange={(e) => onFilterChange('gender', e.target.value)}
              className={inputStyles}
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      </aside>
    );
  };
  
  export default FilterSidebar;