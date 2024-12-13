const Featured = () => {
  const brands = [
    {
      name: 'Fortune',
      logo: '/assets/images/features/fortune.svg',
    },
    {
      name: 'Forbes',
      logo: '/assets/images/features/forbes.svg',
    },
    {
      name: 'TechCrunch',
      logo: '/assets/images/features/techcrunch.svg',
    },
    {
      name: 'Business Insider',
      logo: '/assets/images/features/business-insider.svg',
    },
    {
      name: 'Smart Company',
      logo: '/assets/images/features/smart-company.svg',
    },
    {
      name: 'Financial Review',
      logo: '/assets/images/features/financial-review.svg',
    },
  ];

  return (
    <div className="mt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h4 className="text-center text-white/50 text-lg tracking-wider mb-8">
          As Featured in
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {brands.map((brand) => (
            <div 
              key={brand.name}
              className="flex justify-center items-center"
            >
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                width={120}
                height={40}
                className="opacity-50 hover:opacity-70 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Featured; 