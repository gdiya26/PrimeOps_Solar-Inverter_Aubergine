-- schema.sql
-- You can copy and execute this entire script in the Supabase SQL Editor.
-- It will automatically provision all relational structures and insert your exact plant/table/inverter hierarchy.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if re-running to cleanly recreate schema
DROP TABLE IF EXISTS public.env_sensor_readings CASCADE;
DROP TABLE IF EXISTS public.smu_readings CASCADE;
DROP TABLE IF EXISTS public.meter_readings CASCADE;
DROP TABLE IF EXISTS public.inverter_readings CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.smus CASCADE;
DROP TABLE IF EXISTS public.meters CASCADE;
DROP TABLE IF EXISTS public.inverters CASCADE;
DROP TABLE IF EXISTS public.data_loggers CASCADE;
DROP TABLE IF EXISTS public.solar_tables CASCADE;
DROP TABLE IF EXISTS public.plants CASCADE;

-- =====================================================================
-- 1. HIERARCHY
-- =====================================================================
CREATE TABLE public.plants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.solar_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.data_loggers (
    mac_address VARCHAR(100) PRIMARY KEY,
    model_id VARCHAR(100),
    solar_table_id UUID REFERENCES public.solar_tables(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 2. HARDWARE EQUIPMENT
-- =====================================================================
CREATE TABLE public.inverters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(100), -- Maps to payload "inverters[0].id"
    solar_table_id UUID REFERENCES public.solar_tables(id) ON DELETE CASCADE,
    mac_address VARCHAR(100) REFERENCES public.data_loggers(mac_address) ON DELETE CASCADE,
    serial_number VARCHAR(100) UNIQUE,
    model VARCHAR(100),
    status VARCHAR(50) DEFAULT 'offline',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.meters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(100), -- Maps to payload "meters[0].id"
    solar_table_id UUID REFERENCES public.solar_tables(id) ON DELETE CASCADE,
    mac_address VARCHAR(100) REFERENCES public.data_loggers(mac_address) ON DELETE CASCADE,
    serial_number VARCHAR(100),
    model VARCHAR(100)
);

CREATE TABLE public.smus (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(100), -- Maps to payload "smu[0].id"
    solar_table_id UUID REFERENCES public.solar_tables(id) ON DELETE CASCADE,
    mac_address VARCHAR(100) REFERENCES public.data_loggers(mac_address) ON DELETE CASCADE
);

-- =====================================================================
-- 3. TELEMETRY READINGS
-- =====================================================================
CREATE TABLE public.inverter_readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inverter_id UUID REFERENCES public.inverters(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    alarm_code VARCHAR(50),
    op_state VARCHAR(50),
    power NUMERIC,
    temp NUMERIC,
    limit_percent NUMERIC,
    pv1_voltage NUMERIC,
    pv1_current NUMERIC,
    pv1_power NUMERIC,
    pv2_voltage NUMERIC,
    pv2_current NUMERIC,
    pv2_power NUMERIC,
    kwh_today NUMERIC,
    kwh_total NUMERIC,
    kwh_midnight NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.meter_readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meter_id UUID REFERENCES public.meters(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    meter_active_power NUMERIC,
    freq NUMERIC,
    pf NUMERIC,
    v_r NUMERIC,
    v_y NUMERIC,
    v_b NUMERIC,
    p_r NUMERIC,
    p_y NUMERIC,
    p_b NUMERIC,
    meter_kwh_today NUMERIC,
    meter_kwh_import NUMERIC,
    meter_kwh_total NUMERIC,
    original_meter_kwh_import NUMERIC,
    original_meter_kwh_total NUMERIC,
    base_meter_kwh_import NUMERIC,
    base_meter_kwh_total NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.smu_readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    smu_id UUID REFERENCES public.smus(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    string1 NUMERIC, string2 NUMERIC, string3 NUMERIC, string4 NUMERIC,
    string5 NUMERIC, string6 NUMERIC, string7 NUMERIC, string8 NUMERIC,
    string9 NUMERIC, string10 NUMERIC, string11 NUMERIC, string12 NUMERIC,
    string13 NUMERIC, string14 NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.env_sensor_readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mac_address VARCHAR(100) REFERENCES public.data_loggers(mac_address) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    ambient_temp NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Alerts Table
CREATE TABLE public.alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inverter_id UUID REFERENCES public.inverters(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- 4. SEED HIERARCHY DATA (3 Plants -> 6 Tables -> 32 Inverters)
-- =====================================================================
DO $$
DECLARE
    -- Plant IDs
    plant1_id UUID := uuid_generate_v4();
    plant2_id UUID := uuid_generate_v4();
    plant3_id UUID := uuid_generate_v4();
    
    -- Table System IDs
    table1_id UUID := uuid_generate_v4();
    table2_id UUID := uuid_generate_v4();
    table3_id UUID := uuid_generate_v4();
    table4_id UUID := uuid_generate_v4();
    table5_id UUID := uuid_generate_v4();
    table6_id UUID := uuid_generate_v4();
BEGIN
    -- Insert Plants
    INSERT INTO public.plants (id, name) VALUES
        (plant1_id, 'Solar Plant 1'),
        (plant2_id, 'Solar Plant 2'),
        (plant3_id, 'Solar Plant 3');

    -- Insert Tables mapping to Plants
    INSERT INTO public.solar_tables (id, plant_id, name) VALUES
        (table1_id, plant1_id, 'Table 1'),
        (table2_id, plant1_id, 'Table 2'),
        (table3_id, plant2_id, 'Table 3'),
        (table4_id, plant2_id, 'Table 4'),
        (table5_id, plant3_id, 'Table 5'),
        (table6_id, plant3_id, 'Table 6');

    -- Table 1: 12 Inverters
    FOR i IN 1..12 LOOP
        INSERT INTO public.inverters (solar_table_id, serial_number, model) 
        VALUES (table1_id, 'INV-P1T1-' || i, 'INV-Standard');
    END LOOP;

    -- Table 2: 11 Inverters
    FOR i IN 1..11 LOOP
        INSERT INTO public.inverters (solar_table_id, serial_number, model) 
        VALUES (table2_id, 'INV-P1T2-' || i, 'INV-Standard');
    END LOOP;

    -- Table 3: 5 Inverters
    FOR i IN 1..5 LOOP
        INSERT INTO public.inverters (solar_table_id, serial_number, model) 
        VALUES (table3_id, 'INV-P2T3-' || i, 'INV-Standard');
    END LOOP;

    -- Table 4: 2 Inverters
    FOR i IN 1..2 LOOP
        INSERT INTO public.inverters (solar_table_id, serial_number, model) 
        VALUES (table4_id, 'INV-P2T4-' || i, 'INV-Standard');
    END LOOP;

    -- Table 5: 1 Inverter
    INSERT INTO public.inverters (solar_table_id, serial_number, model) 
    VALUES (table5_id, 'INV-P3T5-1', 'INV-Standard');

    -- Table 6: 1 Inverter
    INSERT INTO public.inverters (solar_table_id, serial_number, model) 
    VALUES (table6_id, 'INV-P3T6-1', 'INV-Standard');

END $$;
