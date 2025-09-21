export default function Filters({ filters, options, onFilterChange, onReset }) {
  const { ctfs = [], categories = [], difficulties = [], tags = [] } = options;

  const handleSelect = (field) => (event) => {
    onFilterChange({ [field]: event.target.value });
  };

  const toggleTag = (tag) => {
    const nextTags = filters.tags.includes(tag)
      ? filters.tags.filter((value) => value !== tag)
      : [...filters.tags, tag];
    onFilterChange({ tags: nextTags });
  };

  return (
    <div>
      <p className="section-title">Filters</p>
      <div className="filter-group">
        <label htmlFor="filter-ctf">CTF</label>
        <select
          id="filter-ctf"
          value={filters.ctf}
          onChange={handleSelect('ctf')}
          aria-label="Filter by CTF"
        >
          <option value="all">All events</option>
          {ctfs.map((ctf) => (
            <option key={ctf} value={ctf}>
              {ctf}
            </option>
          ))}
        </select>

        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={handleSelect('category')}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label htmlFor="filter-difficulty">Difficulty</label>
        <select
          id="filter-difficulty"
          value={filters.difficulty}
          onChange={handleSelect('difficulty')}
          aria-label="Filter by difficulty"
        >
          <option value="all">Any difficulty</option>
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>

        {tags.length > 0 && (
          <div>
            <span className="section-title" style={{ marginTop: '1rem' }}>
              Tags
            </span>
            <div className="filter-tags" role="group" aria-label="Filter by tags">
              {tags.map((tag) => {
                const isActive = filters.tags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    className={isActive ? 'active' : ''}
                    onClick={() => toggleTag(tag)}
                    aria-pressed={isActive}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button type="button" onClick={onReset} aria-label="Reset filters">
          Reset filters
        </button>
      </div>
    </div>
  );
}
