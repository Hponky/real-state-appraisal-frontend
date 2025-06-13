import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, History, Download, Save } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface AppraisalHeaderActionsProps {
  user: User | null;
  isSaving: boolean;
  onSave: () => void;
  onDownload: () => void;
}

export function AppraisalHeaderActions({
  user,
  isSaving,
  onSave,
  onDownload,
}: AppraisalHeaderActionsProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Inicio
      </Link>
      <div className="space-x-4">
        {user?.email && (
          <Button
            variant="outline"
            className="inline-flex items-center"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar Resultado"}
          </Button>
        )}
        <Button variant="outline" className="inline-flex items-center" onClick={onDownload}>
          <Download className="w-4 h-4 mr-2" />
          Descargar PDF
        </Button>
        <Link href="/history">
          <Button variant="outline" className="inline-flex items-center">
            <History className="w-4 h-4 mr-2" />
            Historial
          </Button>
        </Link>
      </div>
    </div>
  );
}