-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  diagnosis TEXT NOT NULL,
  doctor_notes TEXT,
  prescribed_medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescriptions (public access for now, similar to other tables)
CREATE POLICY "Anyone can view prescriptions"
  ON public.prescriptions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert prescriptions"
  ON public.prescriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update prescriptions"
  ON public.prescriptions
  FOR UPDATE
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();