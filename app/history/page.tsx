"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { jsPDF } from "jspdf";

type Appraisal = {
  id: string;
  created_at: string;
  technical_evaluation: any;
  economic_evaluation: any;
  legal_evaluation: any;
};

export default function History() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [filteredAppraisals, setFilteredAppraisals] = useState<Appraisal[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchAppraisals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('appraisals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching appraisals:', error);
        } else {
          setAppraisals(data || []);
          setFilteredAppraisals(data || []);
        }
      }
    };

    fetchAppraisals();
  }, []);

  const handleDateFilter = (date: string) => {
    setDateFilter(date);
    if (!date) {
      setFilteredAppraisals(appraisals);
    } else {
      const filtered = appraisals.filter(appraisal => 
        appraisal.created_at.startsWith(date)
      );
      setFilteredAppraisals(filtered);
    }
  };

  const handleDownloadPDF = (appraisal: Appraisal) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Resultados del Peritaje", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha: ${format(new Date(appraisal.created_at), 'dd/MM/yyyy')}`, 20, 30);
    
    // Add more content based on appraisal data...
    
    doc.save(`peritaje-${format(new Date(appraisal.created_at), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Inicio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Historial de Peritajes</h1>

        <div className="mb-8">
          <Label htmlFor="dateFilter">Filtrar por fecha</Label>
          <Input
            type="date"
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => handleDateFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="grid gap-6">
          {filteredAppraisals.map((appraisal) => (
            <Card key={appraisal.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Peritaje del {format(new Date(appraisal.created_at), 'dd/MM/yyyy')}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Valor estimado: ${appraisal.economic_evaluation.currentValue.toLocaleString()}
                  </p>
                  <div className="space-y-2">
                    <p>Estado: {appraisal.technical_evaluation.condition}</p>
                    <p>Valorización potencial: {appraisal.technical_evaluation.valueIncrease}%</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownloadPDF(appraisal)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}