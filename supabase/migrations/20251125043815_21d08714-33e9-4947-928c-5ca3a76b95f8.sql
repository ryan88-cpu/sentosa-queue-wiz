-- Add status column to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- Add check constraint for valid status values
ALTER TABLE public.prescriptions 
ADD CONSTRAINT prescriptions_status_check 
CHECK (status IN ('pending', 'dispensed', 'collected'));

-- Create index for faster status queries
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);