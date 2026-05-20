'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Plus, Users, Trophy, Clock, ArrowLeft, X, ChevronRight, Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type Battle = {
  id: string
  title: string
  description: string
  created_by: string
  match_id: string
  bet_amount: number
  max_participants: number
  current_participants: number
  pot_total: number
  status: string
  battle_type: string
  closes_at: string
  created_at: string
  creator_username?: string
  creator_avatar?: string
  match_home?: string
  match_away?: string
  my_prediction?: string
}

type Match = {
  id: string
  home_team: string
  away_team: string
  home_team_code: string
  away_team_code: string
  match_date: string
  group_name: string | null
  stage: string
}

function FlagImg({ code, size = 24 }: { code: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/40x30/${(code || 'un').toLowerCase()}.png`}
      alt={code} width={size} height={Math.round(size * 0.75)}
      className="rounded-sm object-cover"
    />
  )
}

function formatDate(dateStr: string, locale = 'es') {
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/New_York'
  })
}

function CreateBattleModal({ onClose, onCreated, userId }: { onClose: () => void; onCreated: () => void; userId: string }) {
  const t = useTranslations('battles')
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [prediction, setPrediction] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('matches').select('*')
      .in('status', ['scheduled', 'live'])
      .order('match_date', { ascending: true })
      .limit(30)
      .then(({ data }) => setMatches(data || []))
  }, [])

  async function handleCreate() {
    if (!selectedMatch || !prediction || !amount) {
      setError(t('chooseMatch'))
      return
    }
    const amt = parseFloat(amount)
    if (amt < 1) { setError('El mínimo es $1'); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/battles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        userId,
        matchId: selectedMatch.id,
        prediction,
        amount: amt,
        title: `${selectedMatch.home_team} vs ${selectedMatch.away_team}`,
        description: `${prediction} por $${amt}`,
      }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-[#1A1A2E] w-full md:max-w-lg md:rounded-2xl rounded-t-2xl border border-[#2A2A4A] max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#2A2A4A] shrink-0">
          <span className="font-bebas text-2xl text-[#FFD700] tracking-wider">{t('newBattle')}</span>
          <button onClick={onClose} className="text-white hover:text-[#FFD700]"><X size={22} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-base">{error}</div>}

          {/* Elegir partido */}
          <div>
            <p className="text-base font-bold text-white mb-2">{t('chooseMatch')}</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {matches.map(m => (
                <button key={m.id} onClick={() => { setSelectedMatch(m); setPrediction('') }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                    selectedMatch?.id === m.id
                      ? 'border-[#FFD700] bg-[#FFD700]/10'
                      : 'border-[#2A2A4A] bg-[#0D0D0D] hover:border-[#FFD700]/40'
                  }`}>
                  <span className="text-base font-bold text-white">{m.home_team} vs {m.away_team}</span>
                  <span className="text-sm text-[#86EFAC]">{formatDate(m.match_date)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Elegir equipo */}
          {selectedMatch && (
            <div>
              <p className="text-base font-bold text-white mb-2">{t('chooseTeam')}</p>
              <div className="flex gap-3">
                <button onClick={() => setPrediction(selectedMatch.home_team)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-base font-bold transition-all ${
                    prediction === selectedMatch.home_team
                      ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                      : 'border-[#2A2A4A] bg-[#0D0D0D] text-white hover:border-[#FFD700]/40'
                  }`}>
                  <FlagImg code={selectedMatch.home_team_code} size={24} />
                  {selectedMatch.home_team}
                </button>
                <button onClick={() => setPrediction('empate')}
                  className={`px-4 py-3 rounded-xl border text-base font-bold transition-all ${
                    prediction === 'empate'
                      ? 'border-[#86EFAC] bg-[#86EFAC]/10 text-[#86EFAC]'
                      : 'border-[#2A2A4A] bg-[#0D0D0D] text-white hover:border-[#86EFAC]/40'
                  }`}>
                  {t('draw')}
                </button>
                <button onClick={() => setPrediction(selectedMatch.away_team)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-base font-bold transition-all ${
                    prediction === selectedMatch.away_team
                      ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                      : 'border-[#2A2A4A] bg-[#0D0D0D] text-white hover:border-[#FFD700]/40'
                  }`}>
                  {selectedMatch.away_team}
                  <FlagImg code={selectedMatch.away_team_code} size={24} />
                </button>
              </div>
            </div>
          )}

          {/* Monto */}
          {prediction && (
            <div>
              <p className="text-base font-bold text-white mb-2">{t('amount')}</p>
              <div className="flex gap-2 mb-2">
                {[5, 10, 20, 50].map(v => (
                  <button key={v} onClick={() => setAmount(String(v))}
                    className={`flex-1 py-2 rounded-xl border text-base font-bold transition-all ${
                      amount === String(v)
                        ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                        : 'border-[#2A2A4A] bg-[#0D0D0D] text-white hover:border-[#FFD700]/40'
                    }`}>
                    ${v}
                  </button>
                ))}
              </div>
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder={t('amount')}
                className="w-full bg-[#0D0D0D] border border-[#2A2A4A] rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#2A2A4A] shrink-0">
          <button onClick={handleCreate} disabled={loading || !selectedMatch || !prediction || !amount}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-3 rounded-xl text-base disabled:opacity-40 transition-all">
            {loading ? '...' : `${t('openBattle')}${amount || '0'}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function JoinModal({ battle, onClose, onJoined, userId }: { battle: Battle; onClose: () => void; onJoined: () => void; userId: string }) {
  const t = useTranslations('battles')
  const [prediction, setPrediction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [match, setMatch] = useState<Match | null>(null)

  useEffect(() => {
    if (!battle.match_id) return
    const supabase = createClient()
    supabase.from('matches').select('*').eq('id', battle.match_id).single()
      .then(({ data }) => setMatch(data))
  }, [battle.match_id])

  async function handleJoin() {
    if (!prediction) { setError('Elegí un equipo'); return }
    setLoading(true)
    const res = await fetch('/api/battles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', userId, battleId: battle.id, prediction, amount: battle.bet_amount }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    onJoined()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-[#1A1A2E] w-full md:max-w-lg md:rounded-2xl rounded-t-2xl border border-[#2A2A4A] max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#2A2A4A] shrink-0">
          <span className="font-bebas text-2xl text-[#FFD700] tracking-wider">{t('enter')}</span>
          <button onClick={onClose} className="text-white hover:text-[#FFD700]"><X size={22} /></button>
        </div>
        <div className="p-4 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-base">{error}</div>}

          <div className="bg-[#0D0D0D] rounded-xl p-4">
            <p className="text-base font-bold text-white mb-1">{battle.title}</p>
            <p className="text-base text-[#FFD700] font-bold">{t('amount')}: ${battle.bet_amount}</p>
            <p className="text-sm text-[#86EFAC]">{t('pot')}: ${battle.pot_total}</p>
          </div>

          {match && (
            <div>
              <p className="text-base font-bold text-white mb-2">{t('chooseTeam')}</p>
              <div className="flex gap-3">
                <button onClick={() => setPrediction(match.home_team)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-base font-bold transition-all ${
                    prediction === match.home_team ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]' : 'border-[#2A2A4A] bg-[#0D0D0D] text-white hover:border-[#FFD700]/40'
                  }`}>
                  <FlagImg code={match.home_team_code} size={24} />{match.home_team}
                </button>
                <button onClick={() => setPrediction('empate')}
                  className={`px-4 py-3 rounded-xl border text-base font-bold transition-all ${
                    prediction === 'empate' ? 'border-[#86EFAC] bg-[#86EFAC]/10 text-[#86EFAC]' : 'border-[#2A2A4A] bg-[#0D0D0D] text-white'
                  }`}>
                  {t('draw')}
                </button>
                <button onClick={() => setPrediction(match.away_team)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-base font-bold transition-all ${
                    prediction === match.away_team ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]' : 'border-[#2A2A4A] bg-[#0D0D0D] text-white hover:border-[#FFD700]/40'
                  }`}>
                  {match.away_team}<FlagImg code={match.away_team_code} size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-[#2A2A4A] shrink-0">
          <button onClick={handleJoin} disabled={loading || !prediction}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-3 rounded-xl text-base disabled:opacity-40">
            {loading ? 'Uniéndose...' : `⚡ Apostar $${battle.bet_amount} por ${prediction || '...'}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function BattleCard({ battle, userId, onRefresh }: { battle: Battle; userId: string; onRefresh: () => void }) {
  const t = useTranslations('battles')
  const [showJoin, setShowJoin] = useState(false)
  const isCreator = battle.created_by === userId
  const isFull = battle.status !== 'open'

  return (
    <>
      <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-4 mb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {battle.status === 'open' && (
                <span className="flex items-center gap-1 text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />ABIERTA
                </span>
              )}
              {battle.status === 'active' && (
                <span className="text-xs font-bold text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-0.5 rounded-full">EN CURSO</span>
              )}
              {battle.status === 'closed' && (
                <span className="text-xs font-bold text-gray-400 bg-gray-400/10 border border-gray-400/20 px-2 py-0.5 rounded-full">CERRADA</span>
              )}
              {isCreator && (
                <span className="text-xs font-bold text-[#A855F7] bg-[#A855F7]/10 border border-[#A855F7]/20 px-2 py-0.5 rounded-full">{t('yourBattle')}</span>
              )}
            </div>
            <p className="text-lg font-bold text-white">{battle.title}</p>
            {battle.description && <p className="text-sm text-[#86EFAC] font-semibold mt-0.5">{battle.description}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#0D0D0D] rounded-xl p-3 text-center">
            <p className="text-xl font-bebas text-[#FFD700]">${battle.bet_amount}</p>
            <p className="text-xs font-semibold text-white">{t('perSide')}</p>
          </div>
          <div className="bg-[#0D0D0D] rounded-xl p-3 text-center">
            <p className="text-xl font-bebas text-[#22C55E]">${battle.pot_total}</p>
            <p className="text-xs font-semibold text-white">{t('pot')}</p>
          </div>
          <div className="bg-[#0D0D0D] rounded-xl p-3 text-center">
            <p className="text-xl font-bebas text-white">{battle.current_participants}</p>
            <p className="text-xs font-semibold text-white">{t('players')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-sm text-white font-semibold">
            <Clock size={14} className="text-[#86EFAC]" />
            {formatDate(battle.created_at)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text = `⚡ ¡BATALLA ABIERTA en Che-Bacano!\n\n🏆 ${battle.title}\n💰 Apostá $${battle.bet_amount} — ${battle.description}\n💵 Pozo actual: $${battle.pot_total}\n\n¿Te sumás? Entrá acá 👇\nhttps://che-bacano.com/battles`
                const url = `https://wa.me/?text=${encodeURIComponent(text)}`
                window.open(url, '_blank')
              }}
              className="flex items-center gap-1 bg-[#25D366] text-white font-bold px-3 py-2 rounded-xl text-sm transition-all hover:opacity-90">
              <Share2 size={14} />
              WhatsApp
            </button>
            {battle.status === 'open' && !isCreator && (
              <button onClick={() => setShowJoin(true)}
                className="flex items-center gap-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold px-4 py-2 rounded-xl text-base transition-all hover:opacity-90">
                <Zap size={16} />
                {t('enter')}
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showJoin && (
        <JoinModal
          battle={battle}
          userId={userId}
          onClose={() => setShowJoin(false)}
          onJoined={onRefresh}
        />
      )}
    </>
  )
}

export default function BattlesPage() {
  const t = useTranslations('battles')
  const tc = useTranslations('common')
  const [userId, setUserId] = useState('')
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [tab, setTab] = useState<'todas' | 'mis'>('todas')

  async function loadBattles(uid: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('battles')
      .select('*')
      .order('created_at', { ascending: false })
    setBattles(data || [])
    setLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      loadBattles(user.id)
    })
  }, [])

  const todasBattles = battles.filter(b => b.status === 'open')
  const misBattles = battles.filter(b => b.created_by === userId)

  const btnBase = 'px-4 py-2 rounded-xl text-base font-bold transition-all'
  const btnActive = 'bg-[#FFD700] text-black'
  const btnInactive = 'bg-[#1A1A2E] text-white border border-[#2A2A4A] hover:border-[#FFD700]'

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto md:max-w-4xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-base font-bold text-white hover:text-[#FFD700] transition-colors mb-4">
        <ArrowLeft size={20} />{tc('back')}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bebas text-5xl text-white tracking-wider">{t('title')}</h1>
          <p className="text-sm font-semibold text-[#86EFAC]">{t('subtitle')}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold px-4 py-3 rounded-xl text-base hover:opacity-90 transition-all">
          <Plus size={20} />
          {t('new')}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button className={`${btnBase} ${tab === 'todas' ? btnActive : btnInactive}`} onClick={() => setTab('todas')}>
          {t('open')} ({todasBattles.length})
        </button>
        <button className={`${btnBase} ${tab === 'mis' ? btnActive : btnInactive}`} onClick={() => setTab('mis')}>
          {t('mine')} ({misBattles.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-white">{tc('loading')}</div>
      ) : tab === 'todas' ? (
        todasBattles.length === 0 ? (
          <div className="text-center py-16">
            <Zap size={40} className="text-[#FFD700] mx-auto mb-3" />
            <p className="text-xl font-bold text-white mb-2">{t('noBattles')}</p>
            <p className="text-base text-white mb-4">{t('beFirst')}</p>
            <button onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold px-6 py-3 rounded-xl text-base">
              + {t('newBattle')}
            </button>
          </div>
        ) : (
          todasBattles.map(b => <BattleCard key={b.id} battle={b} userId={userId} onRefresh={() => loadBattles(userId)} />)
        )
      ) : (
        misBattles.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={40} className="text-[#FFD700] mx-auto mb-3" />
            <p className="text-xl font-bold text-white mb-2">{t('noMyBattles')}</p>
            <button onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold px-6 py-3 rounded-xl text-base mt-2">
              + {t('newBattle')}
            </button>
          </div>
        ) : (
          misBattles.map(b => <BattleCard key={b.id} battle={b} userId={userId} onRefresh={() => loadBattles(userId)} />)
        )
      )}

      {showCreate && (
        <CreateBattleModal
          userId={userId}
          onClose={() => setShowCreate(false)}
          onCreated={() => loadBattles(userId)}
        />
      )}
    </div>
  )
}
