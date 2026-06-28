import { supabase } from './supabaseClient'

// ---------- Ledger ----------
export async function fetchLedgerTransactions(currency) {
  let query = supabase.from('ledger_transactions').select('*').order('txn_date', { ascending: true })
  if (currency) query = query.eq('currency', currency)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function addLedgerTransaction(payload) {
  const { data, error } = await supabase.from('ledger_transactions').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateLedgerTransaction(id, payload) {
  const { data, error } = await supabase
    .from('ledger_transactions')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLedgerTransaction(id) {
  const { error } = await supabase.from('ledger_transactions').delete().eq('id', id)
  if (error) throw error
}

// ---------- Holdings (stock / etf / crypto) ----------
export async function fetchHoldingsTransactions(assetType) {
  let query = supabase
    .from('holdings_transactions')
    .select('*')
    .order('txn_date', { ascending: true })
  if (assetType) query = query.eq('asset_type', assetType)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchAllHoldingsTransactions() {
  const { data, error } = await supabase
    .from('holdings_transactions')
    .select('*')
    .order('txn_date', { ascending: true })
  if (error) throw error
  return data
}

export async function addHoldingsTransaction(payload) {
  const { data, error } = await supabase.from('holdings_transactions').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateHoldingsTransaction(id, payload) {
  const { data, error } = await supabase
    .from('holdings_transactions')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteHoldingsTransaction(id) {
  const { error } = await supabase.from('holdings_transactions').delete().eq('id', id)
  if (error) throw error
}

// ---------- Watchlist ----------
export async function fetchWatchlist(assetType) {
  let query = supabase.from('watchlist').select('*').order('created_at', { ascending: false })
  if (assetType) query = query.eq('asset_type', assetType)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function addWatchlistItem(payload) {
  const { data, error } = await supabase.from('watchlist').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function deleteWatchlistItem(id) {
  const { error } = await supabase.from('watchlist').delete().eq('id', id)
  if (error) throw error
}

// ---------- Notes ----------
export async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addNote(payload) {
  const { data, error } = await supabase.from('notes').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateNote(id, payload) {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}

// ---------- Profile ----------
export async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertProfile(userId, payload) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...payload })
    .select()
    .single()
  if (error) throw error
  return data
}
