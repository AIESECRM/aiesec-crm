import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NATIONAL_ROLES = ["MCP", "MCVP", "ADMIN"];

const CHAPTERS = [
    "ADANA", "ANKARA", "ANTALYA", "BURSA", "DENIZLI", "DOGU_AKDENIZ",
    "ESKISEHIR", "GAZIANTEP", "ISTANBUL", "ISTANBUL_ASYA", "BATI_ISTANBUL",
    "IZMIR", "KOCAELI", "KONYA", "KUTAHYA", "SAKARYA", "TRABZON",
];

const CHAPTER_LABELS: Record<string, string> = {
    ADANA: "Adana", ANKARA: "Ankara", ANTALYA: "Antalya", BURSA: "Bursa",
    DENIZLI: "Denizli", DOGU_AKDENIZ: "D. Akdeniz", ESKISEHIR: "Eskişehir",
    GAZIANTEP: "Gaziantep", ISTANBUL: "İstanbul", ISTANBUL_ASYA: "İst. Asya",
    BATI_ISTANBUL: "B. İstanbul", IZMIR: "İzmir", KOCAELI: "Kocaeli",
    KONYA: "Konya", KUTAHYA: "Kütahya", SAKARYA: "Sakarya", TRABZON: "Trabzon",
};

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

    const user = session.user as any;
    if (!NATIONAL_ROLES.includes(user.role)) {
        return NextResponse.json({ error: "Bu panele erişim yetkiniz yok!" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const chapterFilter = searchParams.get("chapter") || "";

    const now = Math.floor(Date.now() / 1000);
    const oneWeekAgoTs = now - 7 * 24 * 60 * 60;
    const twoWeeksAgoTs = now - 14 * 24 * 60 * 60;

    const [allCompaniesRaw, allActivitiesRaw, allOffersRaw, allUsersRaw] = await Promise.all([
        prisma.company.findMany({}),
        prisma.activity.findMany({}),
        prisma.offer.findMany({}),
        prisma.user.findMany({}),
    ]);

    const allCompanies = chapterFilter
        ? allCompaniesRaw.filter((c: any) => c.chapter === chapterFilter)
        : allCompaniesRaw;

    const companyIds = new Set(allCompanies.map((c: any) => c.id));

    const allActivities = chapterFilter
        ? allActivitiesRaw.filter((a: any) => companyIds.has(a.companyId))
        : allActivitiesRaw;

    const allOffers = chapterFilter
        ? allOffersRaw.filter((o: any) => companyIds.has(o.companyId))
        : allOffersRaw;

    const totalCompanies = allCompanies.length;
    const positiveCompanies = allCompanies.filter((c: any) => c.status === "POSITIVE").length;
    const conversionRate = totalCompanies > 0 ? Math.round((positiveCompanies / totalCompanies) * 100) : 0;
    const totalOffers = allOffers.length;
    const totalOfferValue = allOffers.reduce((sum: number, o: any) => sum + (o.value || 0), 0);
    const newOpenOffers = allOffers.filter((o: any) => o.openStatus === "NEW_OPEN").length;
    const reOpenOffers = allOffers.filter((o: any) => o.openStatus === "RE_OPEN").length;

    const thisWeekActivities = allActivities.filter((a: any) => a.createdAt >= oneWeekAgoTs).length;
    const lastWeekActivities = allActivities.filter((a: any) =>
        a.createdAt >= twoWeeksAgoTs && a.createdAt < oneWeekAgoTs
    ).length;
    const activityTrend = lastWeekActivities > 0 ? Math.round(((thisWeekActivities - lastWeekActivities) / lastWeekActivities) * 100) : 0;

    const totalColdCalls = allActivities.filter((a: any) => a.type === "COLD_CALL").length;
    const totalMeetings = allActivities.filter((a: any) => a.type === "MEETING").length;
    const totalEmails = allActivities.filter((a: any) => a.type === "EMAIL").length;
    const totalFollowUps = allActivities.filter((a: any) => a.type === "FOLLOW_UP").length;

    const meetingPlanned = allCompanies.filter((c: any) => c.status === "MEETING_PLANNED").length;
    const activePipeline = positiveCompanies + meetingPlanned;

    const noAnswer = allCompanies.filter((c: any) => c.status === "NO_ANSWER").length;
    const responseRate = totalCompanies > 0 ? Math.round(((totalCompanies - noAnswer) / totalCompanies) * 100) : 0;

    const activeUsers = chapterFilter
        ? allUsersRaw.filter((u: any) => u.chapter === chapterFilter && u.status === "ACTIVE").length
        : allUsersRaw.filter((u: any) => u.status === "ACTIVE").length;

    const funnel = [
        { stage: "cold_calls", label: "Arama", value: totalColdCalls, color: "#037EF3" },
        { stage: "meetings", label: "Toplantı", value: totalMeetings, color: "#22C55E" },
        { stage: "offers", label: "Teklif", value: totalOffers, color: "#8B5CF6" },
        { stage: "closed", label: "Pozitif Sonuç", value: positiveCompanies, color: "#F59E0B" },
    ];

    const chaptersToShow = chapterFilter ? [chapterFilter] : CHAPTERS;
    const chapterPerformance = chaptersToShow.map(ch => {
        const chCompanies = allCompaniesRaw.filter((c: any) => c.chapter === ch);
        const chCompanyIds = new Set(chCompanies.map((c: any) => c.id));
        const chActivities = allActivitiesRaw.filter((a: any) => chCompanyIds.has(a.companyId));
        const chOffers = allOffersRaw.filter((o: any) => chCompanyIds.has(o.companyId));
        const chUsers = allUsersRaw.filter((u: any) => u.chapter === ch && u.status === "ACTIVE");
        const chPositive = chCompanies.filter((c: any) => c.status === "POSITIVE").length;
        const chOfferValue = chOffers.reduce((sum: number, o: any) => sum + (o.value || 0), 0);

        return {
            chapter: ch,
            label: CHAPTER_LABELS[ch] || ch,
            companies: chCompanies.length,
            positive: chPositive,
            conversionRate: chCompanies.length > 0 ? Math.round((chPositive / chCompanies.length) * 100) : 0,
            coldCalls: chActivities.filter((a: any) => a.type === "COLD_CALL").length,
            meetings: chActivities.filter((a: any) => a.type === "MEETING").length,
            totalActivities: chActivities.length,
            offers: chOffers.length,
            offerValue: chOfferValue,
            activeUsers: chUsers.length,
        };
    }).sort((a, b) => b.totalActivities - a.totalActivities);

    const pipeline = [
        { status: "POSITIVE", label: "Pozitif", count: positiveCompanies, color: "#22C55E" },
        { status: "MEETING_PLANNED", label: "Toplantı Planlandı", count: meetingPlanned, color: "#3B82F6" },
        { status: "CALL_AGAIN", label: "Tekrar Ara", count: allCompanies.filter((c: any) => c.status === "CALL_AGAIN").length, color: "#F59E0B" },
        { status: "NO_ANSWER", label: "Cevap Yok", count: noAnswer, color: "#94A3B8" },
        { status: "NEGATIVE", label: "Negatif", count: allCompanies.filter((c: any) => c.status === "NEGATIVE").length, color: "#EF4444" },
    ];

    const productMix = [
        { product: "GTA", label: "Global Talent", count: allOffers.filter((o: any) => o.product === "GTA").length, value: allOffers.filter((o: any) => o.product === "GTA").reduce((s: number, o: any) => s + (o.value || 0), 0), color: "#037EF3" },
        { product: "GV", label: "Global Volunteer", count: allOffers.filter((o: any) => o.product === "GV").length, value: allOffers.filter((o: any) => o.product === "GV").reduce((s: number, o: any) => s + (o.value || 0), 0), color: "#22C55E" },
        { product: "GTE", label: "Global Teacher", count: allOffers.filter((o: any) => o.product === "GTE").length, value: allOffers.filter((o: any) => o.product === "GTE").reduce((s: number, o: any) => s + (o.value || 0), 0), color: "#8B5CF6" },
    ];

    const weeklyTrend = [];
    for (let w = 7; w >= 0; w--) {
        const weekStartTs = now - (w + 1) * 7 * 24 * 60 * 60;
        const weekEndTs = now - w * 7 * 24 * 60 * 60;
        const weekActs = allActivities.filter((a: any) =>
            a.createdAt >= weekStartTs && a.createdAt < weekEndTs
        );
        const weekStartDate = new Date(weekStartTs * 1000);
        const label = `${weekStartDate.getDate().toString().padStart(2, '0')}/${(weekStartDate.getMonth() + 1).toString().padStart(2, '0')}`;

        weeklyTrend.push({
            week: label,
            coldCalls: weekActs.filter((a: any) => a.type === "COLD_CALL").length,
            meetings: weekActs.filter((a: any) => a.type === "MEETING").length,
            emails: weekActs.filter((a: any) => a.type === "EMAIL").length,
            followUps: weekActs.filter((a: any) => a.type === "FOLLOW_UP").length,
            total: weekActs.length,
        });
    }

    const avgCallsPerConversion = positiveCompanies > 0 ? (totalColdCalls / positiveCompanies).toFixed(1) : "—";
    const meetingToOfferRatio = totalMeetings > 0 ? ((totalOffers / totalMeetings) * 100).toFixed(0) : "0";
    const avgActivitiesPerCompany = totalCompanies > 0 ? (allActivities.length / totalCompanies).toFixed(1) : "0";

    return NextResponse.json({
        selectedChapter: chapterFilter,
        kpis: {
            totalOffers, totalOfferValue, newOpenOffers, reOpenOffers,
            conversionRate, positiveCompanies, totalCompanies, activePipeline,
            thisWeekActivities, activityTrend, totalColdCalls, totalMeetings,
            totalEmails, totalFollowUps, totalActivities: allActivities.length,
            responseRate, activeUsers,
        },
        funnel, chapterPerformance, pipeline, productMix, weeklyTrend,
        processQuality: {
            avgCallsPerConversion, meetingToOfferRatio, responseRate, avgActivitiesPerCompany,
        },
    });
}