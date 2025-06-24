"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

const analysisStages = [
    "Detectando imágenes y características principales...",
    "Realizando análisis legal y normativo...",
    "Ejecutando análisis económico y de mercado...",
    "Identificando potencial de valorización y mejoras técnicas...",
    "Generando informe consolidado y refinando resultados...",
];

const realEstateTips = [
    "Tip para arrendadores: Realiza una verificación de antecedentes completa a los posibles inquilinos.",
    "Tip para arrendadores: Un contrato de arrendamiento claro y detallado es tu mejor protección legal.",
    "Tip para arrendadores: Contrata un seguro de arrendamiento para cubrirte contra impagos o daños.",
    "Tip para arrendadores: Documenta el estado del inmueble con fotos y video antes de la entrega de llaves.",
    "Tip para arrendadores: Establece una política clara sobre mascotas, reparaciones y subarrendamiento desde el inicio.",
    "Tip para arrendadores: Mantén una comunicación fluida y respetuosa con tus inquilinos.",
    "Tip para arrendadores: Realiza inspecciones periódicas (avisando con antelación) para asegurar el buen estado del inmueble.",
    "Tip para arrendadores: Atiende las solicitudes de reparación de manera oportuna para mantener a los inquilinos satisfechos.",
    "Tip para arrendadores: Conoce la ley de arrendamiento local para evitar problemas y sanciones.",
    "Tip para arrendadores: Un pequeño detalle de bienvenida puede iniciar una excelente relación con tu nuevo inquilino.",
    "Tip para arrendadores: Considera la administración profesional si tienes varias propiedades o poco tiempo.",
    "Tip para arrendadores: Mantén un fondo de emergencia para cubrir reparaciones inesperadas sin demoras.",
    "Tip para arrendadores: Ofrecer opciones de pago en línea puede facilitar el cobro puntual de la renta.",
    "Tip para arrendadores: Un inmueble limpio y bien mantenido atrae a inquilinos de mayor calidad y reduce la rotación.",
    "Tip para arrendadores: Sé claro sobre qué servicios públicos están incluidos en la renta y cuáles son responsabilidad del inquilino.",
    "Tip para arrendadores: Renovar contratos con buenos inquilinos ahorra tiempo y dinero en buscar nuevos.",
    "Tip para arrendadores: Un precio de renta competitivo y justo es clave para una baja tasa de vacancia.",
    "Tip para arrendadores: La seguridad es primordial: asegúrate de que cerraduras y detectores de humo funcionen correctamente.",
    "Tip para arrendadores: Responde rápidamente a las consultas de potenciales inquilinos para no perder oportunidades.",
    "Tip para arrendadores: Considera permitir pequeñas personalizaciones para que el inquilino sienta el espacio como su hogar.",
];

// Función para barajar un array (Fisher-Yates shuffle)
const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const LoadingAnalysis = () => {
    const [progress, setProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState(analysisStages[0]);
    const [shuffledTips, setShuffledTips] = useState(() => shuffleArray(realEstateTips));
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        const totalDuration = 120 * 1000; // 120 seconds
        const intervalTime = 100; // update every 100ms

        const progressTimer = setInterval(() => {
            setProgress(prevProgress => {
                if (prevProgress >= 100) {
                    clearInterval(progressTimer);
                    return 100;
                }
                const newProgress = prevProgress + (intervalTime / totalDuration) * 100;

                const elapsedSeconds = (newProgress / 100) * 120;
                if (elapsedSeconds < 25) {
                    setCurrentStage(analysisStages[0]);
                } else if (elapsedSeconds < 50) {
                    setCurrentStage(analysisStages[1]);
                } else if (elapsedSeconds < 75) {
                    setCurrentStage(analysisStages[2]);
                } else if (elapsedSeconds < 100) {
                    setCurrentStage(analysisStages[3]);
                } else {
                    setCurrentStage(analysisStages[4]);
                }
                
                return newProgress;
            });
        }, intervalTime);

        const tipTimer = setInterval(() => {
            setTipIndex(prevIndex => {
                const nextIndex = prevIndex + 1;
                if (nextIndex >= shuffledTips.length) {
                    setShuffledTips(shuffleArray(realEstateTips)); // Re-shuffle for the next cycle
                    return 0;
                }
                return nextIndex;
            });
        }, 7000);

        return () => {
            clearInterval(progressTimer);
            clearInterval(tipTimer);
        };
    }, [shuffledTips.length]);

    return (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg max-w-2xl mx-auto">
            <div className="w-full text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">{currentStage}</p>
                <Progress value={progress} className="w-full h-4" />
                <p className="text-sm text-gray-500 mt-4 italic">{shuffledTips[tipIndex]}</p>
            </div>
        </div>
    );
};

export default LoadingAnalysis;