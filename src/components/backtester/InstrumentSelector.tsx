import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InstrumentSelectorProps {
  instruments: string[];
  selectedInstrument: string | null;
  onSelect: (instrument: string | null) => void;
}

export function InstrumentSelector({ instruments, selectedInstrument, onSelect }: InstrumentSelectorProps) {
  return (
    <Select
      value={selectedInstrument || "all"}
      onValueChange={(value) => onSelect(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select instrument" />
      </SelectTrigger>
      <SelectContent className="bg-background border-border z-50">
        <SelectItem value="all">All Instruments</SelectItem>
        {instruments.map((instrument) => (
          <SelectItem key={instrument} value={instrument}>
            {instrument}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
