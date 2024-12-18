import { API_CONFIG } from '@/lib/api-config';
import { Brand } from '@/types/features-response';

const Featured = ({ brands, title }: { brands: Brand[], title: string | undefined }) => {
  const fallbackBrands = [
    {
      name: 'Fortune',
      logo: {
        img: {
          url: '/assets/images/features/fortune.svg',
        },
      },
    },
    {
      name: 'Forbes',
      logo: {
        img: {
          url: '/assets/images/features/forbes.svg',
        },
      },
    },
    {
      name: 'TechCrunch',
      logo: {
        img: {
          url: '/assets/images/features/techcrunch.svg',
        },
      },
    },
    {
      name: 'Business Insider',
      logo: {
        img: {
          url: '/assets/images/features/business-insider.svg',
        },
      },
    },
    {
      name: 'Smart Company',
      logo: {
        img: {
          url: '/assets/images/features/smart-company.svg',
        },
      },
    },
    {
      name: 'Financial Review',
      logo: {
        img: {
          url: '/assets/images/features/financial-review.svg',
        },
      },
    },
  ];

  const brandsToDisplay = brands.length > 0 ? brands : fallbackBrands;
  
  return (
    <div className="mt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h4 className="text-center text-white/50 text-lg tracking-wider mb-8">
          {title ? title : 'As Featured in'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {brandsToDisplay.map((item) => (
            <div 
              key={item.name}
              className="flex justify-center items-center"
            >
              
              <img
                src={brands.length > 0 ? API_CONFIG.imageBaseURL + item.logo?.img?.url : item.logo.img.url}
                alt={`${item.name} logo`}
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