import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Printer, RefreshCw } from "lucide-react";
import { getHealthCategorykemendagri } from "@/models/health-categories";
import { supabase } from "@/integrations/supabase/client";
import { Assessment } from "@/models/types";
import { useToast } from "@/components/ui/use-toast";
import { kemendagriIndicators } from "@/models/kemendagri-indicators";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportsKemendagri = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('kemendagri_assessments' as any)
          .select('*')
          .order('year', { ascending: true });
        
        if (assessmentError) {
          console.error('Error fetching assessments:', assessmentError);
          return;
        }
        
        if (!assessmentData || assessmentData.length === 0) {
          setLoading(false);
          return;
        }
        
        const { data: valuesData, error: valuesError } = await supabase
          .from('kemendagri_assessment_values' as any)
          .select('*');
        
        if (valuesError) {
          console.error('Error fetching assessment values:', valuesError);
          return;
        }
        
        const mappedAssessments = assessmentData.map((assessment: any) => {
          const values: Record<string, { value: number, score: number }> = {};
          
          valuesData
            .filter((value: any) => value.assessment_id === assessment.id)
            .forEach((value: any) => {
              values[value.indicator_id] = {
                value: Number(value.value),
                score: Number(value.score)
              };
            });
          
          return {
            id: assessment.id,
            name: assessment.name,
            year: assessment.year,
            date: assessment.date,
            userId: assessment.user_id,
            totalScore: assessment.total_score || 0,
            status: assessment.status as "draft" | "completed",
            values: values
          };
        });
        
        setAssessments(mappedAssessments);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, []);

  const handlePrint = () => {
    window.print();
  };
  
  const handleRefresh = () => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('kemendagri_assessments' as any)
          .select('*')
          .order('year', { ascending: true });
        
        if (assessmentError) {
          console.error('Error fetching assessments:', assessmentError);
          return;
        }
        
        if (!assessmentData || assessmentData.length === 0) {
          setLoading(false);
          return;
        }
        
        const { data: valuesData, error: valuesError } = await supabase
          .from('kemendagri_assessment_values' as any)
          .select('*');
        
        if (valuesError) {
          console.error('Error fetching assessment values:', valuesError);
          return;
        }
        
        const mappedAssessments = assessmentData.map((assessment: any) => {
          const values: Record<string, { value: number, score: number }> = {};
          
          valuesData
            .filter((value: any) => value.assessment_id === assessment.id)
            .forEach((value: any) => {
              values[value.indicator_id] = {
                value: Number(value.value),
                score: Number(value.score)
              };
            });
          
          return {
            id: assessment.id,
            name: assessment.name,
            year: assessment.year,
            date: assessment.date,
            userId: assessment.user_id,
            totalScore: assessment.total_score || 0,
            status: assessment.status as "draft" | "completed",
            values: values
          };
        });
        
        setAssessments(mappedAssessments);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
    toast({
      title: "Memperbarui Data",
      description: "Data laporan sedang diperbarui",
    });
  };

  const yearlyScoreData = assessments.map(assessment => ({
    year: assessment.year,
    score: assessment.totalScore,
    category: getHealthCategorykemendagri(assessment.totalScore).category
  }));
  
  const healthCategories = assessments.reduce<Record<string, number>>((acc, assessment) => {
    const category = getHealthCategorykemendagri(assessment.totalScore).category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  const healthCategoryData = Object.entries(healthCategories).map(([category, count]) => ({
    name: category,
    value: count
  }));
  
  const aspectData = kemendagriIndicators.reduce<Record<string, { category: string, indicators: string[] }>>((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = {
        category: indicator.category,
        indicators: []
      };
    }
    acc[indicator.category].indicators.push(indicator.id);
    return acc;
  }, {});
  
  const yearlyAspectScores = assessments.map(assessment => {
    const aspectScores: Record<string, number> = {};
    
    Object.entries(aspectData).forEach(([category, { indicators }]) => {
      let totalWeightedScore = 0;
      let totalWeight = 0;
      
      indicators.forEach(indicatorId => {
        const indicator = kemendagriIndicators.find(ind => ind.id === indicatorId);
        const value = assessment.values[indicatorId];
        
        if (indicator && value) {
          totalWeightedScore += value.score * indicator.weight;
          totalWeight += indicator.weight;
        }
      });
      
      aspectScores[category] = totalWeight ? totalWeightedScore / totalWeight : 0;
    });
    
    return {
      year: assessment.year,
      ...aspectScores
    };
  });

  if (loading) {
    return (
      <DashboardLayout title="Laporan Penilaian KEMENDAGRI">
        <div className="text-center py-10">
          <p className="text-muted-foreground">Memuat data laporan...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (assessments.length === 0) {
    return (
      <DashboardLayout title="Laporan Penilaian KEMENDAGRI">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Laporan Penilaian KEMENDAGRI</h1>
          </div>
          
          <Card>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-2">Belum ada data penilaian KEMENDAGRI</p>
                <p className="text-sm text-muted-foreground">Silahkan buat penilaian KEMENDAGRI terlebih dahulu</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Laporan Penilaian KEMENDAGRI">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Laporan Penilaian KEMENDAGRI</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden md:inline">Cetak</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Unduh PDF</span>
            </Button>
          </div>
        </div>

        {/* Filter Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year-select">Tahun</Label>
                <Select 
                  value={selectedYear}
                  onValueChange={(value) => setSelectedYear(value)}
                >
                  <SelectTrigger id="year-select">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    {Array.from(new Set(assessments.map(a => a.year))).sort((a, b) => b - a).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skor Total Per Tahun */}
        <Card>
          <CardHeader>
            <CardTitle>Skor Total Per Tahun</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 5]} />
                <Tooltip
                  formatter={(value: number) => [value.toFixed(2), "Skor"]}
                  labelFormatter={(label) => `Tahun ${label}`}
                />
                <Legend />
                <Bar dataKey="score" name="Skor Total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribusi Kategori Kesehatan */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori Kesehatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={healthCategoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {healthCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name]} 
                    labelFormatter={() => "Jumlah"} 
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 md:mt-0 md:ml-4">
                <h3 className="text-md font-medium mb-2">Legenda</h3>
                <ul className="space-y-1">
                  {healthCategoryData.map((entry, index) => (
                    <li key={index} className="flex items-center">
                      <div 
                        className="w-4 h-4 mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span>{entry.name}: {entry.value} penilaian</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skor Aspek Per Tahun */}
        <Card>
          <CardHeader>
            <CardTitle>Skor Aspek Per Tahun</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyAspectScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 5]} />
                <Tooltip 
                  formatter={(value: number, name: string) => [value.toFixed(2), `Aspek ${name}`]}
                  labelFormatter={(label) => `Tahun ${label}`}
                />
                <Legend />
                {Object.keys(aspectData).map((category, index) => (
                  <Line 
                    key={category}
                    type="monotone" 
                    dataKey={category} 
                    name={`Aspek ${category}`} 
                    stroke={COLORS[index % COLORS.length]} 
                    activeDot={{ r: 8 }} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabel Skor Per Tahun */}
        <Card>
          <CardHeader>
            <CardTitle>Tabel Skor Per Tahun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Tahun</th>
                    <th className="py-2 px-4 text-left">Skor Total</th>
                    <th className="py-2 px-4 text-left">Kategori</th>
                    {Object.keys(aspectData).map(category => (
                      <th key={category} className="py-2 px-4 text-left">Aspek {category}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {yearlyAspectScores.map((yearData, index) => {
                    const assessment = assessments[index];
                    const healthCategory = getHealthCategorykemendagri(assessment.totalScore);
                    
                    return (
                      <tr key={yearData.year} className="border-b last:border-0">
                        <td className="py-2 px-4">{yearData.year}</td>
                        <td className="py-2 px-4">{assessment.totalScore.toFixed(2)}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-white text-xs ${healthCategory.color}`}>
                            {healthCategory.category}
                          </span>
                        </td>
                        {Object.keys(aspectData).map(category => (
                          <td key={category} className="py-2 px-4">{yearData[category].toFixed(2)}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportsKemendagri;
