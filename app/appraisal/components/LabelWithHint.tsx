import React from 'react';
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react"; // Icono de información

interface LabelWithHintProps {
  htmlFor?: string; // Make htmlFor optional
  labelText: string;
  hintText: string;
}

const LabelWithHint: React.FC<LabelWithHintProps> = ({ htmlFor, labelText, hintText }) => (
  <div className="flex items-center space-x-1">
    <Label htmlFor={htmlFor}>{labelText}</Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="tooltip-content-long-text"> {/* Apply the new class here */}
          <p>{hintText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

export default LabelWithHint;