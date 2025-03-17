"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, ChartBar, Scale, CheckCircle2, Shield, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const features = [
  {
    icon: Building2,
    title: "Evaluación Técnica",
    description: "Análisis detallado del estado físico, recomendaciones de mejoras y proyecciones de valorización."
  },
  {
    icon: ChartBar,
    title: "Evaluación Económica",
    description: "Valoración actual, proyecciones financieras y simulación de escenarios de inversión."
  },
  {
    icon: Scale,
    title: "Evaluación Legal",
    description: "Análisis de restricciones normativas, riesgos legales y requisitos según Decreto 1077/2015."
  }
];

const benefits = [
  {
    icon: CheckCircle2,
    title: "Precisión",
    description: "Evaluaciones detalladas y precisas basadas en datos del mercado actual"
  },
  {
    icon: Shield,
    title: "Seguridad",
    description: "Análisis completo de riesgos y aspectos legales para su tranquilidad"
  },
  {
    icon: Clock,
    title: "Rapidez",
    description: "Resultados inmediatos gracias a nuestra tecnología de IA"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Sistema de Peritaje Inmobiliario
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Evaluación profesional y precisa de propiedades en Colombia utilizando inteligencia artificial
          </p>
          <Link href="/appraisal">
            <Button size="lg" className="text-lg px-8 hover:scale-105 transition-transform">
              Comenzar Evaluación <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div 
          className="mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Beneficios de Nuestro Sistema
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="flex flex-col items-center text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.2 }}
              >
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="bg-card p-12 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Obtenga una evaluación profesional de su propiedad en minutos
            </p>
            <Link href="/appraisal">
              <Button size="lg" className="text-lg px-12 hover:scale-105 transition-transform">
                Evaluar mi Propiedad
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}