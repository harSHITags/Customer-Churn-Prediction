import React, { useState } from 'react';
import type { CustomerInput } from '../../types';
import { Spinner } from '../ui/Spinner';
import { AlertCircle, Play } from 'lucide-react';

interface PredictFormProps {
  onSubmit: (data: CustomerInput) => void;
  isLoading: boolean;
}

const initialFormState: CustomerInput = {
  CreditScore: 650,
  Geography: 'France',
  Gender: 'Female',
  Age: 35,
  Tenure: 5,
  Balance: 50000,
  NumOfProducts: 2,
  HasCrCard: 1,
  IsActiveMember: 1,
  EstimatedSalary: 85000
};

export const PredictForm: React.FC<PredictFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CustomerInput>(initialFormState);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = [
      'CreditScore', 'Age', 'Tenure', 'Balance', 
      'NumOfProducts', 'HasCrCard', 'IsActiveMember', 'EstimatedSalary'
    ];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Boundary validations
    if (formData.CreditScore < 300 || formData.CreditScore > 850) {
      setValidationError('Credit Score must be between 300 and 850.');
      return;
    }
    if (formData.Age < 18 || formData.Age > 100) {
      setValidationError('Age must be between 18 and 100.');
      return;
    }
    if (formData.Tenure < 0 || formData.Tenure > 20) {
      setValidationError('Tenure must be between 0 and 20 years.');
      return;
    }
    if (formData.Balance < 0) {
      setValidationError('Balance cannot be negative.');
      return;
    }
    if (formData.NumOfProducts < 1 || formData.NumOfProducts > 4) {
      setValidationError('Number of Products must be between 1 and 4.');
      return;
    }
    if (formData.EstimatedSalary < 0) {
      setValidationError('Estimated Salary cannot be negative.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-surface border border-border rounded-xl p-6 space-y-6">
      <div className="border-b border-border pb-3 flex justify-between items-center">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
          CUSTOMER DATA PROFILE INPUT
        </h3>
        <span className="text-[9px] font-mono text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
          MANUAL ENTRY
        </span>
      </div>

      {validationError && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-lg text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credit Score */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Credit Score (300-850)</label>
          <input
            type="number"
            name="CreditScore"
            value={formData.CreditScore}
            onChange={handleChange}
            required
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          />
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Age (18-100)</label>
          <input
            type="number"
            name="Age"
            value={formData.Age}
            onChange={handleChange}
            required
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          />
        </div>

        {/* Geography */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Geography</label>
          <select
            name="Geography"
            value={formData.Geography}
            onChange={handleChange}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          >
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Spain">Spain</option>
          </select>
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Gender</label>
          <select
            name="Gender"
            value={formData.Gender}
            onChange={handleChange}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>

        {/* Tenure */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Tenure (Years, 0-20)</label>
          <input
            type="number"
            name="Tenure"
            value={formData.Tenure}
            onChange={handleChange}
            required
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          />
        </div>

        {/* Balance */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Balance ($)</label>
          <input
            type="number"
            step="0.01"
            name="Balance"
            value={formData.Balance}
            onChange={handleChange}
            required
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          />
        </div>

        {/* Num Of Products */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Number of Products (1-4)</label>
          <input
            type="number"
            name="NumOfProducts"
            value={formData.NumOfProducts}
            onChange={handleChange}
            required
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          />
        </div>

        {/* Estimated Salary */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Estimated Salary ($)</label>
          <input
            type="number"
            step="0.01"
            name="EstimatedSalary"
            value={formData.EstimatedSalary}
            onChange={handleChange}
            required
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          />
        </div>

        {/* Has Credit Card */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Has Credit Card</label>
          <select
            name="HasCrCard"
            value={formData.HasCrCard}
            onChange={handleChange}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          >
            <option value={1}>Yes (1)</option>
            <option value={0}>No (0)</option>
          </select>
        </div>

        {/* Is Active Member */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Is Active Member</label>
          <select
            name="IsActiveMember"
            value={formData.IsActiveMember}
            onChange={handleChange}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono glow-focus transition-all"
          >
            <option value={1}>Active (1)</option>
            <option value={0}>Inactive (0)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent hover:bg-accent-soft text-white font-mono text-xs uppercase tracking-widest py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border border-accent/20 disabled:bg-bg-elevated disabled:text-text-muted disabled:border-border cursor-pointer"
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute Prediction Engine</span>
          </>
        )}
      </button>
    </form>
  );
};
