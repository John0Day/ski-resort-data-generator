export interface SkiRegionData {
  id: string;
  date: string;
  region: string;
  country: string;
  elevation: number;
  windBeaufort: number;
  temperatureCelsius: number;
  precipitationMm: number;
  snowDepthCm: number;
}

export const skiRegions = [
  // Germany
  { name: "Garmisch-Partenkirchen", country: "Germany", elevation: 750 },
  { name: "Oberstdorf", country: "Germany", elevation: 813 },
  { name: "Berchtesgaden", country: "Germany", elevation: 518 },
  { name: "Feldberg", country: "Germany", elevation: 1493 },
  { name: "Zugspitze", country: "Germany", elevation: 2962 },
  { name: "Winterberg", country: "Germany", elevation: 810 },
  { name: "Garmisch-Classic", country: "Germany", elevation: 1500 },
  { name: "Brauneck", country: "Germany", elevation: 1555 },
  
  // Austria  
  { name: "Innsbruck", country: "Austria", elevation: 574 },
  { name: "St. Anton am Arlberg", country: "Austria", elevation: 1304 },
  { name: "Kitzbühel", country: "Austria", elevation: 762 },
  { name: "Salzburg", country: "Austria", elevation: 424 },
  { name: "Bad Gastein", country: "Austria", elevation: 1002 },
  { name: "Ischgl", country: "Austria", elevation: 1377 },
  { name: "Sölden", country: "Austria", elevation: 1377 },
  { name: "Lech-Zürs", country: "Austria", elevation: 1450 },
  { name: "Saalbach-Hinterglemm", country: "Austria", elevation: 1003 },
  { name: "Mayrhofen", country: "Austria", elevation: 633 },
  { name: "Schladming", country: "Austria", elevation: 745 },
  { name: "Obergurgl", country: "Austria", elevation: 1930 },
  
  // Switzerland
  { name: "Zermatt", country: "Switzerland", elevation: 1620 },
  { name: "St. Moritz", country: "Switzerland", elevation: 1856 },
  { name: "Verbier", country: "Switzerland", elevation: 1500 },
  { name: "Davos", country: "Switzerland", elevation: 1560 },
  { name: "Interlaken", country: "Switzerland", elevation: 568 },
  { name: "Arosa", country: "Switzerland", elevation: 1775 },
  { name: "Grindelwald", country: "Switzerland", elevation: 1034 },
  { name: "Saas-Fee", country: "Switzerland", elevation: 1800 },
  { name: "Laax", country: "Switzerland", elevation: 1100 },
  { name: "Crans-Montana", country: "Switzerland", elevation: 1500 },
  { name: "Engelberg", country: "Switzerland", elevation: 1050 },
];

// Generate realistic daily data for the past 3 years
export const generateSkiRegionData = (): SkiRegionData[] => {
  const data: SkiRegionData[] = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 3);
  
  skiRegions.forEach((region) => {
    for (let i = 0; i < 1095; i++) { // 3 years of daily data
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Generate realistic weather data based on Alpine climate patterns
      const month = currentDate.getMonth();
      const isWinter = month >= 10 || month <= 3;
      const elevationFactor = region.elevation / 1000;
      
      // Temperature: colder at higher elevations and in winter
      let baseTemp = isWinter ? -5 + Math.random() * 10 : 15 + Math.random() * 15;
      baseTemp -= elevationFactor * 6; // 6°C drop per 1000m elevation
      const temperature = Math.round((baseTemp + (Math.random() - 0.5) * 10) * 10) / 10;
      
      // Wind: generally stronger at higher elevations
      const baseWind = 2 + elevationFactor + Math.random() * 4;
      const wind = Math.min(12, Math.max(0, Math.round(baseWind)));
      
      // Precipitation: more frequent in winter and at higher elevations
      const precipitationChance = isWinter ? 0.4 + elevationFactor * 0.2 : 0.2 + elevationFactor * 0.1;
      const precipitation = Math.random() < precipitationChance 
        ? Math.round(Math.random() * (isWinter ? 15 : 25) * 10) / 10 
        : 0;
      
      // Snow depth: accumulates in winter, melts in summer, more at higher elevations
      let snowDepth = 0;
      if (isWinter) {
        snowDepth = Math.max(0, (elevationFactor * 30) + (Math.random() * 50) - 10);
        if (temperature > 2) snowDepth *= 0.7; // melting effect
      } else if (region.elevation > 1500) {
        snowDepth = Math.max(0, (elevationFactor * 10) + (Math.random() * 20) - 15);
      }
      snowDepth = Math.round(snowDepth);
      
      data.push({
        id: `${region.name}-${currentDate.toISOString().split('T')[0]}`,
        date: currentDate.toISOString().split('T')[0],
        region: region.name,
        country: region.country,
        elevation: region.elevation,
        windBeaufort: wind,
        temperatureCelsius: temperature,
        precipitationMm: precipitation,
        snowDepthCm: snowDepth,
      });
    }
  });
  
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};