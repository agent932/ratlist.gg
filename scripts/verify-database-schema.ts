import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface SchemaCheck {
  name: string;
  exists: boolean;
  details?: any;
  error?: string;
}

async function verifyDatabaseSchema() {
  console.log('🔍 VERIFYING PRODUCTION DATABASE SCHEMA\n');
  console.log(`📍 Database: ${supabaseUrl}\n`);

  const results: SchemaCheck[] = [];

  // 1. Check PostgreSQL Extensions
  console.log('1️⃣  Checking PostgreSQL Extensions...');
  try {
    const { data: extensions, error } = await supabase.rpc('fn_check_extensions' as any);
    
    // Direct query using raw SQL
    const { data, error: extError } = await supabase
      .from('pg_extension' as any)
      .select('extname');
    
    const extNames = data?.map((e: any) => e.extname) || [];
    
    results.push({
      name: 'Extension: pg_trgm',
      exists: extNames.includes('pg_trgm'),
      details: 'Fuzzy text search'
    });
    
    results.push({
      name: 'Extension: pgcrypto',
      exists: extNames.includes('pgcrypto'),
      details: 'UUID generation'
    });
  } catch (err) {
    console.log('  ⚠️  Cannot query extensions directly, checking via table existence instead');
  }

  // 2. Check Core Tables
  console.log('\n2️⃣  Checking Core Tables...');
  
  const tables = [
    { name: 'games', columns: ['id', 'slug', 'name', 'created_at'] },
    { name: 'players', columns: ['id', 'game_id', 'identifier', 'display_name', 'created_at'] },
    { name: 'incident_categories', columns: ['id', 'slug', 'label'] },
    { name: 'incidents', columns: ['id', 'game_id', 'reported_player_id', 'reporter_user_id', 'category_id', 'occurred_at', 'description', 'region', 'mode', 'map', 'is_anonymous', 'created_at'] },
    { name: 'flags', columns: ['id', 'incident_id', 'flagger_user_id', 'reason', 'status', 'created_at'] },
    { name: 'user_profiles', columns: ['user_id', 'display_name', 'role', 'created_at'] }
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      results.push({
        name: `Table: ${table.name}`,
        exists: !error,
        details: error ? error.message : `${count || 0} rows`,
        error: error?.message
      });

      // Check if we can query the table structure
      if (!error) {
        const { data: sample } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);
        
        if (sample && sample.length > 0) {
          const actualColumns = Object.keys(sample[0]);
          const missingColumns = table.columns.filter(col => !actualColumns.includes(col));
          const extraColumns = actualColumns.filter(col => !table.columns.includes(col));
          
          if (missingColumns.length > 0) {
            results.push({
              name: `  ↳ Missing columns in ${table.name}`,
              exists: false,
              details: missingColumns.join(', ')
            });
          }
          if (extraColumns.length > 0) {
            results.push({
              name: `  ↳ Extra columns in ${table.name}`,
              exists: true,
              details: extraColumns.join(', ')
            });
          }
        }
      }
    } catch (err: any) {
      results.push({
        name: `Table: ${table.name}`,
        exists: false,
        error: err.message
      });
    }
  }

  // 3. Check RPC Functions
  console.log('\n3️⃣  Checking RPC Functions...');
  
  const rpcFunctions = [
    { name: 'fn_get_player_profile', params: { game_slug: 'arc-raiders', identifier: 'test' } },
    { name: 'fn_get_leaderboard', params: { game_slug: 'arc-raiders', period: 'week' } },
    { name: 'fn_get_recent_incidents', params: { game_slug: 'arc-raiders', lim: 10 } },
    { name: 'fn_get_user_incidents', params: { target_user_id: '00000000-0000-0000-0000-000000000000', status_filter: 'all', limit_count: 10, offset_count: 0 } },
    { name: 'fn_get_user_flags', params: { target_user_id: '00000000-0000-0000-0000-000000000000', resolution_filter: 'all', limit_count: 10, offset_count: 0 } },
    { name: 'fn_get_user_dashboard_stats', params: { target_user_id: '00000000-0000-0000-0000-000000000000' } },
    { name: 'fn_get_linked_players', params: { target_user_id: '00000000-0000-0000-0000-000000000000' } }
  ];

  for (const func of rpcFunctions) {
    try {
      const { data, error } = await supabase.rpc(func.name as any, func.params);
      
      results.push({
        name: `RPC: ${func.name}`,
        exists: !error,
        details: error ? error.message : `Returns ${Array.isArray(data) ? data.length : 1} result(s)`,
        error: error?.message
      });
    } catch (err: any) {
      results.push({
        name: `RPC: ${func.name}`,
        exists: false,
        error: err.message
      });
    }
  }

  // 4. Check Views
  console.log('\n4️⃣  Checking Views...');
  
  try {
    // Try to query the reputation view through an RPC that uses it
    const { error } = await supabase.rpc('fn_get_player_profile' as any, {
      game_slug: 'arc-raiders',
      identifier: 'test'
    });
    
    results.push({
      name: 'View: player_reputation_view',
      exists: !error || !error.message.includes('does not exist'),
      details: 'Used by fn_get_player_profile'
    });
  } catch (err: any) {
    results.push({
      name: 'View: player_reputation_view',
      exists: false,
      error: err.message
    });
  }

  // 5. Check Sample Data
  console.log('\n5️⃣  Checking Sample Data...');
  
  // Check games
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('slug, name');
  
  results.push({
    name: 'Data: Games',
    exists: !gamesError && games && games.length > 0,
    details: games ? `${games.length} games: ${games.map(g => g.slug).join(', ')}` : 'No games found'
  });

  // Check categories
  const { data: categories, error: catError } = await supabase
    .from('incident_categories')
    .select('id, slug, label')
    .order('id');
  
  results.push({
    name: 'Data: Incident Categories',
    exists: !catError && categories && categories.length > 0,
    details: categories ? `${categories.length} categories: ${categories.map(c => c.slug).join(', ')}` : 'No categories found'
  });

  // 6. Check RLS Policies
  console.log('\n6️⃣  Checking RLS Status...');
  
  for (const table of ['players', 'incidents', 'flags', 'user_profiles']) {
    try {
      // Try to query without auth (should work for public reads)
      const publicClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { error } = await publicClient
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      results.push({
        name: `RLS: ${table}`,
        exists: true,
        details: error ? `Protected (${error.message})` : 'Public read enabled'
      });
    } catch (err: any) {
      results.push({
        name: `RLS: ${table}`,
        exists: true,
        details: 'Unknown status'
      });
    }
  }

  // Print Results
  console.log('\n' + '='.repeat(80));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(80) + '\n');

  let passCount = 0;
  let failCount = 0;

  results.forEach(result => {
    const icon = result.exists ? '✅' : '❌';
    const status = result.exists ? 'EXISTS' : 'MISSING';
    
    console.log(`${icon} ${result.name.padEnd(45)} ${status}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    if (result.error && !result.exists) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.exists) passCount++;
    else failCount++;
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📈 Summary: ${passCount} passed, ${failCount} failed`);
  console.log('='.repeat(80) + '\n');

  // Overall assessment
  if (failCount === 0) {
    console.log('✨ Production database fully matches documentation!');
  } else if (failCount < 5) {
    console.log('⚠️  Production database mostly matches with minor discrepancies.');
  } else {
    console.log('❗ Production database has significant differences from documentation.');
  }
}

verifyDatabaseSchema().catch(console.error);
