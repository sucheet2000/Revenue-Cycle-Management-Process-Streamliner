'use client';

import React, { useState, FormEvent, ChangeEvent, useRef, MouseEvent } from 'react';
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
  X,
  Sparkles,
  Upload,
  File as FileIcon
} from 'lucide-react';

// ============================================================================
// Utility Functions
// ============================================================================

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// ============================================================================
// UI Components with Enhanced Micro-interactions
// ============================================================================

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
    const [isHovered, setIsHovered] = useState(false);

    const variants = {
      primary: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 relative overflow-hidden",
      outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
      ghost: "hover:bg-slate-100 hover:text-slate-900",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
          variants[variant],
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Animated border beam effect on hover */}
        {variant === 'primary' && isHovered && !isLoading && (
          <span className="absolute inset-0 rounded-md">
            <span className="absolute inset-0 rounded-md border-2 border-slate-400 animate-pulse" />
            <span className="absolute inset-0 rounded-md border-2 border-slate-300 animate-ping opacity-75" />
          </span>
        )}

        <span className="relative z-10 flex items-center">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {children}
        </span>
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
          "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all duration-200",
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

// Card with Flashlight Hover Effect
const Card = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      className={cn("rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Flashlight effect */}
      {isHovering && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(148, 163, 184, 0.15), transparent 40%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

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

const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) => (
  <div className={cn(
    "fixed bottom-4 right-4 z-50 flex items-center w-full max-w-md p-4 mb-4 rounded-lg shadow-lg border animate-in slide-in-from-bottom-5 duration-300",
    type === 'success' ? "bg-white text-slate-500 border-slate-200" : "bg-red-50 text-red-800 border-red-200"
  )}>
    <div className={cn(
      "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg",
      type === 'success' ? "text-green-500 bg-green-100" : "text-red-500 bg-red-100"
    )}>
      {type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="sr-only">{type === 'success' ? 'Check icon' : 'Error icon'}</span>
    </div>
    <div className="ml-3 text-sm font-normal">{message}</div>
    <button onClick={onClose} type="button" className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">
      <span className="sr-only">Close</span>
      <X className="w-3 h-3" />
    </button>
  </div>
);

// ============================================================================
// Main Form Component
// ============================================================================

interface FormData {
  patientId: string;
  dob: string;
  physicianName: string;
  npiNumber: string;
  procedureCode: string;
  startDate: string;
  endDate: string;
  hasNotes: boolean;
  uploadedFile: File | null;
}

interface FormErrors {
  [key: string]: string;
}

const PROCEDURE_CODES = [
  { value: "", label: "Select a procedure code" },
  { value: "A876", label: "A876 - Specialized Consultation" },
  { value: "B901", label: "B901 - Advanced Imaging" },
  { value: "C102", label: "C102 - Therapeutic Procedure" },
  { value: "D203", label: "D203 - Diagnostic Test" },
];

export default function PriorAuthForm() {
  const [formData, setFormData] = useState<FormData>({
    patientId: "",
    dob: "",
    physicianName: "",
    npiNumber: "",
    procedureCode: "",
    startDate: "",
    endDate: "",
    hasNotes: false,
    uploadedFile: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'patientId':
        if (!value) return "Patient ID is required";
        if (!/^[0-9a-fA-F-]{36}$/.test(value) && value.length > 0) return "Invalid UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)";
        return "";
      case 'dob':
        return !value ? "Date of Birth is required" : "";
      case 'physicianName':
        if (!value) return "Physician Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return "";
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      setToast({ message: `Invalid file type. Only PDF, DOC, and DOCX files are allowed.`, type: 'error' });
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setToast({ message: `File too large. Maximum size is 10MB.`, type: 'error' });
      return;
    }

    setFormData(prev => ({ ...prev, uploadedFile: file, hasNotes: true }));
    setToast({ message: `File "${file.name}" ready to upload.`, type: 'success' });
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, uploadedFile: null, hasNotes: false }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    if (!formData.patientId) { newErrors.patientId = "Patient ID is required"; isValid = false; }
    if (!formData.dob) { newErrors.dob = "Date of Birth is required"; isValid = false; }
    if (!formData.physicianName) { newErrors.physicianName = "Physician Name is required"; isValid = false; }
    if (!formData.npiNumber) { newErrors.npiNumber = "NPI Number is required"; isValid = false; }
    if (!formData.procedureCode) { newErrors.procedureCode = "Procedure Code is required"; isValid = false; }
    if (!formData.startDate) { newErrors.startDate = "Start Date is required"; isValid = false; }
    if (!formData.endDate) { newErrors.endDate = "End Date is required"; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setToast({ message: "Please fix the validation errors before submitting.", type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    try {
      // Simulate API call to POST /api/v1/claims/prior_auth
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitting(false);
      setToast({ message: "Prior Authorization Request submitted successfully.", type: 'success' });
    } catch (error) {
      setIsSubmitting(false);
      setToast({ message: "An error occurred while submitting the request.", type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 font-sans text-slate-900 flex justify-center items-start">
      <Card className="w-full max-w-4xl shadow-xl border-t-4 border-t-slate-900">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-slate-700" />
                Prior Authorization Request
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">Submit a new authorization request for review.</p>
            </div>
            <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 shadow-inner">
              <Activity className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8 mt-6">

            {/* Section 1: Patient Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <User className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Patient Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID (UUID)</Label>
                  <Input
                    id="patientId"
                    name="patientId"
                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    value={formData.patientId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.patientId}
                  />
                  {errors.patientId && <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" />{errors.patientId}</p>}
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
                  {errors.dob && <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" />{errors.dob}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Provider Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
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
                  {errors.physicianName && <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" />{errors.physicianName}</p>}
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
                  {errors.npiNumber && <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" />{errors.npiNumber}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Authorization Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
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
                  {errors.procedureCode && <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" />{errors.procedureCode}</p>}
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
                    {errors.startDate && <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" />{errors.startDate}</p>}
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
                    {errors.endDate && <p className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle className="h-3 w-3" />{errors.endDate}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Supporting Documentation */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Upload className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Clinical Documentation</h4>
              </div>

              {/* File Upload Area */}
              <div className="space-y-4">
                <div
                  className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-slate-400 transition-colors cursor-pointer bg-slate-50/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!formData.uploadedFile ? (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-900">
                          Click to upload clinical notes
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PDF, DOC, or DOCX (max 10MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200">
                          <FileIcon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {formData.uploadedFile.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(formData.uploadedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-md bg-blue-50 border border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Upload supporting clinical documentation (progress notes, lab results, imaging reports) to expedite the authorization process.
                  </p>
                </div>
              </div>
            </div>

            <CardFooter className="px-0 pt-4">
              <Button
                type="submit"
                className="w-full md:w-auto md:ml-auto min-w-[180px] shadow-lg hover:shadow-xl"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Claim'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
