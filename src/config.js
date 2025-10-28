
//MERN_LOCALHOST BASE URL
const localAPI = "http://localhost:5000/api/v1";

//MERN https://tdsolarbackendnode.solarcrmapi.com/  DOCKER API
const ProdAPI = "https://tdsolarbackendnode.solarcrmapi.com/api/v1";

// Select API based on environment variable
const environment = import.meta.env.VITE_APP_ENV || 'prod';

const config = {
  //NODE SERVER URL
  MernBaseURL: environment === 'prod' ? ProdAPI : localAPI,
  environment: environment // Added for reference
};

// Display API configuration in console with eye-catching format
const displayAPIInfo = () => {
  const separator = '═'.repeat(60);
  const isProduction = environment === 'prod';
  const apiName = isProduction ? 'SolarCRM API' : 'Local API';
  
  console.log('\n' + separator);
  console.log('🚀 TD SOLAR CRM - API CONFIGURATION');
  console.log(separator);
  console.log(`📍 Environment: %c${environment.toUpperCase()}`, 
    `color: ${isProduction ? '#ff4444' : '#44ff44'}; font-weight: bold; font-size: 14px;`);
  console.log(`🔗 API: %c${apiName}`,
    `color: ${isProduction ? '#ff9944' : '#44ccff'}; font-weight: bold;`);
  console.log(`⚙️  Mode: %c${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`,
    `color: ${isProduction ? '#ff4444' : '#44ff44'}; font-weight: bold;`);
  console.log(separator + '\n');
};

// Call the function to display info when config is loaded
displayAPIInfo();

export default config;
