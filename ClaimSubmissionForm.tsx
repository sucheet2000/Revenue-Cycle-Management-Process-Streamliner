import React, { useState, FormEvent, ChangeEvent } from 'react';
import { 
  AlertCircle, 
  Check, 
  ChevronDown, 
  Loader2, 
  FileText, 
  User, 
  Building2, 
  Activity, 
  Calendar as CalendarIcon,
  X
} from 'lucide-react';

// --- Utility for Tailwind classes ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- Mock UI Components (Simulating shadCN) ---

const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700", className)} {...props}>
    {children}
  </label>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost', isLoading?: boolean }>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
      outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
      ghost: "hover:bg-slate-100 hover:text-slate-900",
    };
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
          variants[variant],
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }>(
  ({ className, children, error, ...props }, ref) => (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  )
);
Select.displayName = "Select";

const Card = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm", className)}>
    {children}
  </div>
);

const CardHeader = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>
);

const CardTitle = ({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>{children}</h3>
);

const CardContent = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)}>{children}</div>
);

const CardFooter = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>
);

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 z-50 flex items-center w-full max-w-md p-4 mb-4 text-slate-500 bg-white rounded-lg shadow dark:text-slate-400 dark:bg-slate-800 border border-slate-200 animate-in slide-in-from-bottom-5 duration-300">
    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
      <Check className="w-5 h-5" />
      <span className="sr-only">Check icon</span>
    </div>
    <div className="ml-3 text-sm font-normal">{message}</div>
    <button onClick={onClose} type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex items-center justify-center h-8 w-8 dark:text-slate-500 dark:hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700">
      <span className="sr-only">Close</span>
      <X className="w-3 h-3" />
    </button>
  </div>
);

// --- Main Component ---

interface FormData {
  patientId: string;
  dob: string;
  physicianName: string;
  npiNumber: string;
  procedureCode: string;
  startDate: string;
  endDate: string;
  hasNotes: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const PROCEDURE_CODES = [
  { value: "", label: "Select a procedure code" },
  { value: "99213", label: "99213 - Office Visit (Level 3)" },
  { value: "99214", label: "99214 - Office Visit (Level 4)" },
  { value: "71045", label: "71045 - Chest X-Ray" },
  { value: "93000", label: "93000 - Electrocardiogram (ECG)" },
];

export default function ClaimSubmissionForm() {
  const [formData, setFormData] = useState<FormData>({
    patientId: "",
    dob: "",
    physicianName: "",
    npiNumber: "",
    procedureCode: "",
    startDate: "",
    endDate: "",
    hasNotes: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'patientId':
        return !value ? "Patient ID is required" : "";
      case 'dob':
        return !value ? "Date of Birth is required" : "";
      case 'physicianName':
        return !value ? "Physician Name is required" : "";
      case 'npiNumber':
        if (!value) return "NPI Number is required";
        if (!/^\d{10}$/.test(value)) return "NPI must be exactly 10 digits";
        return "";
      case 'procedureCode':
        return !value ? "Procedure Code is required" : "";
      case 'startDate':
        return !value ? "Start Date is required" : "";
      case 'endDate':
        if (!value) return "End Date is required";
        if (formData.startDate && new Date(value) < new Date(formData.startDate)) {
          return "End Date cannot be before Start Date";
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Inline validation
    if (name !== 'hasNotes') {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      if (key !== 'hasNotes') {
        const error = validateField(key, (formData as any)[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Reset form after success (optional, keeping data for view in this demo)
    // setFormData({ ... });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 flex justify-center items-start">
      <Card className="w-full max-w-4xl shadow-lg border-t-4 border-t-slate-900">
        <CardHeader className="border-b border-slate-100 bg-white/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prior Authorization Request</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Submit a new authorization request for review.</p>
            </div>
            <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Activity className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8 mt-6">
            
            {/* Section 1: Patient Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Patient Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input 
                    id="patientId" 
                    name="patientId" 
                    placeholder="e.g. PT-123456" 
                    value={formData.patientId} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    error={errors.patientId}
                  />
                  {errors.patientId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.patientId}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <div className="relative">
                    <Input 
                      id="dob" 
                      name="dob" 
                      type="date" 
                      value={formData.dob} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      error={errors.dob}
                      className="pl-10"
                    />
                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.dob && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.dob}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Provider Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Provider Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="physicianName">Requesting Physician</Label>
                  <Input 
                    id="physicianName" 
                    name="physicianName" 
                    placeholder="Dr. Jane Doe" 
                    value={formData.physicianName} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    error={errors.physicianName}
                  />
                  {errors.physicianName && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.physicianName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npiNumber">NPI Number</Label>
                  <Input 
                    id="npiNumber" 
                    name="npiNumber" 
                    placeholder="10-digit NPI" 
                    maxLength={10}
                    value={formData.npiNumber} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    error={errors.npiNumber}
                  />
                  {errors.npiNumber && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.npiNumber}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Authorization Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Authorization Details</h4>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="procedureCode">Procedure Code</Label>
                  <Select 
                    id="procedureCode" 
                    name="procedureCode" 
                    value={formData.procedureCode} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    error={errors.procedureCode}
                  >
                    {PROCEDURE_CODES.map(code => (
                      <option key={code.value} value={code.value} disabled={code.value === ""}>
                        {code.label}
                      </option>
                    ))}
                  </Select>
                  {errors.procedureCode && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.procedureCode}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Service Start Date</Label>
                    <div className="relative">
                      <Input 
                        id="startDate" 
                        name="startDate" 
                        type="date" 
                        value={formData.startDate} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        error={errors.startDate}
                        className="pl-10"
                      />
                      <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.startDate && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.startDate}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Service End Date</Label>
                    <div className="relative">
                      <Input 
                        id="endDate" 
                        name="endDate" 
                        type="date" 
                        value={formData.endDate} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        error={errors.endDate}
                        className="pl-10"
                      />
                      <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.endDate && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.endDate}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Supporting Documentation */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3 p-4 rounded-md bg-slate-50 border border-slate-200">
                <div className="flex items-center h-5">
                  <input
                    id="hasNotes"
                    name="hasNotes"
                    type="checkbox"
                    checked={formData.hasNotes}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </div>
                <div className="text-sm leading-none">
                  <label htmlFor="hasNotes" className="font-medium text-slate-900">
                    Supporting clinical notes are attached
                  </label>
                  <p className="text-slate-500 mt-1">Check this box to confirm that you have uploaded or attached the necessary clinical documentation for this request.</p>
                </div>
              </div>
            </div>

            <CardFooter className="px-0 pt-4">
              <Button 
                type="submit" 
                className="w-full md:w-auto md:ml-auto min-w-[150px]" 
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Claim'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {showSuccess && (
        <Toast 
          message="Prior Authorization Request submitted successfully." 
          onClose={() => setShowSuccess(false)} 
        />
      )}
    </div>
  );
}
