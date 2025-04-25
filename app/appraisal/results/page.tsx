"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download, History } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const mockData = {
  technicalEvaluation: {
    condition: "Bueno",
    improvements: [
      "Actualización de acabados en baños",
      "Mantenimiento de pisos",
      "Pintura general",
    ],
    valueIncrease: 15,
  },
  economicEvaluation: {
    currentValue: 350000000,
    projectedValue: 402500000,
    monthlyData: [
      { month: "Ene", value: 350000000 },
      { month: "Feb", value: 355000000 },
      { month: "Mar", value: 365000000 },
      { month: "Abr", value: 375000000 },
      { month: "May", value: 385000000 },
      { month: "Jun", value: 402500000 },
    ],
  },
  legalEvaluation: {
    risks: ["Bajo riesgo de normativa urbanística"],
    recommendations: [
      "Actualizar certificado de libertad",
      "Verificar paz y salvo de impuestos",
    ],
  },
};

export default function Results() {
  const router = useRouter();

  useEffect(() => {
    // const saveResults = async () => {
    //   const { data: { user } } = await supabase.auth.getUser();
      
    //   if (user) {
    //     const { error } = await supabase
    //       .from('appraisals')
    //       .insert([
    //         {
    //           user_id: user.id,
    //           technical_evaluation: mockData.technicalEvaluation,
    //           economic_evaluation: mockData.economicEvaluation,
    //           legal_evaluation: mockData.legalEvaluation,
    //           created_at: new Date().toISOString(),
    //         }
    //       ]);

    //     if (error) {
    //       console.error('Error saving results:', error);
    //     }
    //   }
    // };

    // saveResults();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add content to PDF
    doc.setFontSize(20);
    doc.text("Resultados del Peritaje", 20, 20);
    
    doc.setFontSize(16);
    doc.text("Evaluación Técnica", 20, 40);
    doc.setFontSize(12);
    doc.text(`Estado: ${mockData.technicalEvaluation.condition}`, 20, 50);
    doc.text("Mejoras Recomendadas:", 20, 60);
    mockData.technicalEvaluation.improvements.forEach((improvement, index) => {
      doc.text(`- ${improvement}`, 25, 70 + (index * 10));
    });
    
    doc.setFontSize(16);
    doc.text("Evaluación Económica", 20, 110);
    doc.setFontSize(12);
    doc.text(`Valor Actual: $${mockData.economicEvaluation.currentValue.toLocaleString()}`, 20, 120);
    doc.text(`Valor Proyectado: $${mockData.economicEvaluation.projectedValue.toLocaleString()}`, 20, 130);
    
    doc.setFontSize(16);
    doc.text("Evaluación Legal", 20, 150);
    doc.setFontSize(12);
    doc.text("Riesgos:", 20, 160);
    mockData.legalEvaluation.risks.forEach((risk, index) => {
      doc.text(`- ${risk}`, 25, 170 + (index * 10));
    });
    
    doc.save("peritaje-inmobiliario.pdf");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Link>
        <div className="space-x-4">
          <Link href="/history">
            <Button variant="outline" className="inline-flex items-center">
              <History className="w-4 h-4 mr-2" />
              Historial
            </Button>
          </Link>
          <Button onClick={handleDownloadPDF} className="inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Resultados del Peritaje</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Evaluación Técnica */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Evaluación Técnica</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Estado General</h3>
                <p className="text-muted-foreground">{mockData.technicalEvaluation.condition}</p>
              </div>
              <div>
                <h3 className="font-medium">Mejoras Recomendadas</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {mockData.technicalEvaluation.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium">Potencial de Valorización</h3>
                <p className="text-muted-foreground">{mockData.technicalEvaluation.valueIncrease}%</p>
              </div>
            </div>
          </Card>

          {/* Evaluación Económica */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Evaluación Económica</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.economicEvaluation.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Valor Actual: ${mockData.economicEvaluation.currentValue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Valor Proyectado: ${mockData.economicEvaluation.projectedValue.toLocaleString()}
              </p>
            </div>
          </Card>

          {/* Evaluación Legal */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Evaluación Legal</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Riesgos Identificados</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {mockData.legalEvaluation.risks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Recomendaciones Legales</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {mockData.legalEvaluation.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}