<section className="stories-container">
  <div className="stories-scroll">
    {categories.map(category => (
      <div className="story-item" key={category.id}>
        <button 
          className={`story-circle ${category.watched ? 'watched' : 'unwatched'}`}
          onClick={() => openStoryViewer(category)}
        >
          <div className="gradient-ring">
            <div className="icon-container">
              {/* Dynamic icon based on category */}
              <CategoryIcon type={category.icon} />
            </div>
          </div>
        </button>
        <span className="category-label">{category.label}</span>
      </div>
    ))}
  </div>
</section> 