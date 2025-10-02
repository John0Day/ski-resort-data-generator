import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Mountain, Thermometer, Wind, CloudRain, Snowflake } from "lucide-react";
import { generateSkiRegionData, type SkiRegionData } from "@/data/skiRegionsData";

export default function SkiRegionDataset() {
  const [data] = useState<SkiRegionData[]>(() => generateSkiRegionData());
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  
  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchesSearch = record.region.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = countryFilter === "all" || record.country === countryFilter;
      const matchesDate = !dateFilter || record.date.includes(dateFilter);
      
      return matchesSearch && matchesCountry && matchesDate;
    });
  }, [data, searchTerm, countryFilter, dateFilter]);

  const exportToCSV = () => {
    const headers = ["Date", "Region", "Country", "Elevation (m)", "Wind (Beaufort)", "Temperature (°C)", "Precipitation (mm)", "Snow Depth (cm)"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        row.date,
        row.region,
        row.country,
        row.elevation,
        row.windBeaufort,
        row.temperatureCelsius,
        row.precipitationMm,
        row.snowDepthCm
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ski-regions-data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ski-regions-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getWindDescription = (beaufort: number) => {
    const descriptions = [
      "Calm", "Light air", "Light breeze", "Gentle breeze", "Moderate breeze",
      "Fresh breeze", "Strong breeze", "High wind", "Gale", "Strong gale",
      "Storm", "Violent storm", "Hurricane"
    ];
    return descriptions[beaufort] || "Unknown";
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= -10) return "text-blue-600";
    if (temp <= 0) return "text-blue-400";
    if (temp <= 10) return "text-green-400";
    if (temp <= 20) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mountain className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Alpine Ski Region Weather Dataset</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Daily weather data for {data.length.toLocaleString()} records across German, Austrian, and Swiss ski regions
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{filteredData.length.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Temperature</p>
                  <p className="text-2xl font-bold">
                    {filteredData.length > 0 
                      ? (filteredData.reduce((sum, r) => sum + r.temperatureCelsius, 0) / filteredData.length).toFixed(1)
                      : "0"}°C
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Snow Depth</p>
                  <p className="text-2xl font-bold">
                    {filteredData.length > 0 
                      ? (filteredData.reduce((sum, r) => sum + r.snowDepthCm, 0) / filteredData.length).toFixed(0)
                      : "0"}cm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Precipitation</p>
                  <p className="text-2xl font-bold">
                    {filteredData.length > 0 
                      ? (filteredData.reduce((sum, r) => sum + r.precipitationMm, 0) / filteredData.length).toFixed(1)
                      : "0"}mm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Export */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle className="text-lg">Filters & Export</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={exportToJSON} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button onClick={() => window.open('https://pzghdabqnsdthysjzacl.supabase.co/functions/v1/generate-dataset', '_blank')} variant="default" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Get Cloud URL
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                placeholder="Search regions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Austria">Austria</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by month"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Weather Data ({filteredData.length.toLocaleString()} records)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Elevation</TableHead>
                    <TableHead className="text-center">Wind</TableHead>
                    <TableHead className="text-right">Temperature</TableHead>
                    <TableHead className="text-right">Precipitation</TableHead>
                    <TableHead className="text-right">Snow Depth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.slice(0, 100).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">{record.date}</TableCell>
                      <TableCell className="font-medium">{record.region}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.country}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{record.elevation}m</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Wind className="h-3 w-3" />
                          <span className="font-mono">{record.windBeaufort}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${getTemperatureColor(record.temperatureCelsius)}`}>
                        {record.temperatureCelsius}°C
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {record.precipitationMm > 0 ? `${record.precipitationMm}mm` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {record.snowDepthCm > 0 ? `${record.snowDepthCm}cm` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredData.length > 100 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Showing first 100 records. Use filters or export to access all {filteredData.length.toLocaleString()} records.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dataset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Data Attributes:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Wind:</strong> Beaufort scale (0-12) - {getWindDescription(0)} to {getWindDescription(12)}</li>
                <li><strong>Temperature:</strong> Celsius, adjusted for elevation (-6°C per 1000m)</li>
                <li><strong>Precipitation:</strong> Millimeters per day</li>
                <li><strong>Snow Depth:</strong> Centimeters, varies by season and elevation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Coverage:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>📅 <strong>Period:</strong> Daily data for past 365 days</li>
                <li>🏔️ <strong>Regions:</strong> 14 major ski areas across Germany, Austria, and Switzerland</li>
                <li>📊 <strong>Records:</strong> {data.length.toLocaleString()} total data points</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}