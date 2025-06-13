import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface AppraisalModalsProps {
  showLoginModal: boolean;
  setShowLoginModal: (open: boolean) => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (open: boolean) => void;
  showAlreadySavedModal: boolean;
  setShowAlreadySavedModal: (open: boolean) => void;
}

export function AppraisalModals({
  showLoginModal,
  setShowLoginModal,
  showSuccessModal,
  setShowSuccessModal,
  showAlreadySavedModal,
  setShowAlreadySavedModal,
}: AppraisalModalsProps) {
  const router = useRouter();

  return (
    <>
      <AlertDialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Guarda tus resultados</AlertDialogTitle>
            <AlertDialogDescription>
              Inicia sesión o regístrate para guardar este resultado de peritaje en tu historial y acceder a él en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ahora no</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.open('/auth', '_blank')}>
              Iniciar Sesión / Registrarse
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Guardado Exitoso!</AlertDialogTitle>
            <AlertDialogDescription>
              El resultado del peritaje ha sido guardado exitosamente en tu historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAlreadySavedModal} onOpenChange={setShowAlreadySavedModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resultado ya Guardado</AlertDialogTitle>
            <AlertDialogDescription>
              Este resultado de peritaje ya ha sido guardado previamente en tu historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlreadySavedModal(false)}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}