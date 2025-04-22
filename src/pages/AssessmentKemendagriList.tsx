
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, RefreshCw, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getHealthCategorykemendagri } from "@/models/health-categories";
import { supabase } from "@/integrations/supabase/client";
import { Assessment } from "@/models/types";
import { useToast } from "@/components/ui/use-toast";
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

const AssessmentKemendagriList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
  
  // Fungsi untuk mengambil data penilaian
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // Query untuk mengambil data dari Supabase
      const { data, error } = await supabase
        .from('kemendagri_assessments')
        .select('*')
        .order('year', { ascending: false });
      
      if (error) {
        console.error('Error fetching assessments:', error);
        toast({
          title: "Error",
          description: "Gagal mengambil data penilaian: " + error.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log("Fetched assessment data:", data);
      
      // Map database column names to our interface properties
      const mappedData = data?.map((item: any) => ({
        id: item.id,
        name: item.name,
        year: item.year,
        date: item.date,
        userId: item.user_id,
        totalScore: item.total_score || 0,
        status: item.status as "draft" | "completed",
        values: {} // Initialize with empty values as we're not fetching them here
      })) || [];
      
      setAssessments(mappedData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data saat komponen pertama kali dimount
  useEffect(() => {
    fetchAssessments();
  }, []);
  
  const handleCreateNew = () => {
    navigate("/assessment/kemendagri");
  };
  
  const handleViewAssessment = (id: string) => {
    navigate(`/assessment/kemendagri/${id}`);
  };
  
  const handleRefresh = () => {
    fetchAssessments();
    toast({
      title: "Memperbarui Data",
      description: "Daftar penilaian sedang diperbarui",
    });
  };

  // Fungsi untuk menghapus penilaian
  const handleDeleteAssessment = async (id: string) => {
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
      
      // Update daftar setelah penghapusan
      setAssessments(assessments.filter(assessment => assessment.id !== id));
      
      toast({
        title: "Berhasil",
        description: "Penilaian telah dihapus",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus data: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setAssessmentToDelete(null);
    }
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Mencegah klik untuk membuka penilaian
    setAssessmentToDelete(id);
  };

  return (
    <DashboardLayout title="Penilaian PERUMDAM">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Penilaian KEMENDAGRI - PERUMDAM TIRTA KERTA RAHARJA</h1>
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
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Buat Penilaian Baru
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Belum ada penilaian KEMENDAGRI yang dibuat</p>
          <Button onClick={handleCreateNew} variant="outline">
            Buat Penilaian KEMENDAGRI Pertama
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => {
            const healthCategory = getHealthCategorykemendagri(assessment.totalScore);
                  
            return (
              <div 
                key={assessment.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewAssessment(assessment.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Tahun {assessment.year}</h3>
                  <div className={`${healthCategory.color} text-white text-xs px-2 py-1 rounded-full`}>
                    {healthCategory.category}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  Tanggal: {new Date(assessment.date).toLocaleDateString('id-ID')}
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    Skor: {assessment.totalScore.toFixed(3)}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <FileText className="h-4 w-4" />
                      Lihat
                    </Button>
                    <AlertDialog open={assessmentToDelete === assessment.id} onOpenChange={(open) => {
                      if (!open) setAssessmentToDelete(null);
                    }}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-destructive hover:bg-destructive/10"
                          onClick={(e) => confirmDelete(e, assessment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Penilaian KEMENDAGRI tahun {assessment.year} akan dihapus secara permanen.
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteAssessment(assessment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AssessmentKemendagriList;
