-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  contact_number TEXT NOT NULL,
  reason_for_visit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create queue_entries table
CREATE TABLE IF NOT EXISTS public.queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  queue_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'being_examined', 'done', 'cancelled')),
  estimated_wait_time INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now(),
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;

-- Create medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 100,
  in_stock BOOLEAN GENERATED ALWAYS AS (stock > 0) STORED,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Create medicine_orders table
CREATE TABLE IF NOT EXISTS public.medicine_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  order_number INTEGER NOT NULL,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'collected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  collected_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.medicine_orders ENABLE ROW LEVEL SECURITY;

-- Public access policies (no authentication required for now)
CREATE POLICY "Anyone can view patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert patients" ON public.patients FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view queue entries" ON public.queue_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert queue entries" ON public.queue_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update queue entries" ON public.queue_entries FOR UPDATE USING (true);

CREATE POLICY "Anyone can view medicines" ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Anyone can insert medicines" ON public.medicines FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update medicines" ON public.medicines FOR UPDATE USING (true);

CREATE POLICY "Anyone can view medicine orders" ON public.medicine_orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert medicine orders" ON public.medicine_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update medicine orders" ON public.medicine_orders FOR UPDATE USING (true);

-- Insert sample medicines data
INSERT INTO public.medicines (name, category, price, stock, description) VALUES
  ('Paracetamol 500mg', 'Pain Relief', 5000, 100, 'For fever and mild pain'),
  ('Ibuprofen 400mg', 'Pain Relief', 8000, 100, 'Anti-inflammatory pain relief'),
  ('Amoxicillin 250mg', 'Antibiotic', 15000, 50, 'Broad-spectrum antibiotic'),
  ('Cetirizine 10mg', 'Allergy', 6000, 80, 'Antihistamine for allergies'),
  ('Omeprazole 20mg', 'Digestive', 12000, 60, 'Reduces stomach acid'),
  ('Loratadine 10mg', 'Allergy', 7000, 0, '24-hour allergy relief'),
  ('Vitamin C 1000mg', 'Supplement', 10000, 120, 'Immune system support'),
  ('Cough Syrup', 'Cold & Flu', 9000, 70, 'Relieves cough and throat irritation')
ON CONFLICT DO NOTHING;

-- Create function to auto-increment queue number
CREATE OR REPLACE FUNCTION get_next_queue_number()
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(queue_number), 0) + 1 INTO next_num FROM public.queue_entries;
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-increment order number
CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(order_number), 0) + 1 INTO next_num FROM public.medicine_orders;
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;