/**
 * Apply Missing Database Components to Production
 * 
 * This script:
 * 1. Enables PostgreSQL extensions (pg_trgm, pgcrypto)
 * 2. Checks which migrations need to be applied
 * 3. Provides guidance on applying missing RPC functions
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.error('   This script requires service role key to enable extensions.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableExtensions() {
  console.log('🔧 Enabling PostgreSQL Extensions...\n');

  const extensions = [
    { name: 'pg_trgm', description: 'Trigram matching for fuzzy text search' },
    { name: 'pgcrypto', description: 'Cryptographic functions for UUID generation' }
  ];

  for (const ext of extensions) {
    try {
      const { error } = await supabase.rpc('query' as any, {
        query: `CREATE EXTENSION IF NOT EXISTS ${ext.name};`
      });

      if (error) {
        console.log(`❌ ${ext.name}: ${error.message}`);
        console.log(`   Note: Extensions may require superuser privileges.`);
        console.log(`   Please run this SQL manually in Supabase Dashboard → SQL Editor:`);
        console.log(`   CREATE EXTENSION IF NOT EXISTS ${ext.name};`);
      } else {
        console.log(`✅ ${ext.name}: Enabled (${ext.description})`);
      }
    } catch (err: any) {
      console.log(`⚠️  ${ext.name}: Cannot enable via API (${err.message})`);
      console.log(`   Run this SQL manually in Supabase Dashboard:`);
      console.log(`   CREATE EXTENSION IF NOT EXISTS ${ext.name};`);
    }
  }
}

async function checkMissingFunctions() {
  console.log('\n📋 Checking Missing RPC Functions...\n');

  const requiredFunctions = [
    { name: 'fn_get_player_profile', migration: '0005_incident_moderation.sql or 20251206082614_fix_incidents_functions.sql' },
    { name: 'fn_get_user_incidents', migration: '0014_user_dashboard_functions.sql' },
    { name: 'fn_get_user_flags', migration: '0014_user_dashboard_functions.sql' },
    { name: 'fn_get_user_dashboard_stats', migration: '0014_user_dashboard_functions.sql' },
    { name: 'fn_get_linked_players', migration: '0014_user_dashboard_functions.sql' }
  ];

  const missingFunctions: string[] = [];

  for (const func of requiredFunctions) {
    // Try to call the function with dummy parameters
    try {
      const testParams: any = {};
      
      if (func.name === 'fn_get_player_profile') {
        testParams.game_slug = 'test';
        testParams.identifier = 'test';
      } else if (func.name.includes('user')) {
        testParams.target_user_id = '00000000-0000-0000-0000-000000000000';
        if (func.name.includes('incidents') || func.name.includes('flags')) {
          testParams.status_filter = 'all';
          testParams.limit_count = 1;
          testParams.offset_count = 0;
        }
      }

      const { error } = await supabase.rpc(func.name as any, testParams);
      
      if (error && error.message.includes('could not find') || error?.message.includes('does not exist')) {
        console.log(`❌ ${func.name}: MISSING`);
        console.log(`   Required migration: ${func.migration}`);
        missingFunctions.push(func.migration);
      } else {
        console.log(`✅ ${func.name}: EXISTS`);
      }
    } catch (err) {
      console.log(`❌ ${func.name}: MISSING`);
      console.log(`   Required migration: ${func.migration}`);
      missingFunctions.push(func.migration);
    }
  }

  return [...new Set(missingFunctions)]; // Remove duplicates
}

async function provideMigrationInstructions(missingMigrations: string[]) {
  if (missingMigrations.length === 0) {
    console.log('\n✨ All required functions are present!\n');
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log('📝 MIGRATION INSTRUCTIONS');
  console.log('='.repeat(80) + '\n');

  console.log('The following migrations need to be applied:\n');
  
  missingMigrations.forEach(migration => {
    const filePath = path.join(process.cwd(), 'supabase', 'migrations', migration);
    if (fs.existsSync(filePath)) {
      console.log(`  ✓ ${migration}`);
      console.log(`    Path: supabase/migrations/${migration}`);
    } else {
      console.log(`  ⚠️  ${migration} (file not found)`);
    }
  });

  console.log('\n' + '-'.repeat(80));
  console.log('HOW TO APPLY:');
  console.log('-'.repeat(80) + '\n');

  console.log('Option 1: Supabase CLI (Recommended)\n');
  console.log('  1. Link your project:');
  console.log('     npx supabase link --project-ref <your-project-ref>\n');
  console.log('  2. Push migrations:');
  console.log('     npx supabase db push\n');

  console.log('Option 2: Manual via Dashboard\n');
  console.log('  1. Go to: https://supabase.com/dashboard');
  console.log('  2. Select your project');
  console.log('  3. Navigate to: SQL Editor');
  console.log('  4. For each migration file:');
  console.log('     - Open the file in your editor');
  console.log('     - Copy the entire contents');
  console.log('     - Paste into SQL Editor');
  console.log('     - Click "Run"\n');

  console.log('Files to apply in order:');
  missingMigrations.forEach((migration, i) => {
    console.log(`  ${i + 1}. supabase/migrations/${migration}`);
  });
  console.log('');
}

async function main() {
  console.log('🚀 PRODUCTION DATABASE MIGRATION TOOL\n');
  console.log(`Database: ${supabaseUrl}\n`);
  console.log('='.repeat(80) + '\n');

  // Step 1: Enable extensions
  await enableExtensions();

  // Step 2: Check missing functions
  const missingMigrations = await checkMissingFunctions();

  // Step 3: Provide instructions
  await provideMigrationInstructions(missingMigrations);

  console.log('='.repeat(80));
  console.log('✅ Analysis complete!');
  console.log('='.repeat(80) + '\n');
}

main().catch(console.error);
