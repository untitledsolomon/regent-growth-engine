import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { Lead } from "@/data/mockData";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (leads: Lead[]) => void;
}

const leadFields = [
  { key: 'name', label: 'Full Name', required: true },
  { key: 'business', label: 'Business', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
] as const;

type Step = 'upload' | 'map' | 'preview' | 'done';

export function CSVImportDialog({ open, onOpenChange, onImport }: CSVImportDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setImportedCount(0);
  };

  const parseCSV = (text: string): string[][] => {
    return text.trim().split('\n').map(row => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of row) {
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else { current += char; }
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) return;
      setHeaders(rows[0]);
      setCsvData(rows.slice(1));
      // Auto-map by fuzzy matching
      const autoMap: Record<string, string> = {};
      for (const field of leadFields) {
        const match = rows[0].find(h =>
          h.toLowerCase().includes(field.key) ||
          h.toLowerCase().includes(field.label.toLowerCase())
        );
        if (match) autoMap[field.key] = match;
      }
      setMapping(autoMap);
      setStep('map');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const leads: Lead[] = csvData.map((row, i) => {
      const get = (field: string) => {
        const header = mapping[field];
        if (!header) return '';
        const idx = headers.indexOf(header);
        return idx >= 0 ? row[idx] || '' : '';
      };
      return {
        id: crypto.randomUUID(),
        name: get('name'),
        business: get('business'),
        email: get('email'),
        phone: get('phone') || '',
        source: 'phantombuster' as const,
        score: Math.floor(Math.random() * 40) + 50,
        status: 'new' as const,
        tags: [],
        createdAt: new Date().toISOString().split('T')[0],
      };
    }).filter(l => l.name && l.email);

    onImport(leads);
    setImportedCount(leads.length);
    setStep('done');
  };

  const canImport = mapping.name && mapping.email;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-display">Import Leads from CSV</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="py-8">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-sm">Click to upload CSV file</p>
              <p className="text-xs text-muted-foreground mt-1">Supports PhantomBuster export format</p>
            </div>
          </div>
        )}

        {step === 'map' && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm"><strong>{csvData.length}</strong> rows detected with <strong>{headers.length}</strong> columns</span>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Map CSV columns to lead fields:</p>
              {leadFields.map(field => (
                <div key={field.key} className="flex items-center gap-3">
                  <Label className="w-24 text-sm shrink-0">
                    {field.label}{field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={mapping[field.key] || ''} onValueChange={v => setMapping(m => ({ ...m, [field.key]: v }))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {csvData.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Preview (first 3 rows):</p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        {headers.map(h => <th key={h} className="px-3 py-1.5 text-left font-medium">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-t border-border/50">
                          {row.map((cell, j) => <td key={j} className="px-3 py-1.5 text-muted-foreground">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="py-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-regent-emerald mb-3" />
            <p className="font-display font-semibold text-lg">Import Successful!</p>
            <p className="text-sm text-muted-foreground mt-1">{importedCount} leads have been imported</p>
          </div>
        )}

        <DialogFooter>
          {step === 'map' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={handleImport} disabled={!canImport}>Import {csvData.length} Leads</Button>
            </>
          )}
          {step === 'done' && (
            <Button onClick={() => { reset(); onOpenChange(false); }}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
