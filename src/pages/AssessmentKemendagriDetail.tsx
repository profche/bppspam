
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { kemendagriIndicators } from "@/models/kemendagri-indicators";
import { getHealthCategorykemendagri } from "@/models/health-categories";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { downloadCSV, downloadPDF } from "@/utils/exportUtils";
import { Edit, Download, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Assessment, Value } from "@/models/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const AssessmentKemendagriDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch assessment details
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('kemendagri_assessments')
          .select('*')
          .eq('id', id)
          .single();
        
        if (assessmentError) {
          console.error('Error fetching assessment:', assessmentError);
          return;
        }
        
        if (!assessmentData) {
          console.error('Assessment not found');
          return;
        }
        
        // Fetch assessment values
        const { data: valuesData, error: valuesError } = await supabase
          .from('kemendagri_assessment_values')
          .select('*')
          .eq('assessment_id', id);
        
        if (valuesError) {
          console.error('Error fetching assessment values:', valuesError);
          return;
        }
        
        // Create values object from the fetched values
        const valuesMap: Record<string, Value> = {};
        
        (valuesData as any[])?.forEach((item) => {
          valuesMap[item.indicator_id] = {
            value: Number(item.value),
            score: Number(item.score)
          };
        });
        
        // Set the assessment with the values mapped to our interface
        setAssessment({
          id: assessmentData.id,
          name: assessmentData.name,
          year: assessmentData.year,
          date: assessmentData.date,
          userId: assessmentData.user_id,
          totalScore: assessmentData.total_score || 0,
          status: assessmentData.status as "draft" | "completed",
          values: valuesMap
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessment();
  }, [id]);
  
  const handleEdit = () => {
    navigate(`/assessment/kemendagri/${id}/edit`);
  };
  
  const handleExport = (type: "csv" | "pdf") => {
    if (!assessment) return;
    
    if (type === "csv") {
      downloadCSV(assessment);
    } else {
      downloadPDF(assessment);
    }
  };

  const handleDeleteAssessment = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Hapus dulu semua nilai yang terkait dengan penilaian
      const { error: valuesError } = await supabase
        .from('kemendagri_assessment_values')
        .delete()
        .eq('assessment_id', id);
      
      if (valuesError) {
        console.error('Error deleting assessment values:', valuesError);
        toast({
          title: "Error",
          description: "Gagal menghapus nilai penilaian: " + valuesError.message,
          variant: "destructive"
        });
        return;
      }
      
      // Kemudian hapus penilaian itu sendiri
      const { error: assessmentError } = await supabase
        .from('kemendagri_assessments')
        .delete()
        .eq('id', id);
      
      if (assessmentError) {
        console.error('Error deleting assessment:', assessmentError);
        toast({
          title: "Error",
          description: "Gagal menghapus penilaian: " + assessmentError.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Berhasil",
        description: "Penilaian telah dihapus",
      });
      
      // Redirect ke halaman daftar penilaian
      navigate("/assessmentkemendagri");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus data: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };
  
  const chartData = useMemo(() => {
    if (!assessment) return [];
    
    return Object.entries(assessment.values).map(([indicatorId, valueObj]) => {
      const indicator = kemendagriIndicators.find(ind => ind.id === indicatorId);
      return {
        name: indicator?.name || indicatorId,
        category: indicator?.category || "Unknown",
        score: valueObj.score,
        weightedScore: valueObj.score * (indicator?.weight || 0),
      };
    });
  }, [assessment]);
  
  const categoryData = useMemo(() => {
    if (!assessment) return {};
    
    const result: Record<string, any[]> = {};
    
    kemendagriIndicators.forEach(indicator => {
      const valueObj = assessment.values[indicator.id];
      if (!valueObj) return;
      
      if (!result[indicator.category]) {
        result[indicator.category] = [];
      }
      
      result[indicator.category].push({
        ...indicator,
        value: valueObj.value,
        score: valueObj.score,
        weightedScore: valueObj.score * indicator.weight
      });
    });
    
    return result;
  }, [assessment]);
  
  // Hitung total skor per kategori
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    if (!assessment) return totals;
    
    Object.entries(categoryData).forEach(([category, indicators]) => {
      totals[category] = indicators.reduce((sum, indicator) => {
        return sum + indicator.weightedScore;
      }, 0);
    });
    
    return totals;
  }, [assessment, categoryData]);
  
  if (loading) {
    return (
      <DashboardLayout title="Detail Penilaian">
        <div className="text-center py-10">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!assessment) {
    return (
      <DashboardLayout title="Detail Penilaian">
        <div className="text-center">
          <p>Penilaian tidak ditemukan</p>
          <Button 
            onClick={() => navigate("/assessmentkemendagri")}
            className="mt-4"
          >
            Kembali ke Daftar Penilaian
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const healthCategory = getHealthCategorykemendagri(assessment.totalScore);
  
  return (
    <DashboardLayout title="Detail Penilaian">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detail Penilaian KEMENDAGRI</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                <AlertDialogDescription>
                  Penilaian tahun {assessment.year} akan dihapus secara permanen.
                  Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAssessment}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-4 bg-background">
          <h2 className="text-lg font-semibold mb-4">Informasi Umum</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Nama PDAM:</span>
              <span className="font-medium">{assessment.name}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Tahun Penilaian:</span>
              <span className="font-medium">{assessment.year}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Tanggal Penilaian:</span>
              <span className="font-medium">{new Date(assessment.date).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium capitalize">{assessment.status}</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-background">
          <h2 className="text-lg font-semibold mb-4">Hasil Penilaian KEMENDAGRI</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Total Skor:</span>
              <span className="font-medium">{assessment.totalScore.toFixed(3)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Kategori:</span>
              <span className={`font-medium px-2 py-0.5 rounded-full text-white text-sm ${healthCategory.color} inline-block text-center`}>
                {healthCategory.category}
              </span>
            </div>
            <div className="col-span-2 mt-2 text-sm text-muted-foreground">
              <p>Berdasarkan Permendagri Nomor 47 Tahun 1999 tentang Pedoman Penilaian Kinerja PDAM</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 mb-8 bg-background">
        <h2 className="text-lg font-semibold mb-4">Grafik Penilaian KEMENDAGRI</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => [value.toFixed(3), name === "weightedScore" ? "Nilai Tertimbang" : "Skor"]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar name="Nilai Tertimbang" dataKey="weightedScore" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {Object.entries(categoryData).map(([category, indicators]) => (
        <div key={category} className="border rounded-lg p-4 mb-6 bg-background">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Aspek {category}</h2>
            <div className="text-sm font-medium">
              Total Aspek: {categoryTotals[category].toFixed(3)}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Indikator</th>
                  <th className="py-2 px-4 text-left">Nilai</th>
                  <th className="py-2 px-4 text-left">Skor</th>
                  <th className="py-2 px-4 text-left">Bobot</th>
                  <th className="py-2 px-4 text-left">Nilai Tertimbang</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((indicator) => (
                  <tr key={indicator.id} className="border-b last:border-0">
                    <td className="py-2 px-4">{indicator.name}</td>
                    <td className="py-2 px-4">{indicator.value.toFixed(2)}</td>
                    <td className="py-2 px-4">{indicator.score}</td>
                    <td className="py-2 px-4">{indicator.weight.toFixed(3)}</td>
                    <td className="py-2 px-4">{indicator.weightedScore.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </DashboardLayout>
  );
};

export default AssessmentKemendagriDetail;
