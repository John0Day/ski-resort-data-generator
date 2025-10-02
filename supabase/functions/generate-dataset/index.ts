import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SkiRegion {
  name: string;
  country: string;
  elevation: number;
}

const skiRegions: SkiRegion[] = [
  { name: "Garmisch-Partenkirchen", country: "Germany", elevation: 750 },
  { name: "Oberstdorf", country: "Germany", elevation: 813 },
  { name: "Berchtesgaden", country: "Germany", elevation: 518 },
  { name: "Feldberg", country: "Germany", elevation: 1493 },
  { name: "Zugspitze", country: "Germany", elevation: 2962 },
  { name: "Winterberg", country: "Germany", elevation: 810 },
  { name: "Garmisch-Classic", country: "Germany", elevation: 1500 },
  { name: "Brauneck", country: "Germany", elevation: 1555 },
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

function generateDataset(): string {
  const rows: string[] = [];
  const headers = ["Date", "Region", "Country", "Elevation (m)", "Wind (Beaufort)", "Temperature (°C)", "Precipitation (mm)", "Snow Depth (cm)"];
  rows.push(headers.join(","));

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 3);

  skiRegions.forEach((region) => {
    for (let i = 0; i < 1095; i++) {
      const currentDate = new Date(startDate.getTime());
      currentDate.setDate(currentDate.getDate() + i);

      const month = currentDate.getMonth();
      const isWinter = month >= 10 || month <= 3;
      const elevationFactor = region.elevation / 1000;

      let baseTemp = isWinter ? -5 + Math.random() * 10 : 15 + Math.random() * 15;
      baseTemp -= elevationFactor * 6;
      const temperature = Math.round((baseTemp + (Math.random() - 0.5) * 10) * 10) / 10;

      const baseWind = 2 + elevationFactor + Math.random() * 4;
      const wind = Math.min(12, Math.max(0, Math.round(baseWind)));

      const precipitationChance = isWinter ? 0.4 + elevationFactor * 0.2 : 0.2 + elevationFactor * 0.1;
      const precipitation = Math.random() < precipitationChance 
        ? Math.round(Math.random() * (isWinter ? 15 : 25) * 10) / 10 
        : 0;

      let snowDepth = 0;
      if (isWinter) {
        snowDepth = Math.max(0, (elevationFactor * 30) + (Math.random() * 50) - 10);
        if (temperature > 2) snowDepth *= 0.7;
      } else if (region.elevation > 1500) {
        snowDepth = Math.max(0, (elevationFactor * 10) + (Math.random() * 20) - 15);
      }
      snowDepth = Math.round(snowDepth);

      const row = [
        currentDate.toISOString().split('T')[0],
        region.name,
        region.country,
        region.elevation,
        wind,
        temperature,
        precipitation,
        snowDepth
      ].join(",");
      
      rows.push(row);
    }
  });

  return rows.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating ski region dataset...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const csvContent = generateDataset();
    const fileName = `ski-regions-dataset-${new Date().toISOString().split('T')[0]}.csv`;

    console.log(`Uploading ${fileName} to storage...`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('datasets')
      .upload(fileName, csvContent, {
        contentType: 'text/csv',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('datasets')
      .getPublicUrl(fileName);

    console.log('Dataset uploaded successfully:', publicUrlData.publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrlData.publicUrl,
        fileName: fileName,
        recordCount: skiRegions.length * 1095
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error generating dataset:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
