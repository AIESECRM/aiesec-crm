'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, DollarSign, Target, Activity, ArrowUpRight, ArrowDownRight,
    Users, Zap, Award, ChevronDown, FileText, Phone, Handshake, CheckCircle2
} from 'lucide-react';
import './ExecutiveDashboard.css';

const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `₺${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `₺${(val / 1_000).toFixed(0)}K`;
    return `₺${val}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
        <div className="exec-tooltip">
            <div className="exec-tooltip__label">{label}</div>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="exec-tooltip__row">
                    <span className="exec-tooltip__dot" style={{ background: entry.color }} />
                    <span className="exec-tooltip__name">{entry.name}</span>
                    <span className="exec-tooltip__value">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function ExecutiveDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chapter, setChapter] = useState('');

    const fetchData = useCallback((ch: string) => {
        setLoading(true);
        const url = ch ? `/api/dashboard?chapter=${ch}` : '/api/dashboard';
        fetch(url)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(chapter); }, [chapter, fetchData]);

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setChapter(e.target.value);
    };

    if (loading && !data) return (
        <div className="exec-loading">
            <div className="exec-loading__spinner" />
            <div className="exec-loading__text">Dashboard yükleniyor...</div>
        </div>
    );

    if (!data) return <div className="exec-loading">Veri yüklenemedi.</div>;

    const { kpis, funnel, chapterPerformance, pipeline, productMix, weeklyTrend, processQuality } = data;
    const isFiltered = !!chapter;
    const scopeLabel = isFiltered
        ? chapterPerformance[0]?.label || chapter
        : 'Türkiye Geneli';

    // Top 5 by conversion
    const topChapters = [...chapterPerformance]
        .filter(c => c.companies > 0)
        .sort((a, b) => b.conversionRate - a.conversionRate)
        .slice(0, 5);

    // Max value for funnel bar scaling
    const funnelMax = Math.max(...funnel.map((f: any) => f.value), 1);

    return (
        <div className={`exec ${loading ? 'exec--loading' : ''}`}>
            {/* Header */}
            <div className="exec__header">
                <div className="exec__header-left">
                    <div className="exec__header-badge">MCVP DASHBOARD</div>
                    <h1 className="exec__header-title">{scopeLabel}</h1>
                    <p className="exec__header-subtitle">
                        {kpis.activeUsers} aktif üye · {isFiltered ? '1 şube' : `${chapterPerformance.length} şube`}
                    </p>
                </div>
                <div className="exec__header-right">
                    <div className="exec__filter-wrap">
                        <select
                            className="exec__chapter-filter"
                            value={chapter}
                            onChange={handleChapterChange}
                        >
                            <option value="">🇹🇷 Tüm Şubeler</option>
                            {(data.chapterPerformance?.length > 0 ? chapterPerformance : []).map((ch: any) => (
                                <option key={ch.chapter} value={ch.chapter}>{ch.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="exec__filter-icon" />
                    </div>
                </div>
            </div>

            {/* KPI Row — 4 cards, compact */}
            <div className="exec__kpi-grid">
                <div className="exec__kpi exec__kpi--purple">
                    <div className="exec__kpi-top">
                        <div className="exec__kpi-icon"><FileText /></div>
                    </div>
                    <div className="exec__kpi-value">{kpis.totalOffers}</div>
                    <div className="exec__kpi-label">Toplam Teklif</div>
                    <div className="exec__kpi-sub">{formatCurrency(kpis.totalOfferValue)} toplam değer</div>
                </div>

                <div className="exec__kpi exec__kpi--green">
                    <div className="exec__kpi-top">
                        <div className="exec__kpi-icon"><Target /></div>
                    </div>
                    <div className="exec__kpi-value">%{kpis.conversionRate}</div>
                    <div className="exec__kpi-label">Dönüşüm Oranı</div>
                    <div className="exec__kpi-sub">{kpis.positiveCompanies}/{kpis.totalCompanies} şirket</div>
                </div>

                <div className="exec__kpi exec__kpi--blue">
                    <div className="exec__kpi-top">
                        <div className="exec__kpi-icon"><Activity /></div>
                        {kpis.activityTrend !== 0 && (
                            <div className={`exec__kpi-trend ${kpis.activityTrend > 0 ? 'exec__kpi-trend--up' : 'exec__kpi-trend--down'}`}>
                                {kpis.activityTrend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(kpis.activityTrend)}%
                            </div>
                        )}
                    </div>
                    <div className="exec__kpi-value">{kpis.thisWeekActivities}</div>
                    <div className="exec__kpi-label">Haftalık Aktivite</div>
                    <div className="exec__kpi-sub">{kpis.totalActivities} toplam</div>
                </div>

                <div className="exec__kpi exec__kpi--orange">
                    <div className="exec__kpi-top">
                        <div className="exec__kpi-icon"><TrendingUp /></div>
                    </div>
                    <div className="exec__kpi-value">{kpis.activePipeline}</div>
                    <div className="exec__kpi-label">Aktif Pipeline</div>
                    <div className="exec__kpi-sub">pozitif + toplantı planlandı</div>
                </div>
            </div>

            {/* Row 2: Funnel + Weekly Trend */}
            <div className="exec__row2">
                {/* Conversion Funnel */}
                <div className="exec__card exec__card--funnel">
                    <h3 className="exec__card-title">
                        <Zap className="exec__card-icon" />
                        Dönüşüm Hunisi
                    </h3>
                    <div className="exec__funnel">
                        {funnel.map((f: any, i: number) => {
                            const pct = Math.round((f.value / funnelMax) * 100);
                            const convPct = i > 0 && funnel[i - 1].value > 0
                                ? Math.round((f.value / funnel[i - 1].value) * 100)
                                : null;

                            return (
                                <div key={f.stage} className="exec__funnel-stage">
                                    <div className="exec__funnel-info">
                                        <div className="exec__funnel-label-row">
                                            <span className="exec__funnel-label">{f.label}</span>
                                            <span className="exec__funnel-count">{f.value}</span>
                                        </div>
                                        <div className="exec__funnel-bar-bg">
                                            <div
                                                className="exec__funnel-bar"
                                                style={{ width: `${pct}%`, background: f.color }}
                                            />
                                        </div>
                                    </div>
                                    {convPct !== null && (
                                        <div className="exec__funnel-conv">
                                            <span className="exec__funnel-conv-arrow">→</span>
                                            <span className="exec__funnel-conv-pct">%{convPct}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Weekly Trend - Bar chart */}
                <div className="exec__card exec__card--trend">
                    <div className="exec__card-header-row">
                        <h3 className="exec__card-title">
                            <Activity className="exec__card-icon" />
                            Haftalık Aktivite
                        </h3>
                        <span className="exec__card-badge">{kpis.totalActivities} toplam</span>
                    </div>
                    <div className="exec__chart" style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={16} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#858585' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#858585' }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                <Bar dataKey="coldCalls" name="Arama" fill="#037EF3" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="meetings" name="Toplantı" fill="#22C55E" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="emails" name="Email" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="exec__legend">
                        <span className="exec__legend-item"><span className="exec__legend-dot" style={{ background: '#037EF3' }} />Arama</span>
                        <span className="exec__legend-item"><span className="exec__legend-dot" style={{ background: '#22C55E' }} />Toplantı</span>
                        <span className="exec__legend-item"><span className="exec__legend-dot" style={{ background: '#F59E0B' }} />Email</span>
                    </div>
                </div>
            </div>

            {/* Row 3: Pipeline + Product Mix + Process Quality */}
            <div className="exec__row3">
                {/* Pipeline Donut */}
                <div className="exec__card exec__card--pipeline">
                    <h3 className="exec__card-title">
                        <Target className="exec__card-icon" />
                        Pipeline Dağılımı
                    </h3>
                    <div className="exec__chart" style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pipeline}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="count"
                                    nameKey="label"
                                    strokeWidth={0}
                                >
                                    {pipeline.map((entry: any, i: number) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="exec__pipeline-legend">
                        {pipeline.map((p: any) => (
                            <div key={p.status} className="exec__pipeline-row">
                                <span className="exec__pipeline-dot" style={{ background: p.color }} />
                                <span className="exec__pipeline-label">{p.label}</span>
                                <span className="exec__pipeline-count">{p.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Mix */}
                <div className="exec__card exec__card--products">
                    <h3 className="exec__card-title">
                        <DollarSign className="exec__card-icon" />
                        Ürün Performansı
                    </h3>
                    <div className="exec__products">
                        {productMix.map((pm: any) => {
                            const totalVal = productMix.reduce((s: number, p: any) => s + p.value, 0);
                            const pct = totalVal > 0 ? Math.round((pm.value / totalVal) * 100) : 0;
                            return (
                                <div key={pm.product} className="exec__product">
                                    <div className="exec__product-top">
                                        <span className="exec__product-name">
                                            <span className="exec__product-dot" style={{ background: pm.color }} />
                                            {pm.label}
                                        </span>
                                        <span className="exec__product-val">{formatCurrency(pm.value)}</span>
                                    </div>
                                    <div className="exec__product-bar-bg">
                                        <div className="exec__product-bar" style={{ width: `${pct}%`, background: pm.color }} />
                                    </div>
                                    <div className="exec__product-bottom">
                                        <span>{pm.count} teklif</span>
                                        <span>%{pct}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Process Quality */}
                <div className="exec__card exec__card--quality">
                    <h3 className="exec__card-title">
                        <Award className="exec__card-icon" />
                        Süreç Kalitesi
                    </h3>
                    <div className="exec__quality">
                        <QualityItem icon={<Phone size={16} />} label="Dönüşüm / Arama" value={processQuality.avgCallsPerConversion} desc="pozitif sonuç başına arama" color="#037EF3" />
                        <QualityItem icon={<Handshake size={16} />} label="Toplantı → Teklif" value={`%${processQuality.meetingToOfferRatio}`} desc="toplantılardan teklif oranı" color="#22C55E" />
                        <QualityItem icon={<CheckCircle2 size={16} />} label="Yanıt Oranı" value={`%${processQuality.responseRate}`} desc="cevap veren şirketler" color="#F59E0B" />
                        <QualityItem icon={<Zap size={16} />} label="Ort. Etkileşim" value={processQuality.avgActivitiesPerCompany} desc="şirket başına aktivite" color="#8B5CF6" />
                    </div>
                </div>
            </div>

            {/* Row 4: Chapter Performance Table */}
            {!isFiltered && (
                <div className="exec__card exec__card--table">
                    <div className="exec__card-header-row">
                        <h3 className="exec__card-title">
                            <Users className="exec__card-icon" />
                            Şube Performans Sıralaması
                        </h3>
                        <span className="exec__card-badge">{chapterPerformance.length} şube</span>
                    </div>
                    <div className="exec__table-wrap">
                        <table className="exec__table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Şube</th>
                                    <th>Şirket</th>
                                    <th>Arama</th>
                                    <th>Toplantı</th>
                                    <th>Teklif</th>
                                    <th>Değer</th>
                                    <th>Dönüşüm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chapterPerformance.map((ch: any, i: number) => (
                                    <tr key={ch.chapter} className="exec__table-row" onClick={() => setChapter(ch.chapter)}>
                                        <td className="exec__table-rank">
                                            {i < 3 ? (
                                                <span className={`exec__table-medal exec__table-medal--${i + 1}`}>{i + 1}</span>
                                            ) : <span className="exec__table-num">{i + 1}</span>}
                                        </td>
                                        <td>
                                            <span className="exec__table-ch">{ch.label}</span>
                                            <span className="exec__table-users">{ch.activeUsers} üye</span>
                                        </td>
                                        <td>{ch.companies}</td>
                                        <td>{ch.coldCalls}</td>
                                        <td>{ch.meetings}</td>
                                        <td>{ch.offers}</td>
                                        <td className="exec__table-val">{formatCurrency(ch.offerValue)}</td>
                                        <td>
                                            <div className="exec__conv">
                                                <div className="exec__conv-bar-bg">
                                                    <div className="exec__conv-bar" style={{
                                                        width: `${ch.conversionRate}%`,
                                                        background: ch.conversionRate >= 40 ? '#22C55E' : ch.conversionRate >= 20 ? '#F59E0B' : '#EF4444'
                                                    }} />
                                                </div>
                                                <span className="exec__conv-pct">%{ch.conversionRate}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* When filtered: top chapters mini */}
            {!isFiltered && topChapters.length > 0 && (
                <div className="exec__top-bar">
                    <span className="exec__top-bar-title">🏆 En Yüksek Dönüşüm:</span>
                    {topChapters.map((ch, i) => (
                        <span key={ch.chapter} className="exec__top-bar-item" onClick={() => setChapter(ch.chapter)}>
                            {ch.label} <strong>%{ch.conversionRate}</strong>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function QualityItem({ icon, label, value, desc, color }: {
    icon: React.ReactNode; label: string; value: string; desc: string; color: string;
}) {
    return (
        <div className="exec__q-item">
            <div className="exec__q-icon" style={{ color, background: `${color}15` }}>{icon}</div>
            <div className="exec__q-content">
                <div className="exec__q-top">
                    <span className="exec__q-label">{label}</span>
                    <span className="exec__q-value" style={{ color }}>{value}</span>
                </div>
                <span className="exec__q-desc">{desc}</span>
            </div>
        </div>
    );
}
