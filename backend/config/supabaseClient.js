const path = require('path');
const fs = require('fs');

// Load .env from backend/ directory using absolute path (robust to UTF-16 re-saves)
const envPath = path.resolve(__dirname, '../.env');
const result = require('dotenv').config({ path: envPath });

// If dotenv couldn't find the vars (e.g. .env saved as UTF-16 by VS Code), read manually
if (!process.env.SUPABASE_URL) {
    try {
        const raw = fs.readFileSync(envPath, 'utf16le');
        raw.split(/\r?\n/).forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
        });
    } catch (_) {}
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.');
}

const customFetch = async (url, options) => {
    let retries = 3;
    while (retries > 0) {
        try {
            return await fetch(url, { ...options, keepalive: true });
        } catch (err) {
            retries -= 1;
            if (retries === 0) throw err;
            await new Promise(res => setTimeout(res, 1500)); // wait 1.5s before retry
        }
    }
};

const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
    auth: { persistSession: false },
    global: { fetch: customFetch }
});

module.exports = supabase;
